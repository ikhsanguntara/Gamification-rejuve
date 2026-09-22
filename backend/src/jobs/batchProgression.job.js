'use strict';

/**
 * @file batchProgression.job.js
 * @description Scheduled Midnight Job untuk transisi siklus mingguan (current_week),
 * penutupan batch otomatis, dan trigger notifikasi lonceng & WebSocket.
 */

const prisma = require('../config/db');
const { getIO, emitToRole, emitToUser } = require('../config/socket');
const notificationService = require('../modules/notifications/notification.service');

/**
 * Helper untuk mendapatkan tanggal hari ini dalam zona waktu WIB (Asia/Jakarta).
 */
const getTodayWib = () => {
  const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
};

/**
 * Hitung sisa milidetik menuju pukul 00:00:01 WIB (17:00:01 UTC).
 */
const getMsUntilNextWibMidnight = () => {
  const now = new Date();
  const nowUtcMs = now.getTime();
  const targetUtc = new Date(now);
  targetUtc.setUTCHours(17, 0, 1, 0);
  if (targetUtc.getTime() <= nowUtcMs) {
    targetUtc.setUTCDate(targetUtc.getUTCDate() + 1);
  }
  return Math.max(1000, targetUtc.getTime() - nowUtcMs);
};

/**
 * Helper menghitung durasi hari dari durationCode dan durationValue.
 */
const getUnitDays = (durationCode, durationValue = 1) => {
  const val = Number(durationValue) || 1;
  switch (durationCode?.toUpperCase()) {
    case 'DAY':
    case 'DAYS':
      return val;
    case 'WEEK':
    case 'WEEKS':
      return val * 7;
    case 'MONTH':
    case 'MONTHS':
      return val * 30;
    case 'YEAR':
    case 'YEARS':
      return val * 365;
    default:
      return val * 7;
  }
};

/**
 * Fungsi utama untuk mengevaluasi seluruh batch OPEN terhadap waktu kalender hari ini.
 */
const runBatchProgressionCheck = async () => {
  console.log('[BatchJob] Menjalankan pengecekan transisi siklus batch...');
  try {
    const today = getTodayWib();

    const openBatches = await prisma.batch.findMany({
      where: { status: 'OPEN' },
      include: {
        details: {
          include: {
            tplMission: {
              include: { details: true }
            }
          }
        },
        missions: {
          select: { missionId: true, weekOrDayNumber: true, type: true, startDate: true }
        },
        users: {
          select: { userId: true, role: true, department: true }
        }
      }
    });

    for (const batch of openBatches) {
      const journeyDetail = batch.details?.find(d => d.tplMission?.type === 'JOURNEY');
      const journeyStart = journeyDetail?.startDate ? new Date(journeyDetail.startDate) : new Date(batch.startDate);
      journeyStart.setHours(0, 0, 0, 0);

      const journeyEnd = journeyDetail?.endDate ? new Date(journeyDetail.endDate) : new Date(batch.endDate);
      journeyEnd.setHours(23, 59, 59, 999);

      // 1. Cek apakah batch sudah melewati endDate Journey
      if (today > journeyEnd) {
        // Tandai batch sebagai CLOSE jika masa Journey telah berakhir
        await prisma.batch.update({
          where: { batchId: batch.batchId },
          data: { status: 'CLOSE' }
        });

        console.log(`[BatchJob] Batch "${batch.name}" (${batch.code}) telah selesai periode Journey dan status diubah ke CLOSE.`);

        // Notifikasi ke seluruh anggota batch
        const memberIds = batch.users.map(u => u.userId);
        for (const uid of memberIds) {
          notificationService.createNotification({
            userId: uid,
            title: 'Periode Batch Selesai',
            message: `Seluruh siklus Journey pada batch "${batch.name}" telah selesai. Terima kasih atas partisipasi Anda.`,
            type: 'BATCH_COMPLETED'
          }).catch(() => {});
        }

        const io = typeof getIO === 'function' ? getIO() : null;
        if (io) {
          io.emit('batch:status_changed', {
            batchId: batch.batchId,
            status: 'CLOSE'
          });
        }
        continue;
      }

      // 2. Cek pergantian periode / minggu (current_week)
      const diffTime = today.getTime() - journeyStart.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0) {
        const journeyDurCode = journeyDetail?.tplMission?.durationCode || 'WEEK';
        const journeyDurVal = journeyDetail?.tplMission?.durationValue || 1;
        const journeyUnitDays = getUnitDays(journeyDurCode, journeyDurVal);

        const journeyMissions = batch.missions?.filter(m => m.type === 'JOURNEY') || [];
        const maxMissionWeek = journeyMissions.reduce((max, m) => Math.max(max, m.weekOrDayNumber || 1), 0);
        const totalPeriods = Math.max(
          maxMissionWeek,
          journeyDetail?.tplMission?.details?.reduce((max, d) => Math.max(max, d.durationNumber || 1), 1) || 1,
          Number(journeyDurVal) || 1
        );

        const targetWeek = Math.min(Math.floor(diffDays / journeyUnitDays) + 1, totalPeriods);

        if (targetWeek > batch.currentWeek) {
          await prisma.batch.update({
            where: { batchId: batch.batchId },
            data: { currentWeek: targetWeek }
          });

          console.log(`[BatchJob] Batch "${batch.name}" naik ke Periode ${targetWeek} (durasi: ${journeyDurCode}, unitDays: ${journeyUnitDays}).`);

          const isDay = journeyDurCode?.toUpperCase() === 'DAY' || journeyDurCode?.toUpperCase() === 'DAYS';
          const periodUnitLabel = isDay ? 'Hari' : 'Minggu';

          // Broadcast notifikasi ke seluruh anggota batch
          for (const u of batch.users) {
            notificationService.createNotification({
              userId: u.userId,
              title: `Siklus ${periodUnitLabel} ${targetWeek} Dimulai`,
              message: `Periode observasi & evaluasi ${periodUnitLabel} ke-${targetWeek} untuk batch "${batch.name}" resmi dibuka.`,
              type: 'WEEK_STARTED'
            }).catch(() => {});
          }

          const io = typeof getIO === 'function' ? getIO() : null;
          if (io) {
            io.emit('batch:week_changed', {
              batchId: batch.batchId,
              currentWeek: targetWeek
            });
          }
        }

        // Buka kunci misi Journey untuk seluruh periode yang sudah berjalan (weekOrDayNumber <= effectivePeriod ATAU startDate <= today)
        const effectivePeriod = Math.max(targetWeek, batch.currentWeek);
        const unlocked = await prisma.userMission.updateMany({
          where: {
            mission: {
              batchId: batch.batchId,
              type: 'JOURNEY',
              OR: [
                { weekOrDayNumber: { lte: effectivePeriod } },
                { startDate: { lte: today } }
              ]
            },
            status: 'LOCKED'
          },
          data: { status: 'ACTIVE' }
        });

        if (unlocked.count > 0) {
          console.log(`[BatchJob] Batch "${batch.name}": Membuka ${unlocked.count} kartu misi Journey yang sebelumnya LOCKED.`);
        }

        // Auto-forward misi Journey dari periode lampau yang belum dinilai SL ke District Manager
        const autoForwarded = await prisma.userMission.updateMany({
          where: {
            mission: {
              batchId: batch.batchId,
              type: 'JOURNEY',
              OR: [
                { weekOrDayNumber: { lt: effectivePeriod } },
                { endDate: { lt: today } }
              ]
            },
            status: { in: ['ACTIVE', 'LOCKED'] },
            tlScore: null
          },
          data: {
            status: 'SCORED_BY_TL',
            tlNotes: 'Diteruskan otomatis ke District Manager: Store Leader tidak melakukan penilaian pada periode ini.'
          }
        });

        if (autoForwarded.count > 0) {
          console.log(`[BatchJob] Batch "${batch.name}": Meneruskan otomatis ${autoForwarded.count} misi periode lampau ke DM (SL tidak mengisi).`);
        }
      }
    }

    console.log('[BatchJob] Selesai memproses pengecekan batch.');
    return { success: true };
  } catch (error) {
    console.error('[BatchJob] Error saat menjalankan transisi batch:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Jadwalkan eksekusi harian pada pukul 00:00:01 WIB.
 */
const scheduleNextMidnight = () => {
  const msUntilMidnight = getMsUntilNextWibMidnight();

  setTimeout(async () => {
    await runBatchProgressionCheck();
    scheduleNextMidnight();
  }, msUntilMidnight);

  console.log(`[BatchJob] Jadwal berikutnya diset dalam ${(msUntilMidnight / 1000 / 60).toFixed(1)} menit (pukul 00:00:01 WIB).`);
};

/**
 * Inisialisasi job saat server start:
 * 1. Jalankan 1x saat boot untuk memastikan batch up-to-date.
 * 2. Jadwalkan eksekusi berkala setiap tengah malam.
 */
const initBatchProgressionJob = () => {
  // Jalankan catch-up check saat startup setelah jeda singkat (2 detik)
  setTimeout(() => {
    runBatchProgressionCheck();
  }, 2000);

  scheduleNextMidnight();
  console.log('⏰ Batch Progression Midnight Job initialized.');
};

module.exports = {
  initBatchProgressionJob,
  runBatchProgressionCheck
};
