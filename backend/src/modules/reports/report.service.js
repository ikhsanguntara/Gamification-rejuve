'use strict';

/**
 * @file report.service.js
 * @description Layanan bisnis untuk Laporan Insentif Pembimbingan Buddy & Audit Traceability Pengguna.
 */

const ExcelJS = require('exceljs');
const prisma = require('../../config/db');

/**
 * Format tanggal ke format lokal Indonesia (DD/MM/YYYY)
 */
const formatDate = (dateVal) => {
  if (!dateVal) return '-';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Helper untuk mencari daftar batchId yang beririsan dengan filter periode (startDate - endDate)
 * dan filter batchId / batchCode yang dikirimkan client.
 */
const resolveBatchFilter = async (query = {}) => {
  const { startDate, endDate, batchId, batchCode } = query;
  const batchConditions = [];

  if (startDate && endDate) {
    batchConditions.push({
      startDate: { lte: new Date(endDate) },
      endDate: { gte: new Date(startDate) }
    });
  } else if (startDate) {
    batchConditions.push({
      endDate: { gte: new Date(startDate) }
    });
  } else if (endDate) {
    batchConditions.push({
      startDate: { lte: new Date(endDate) }
    });
  }

  if (batchId) {
    batchConditions.push({ batchId });
  }

  if (batchCode) {
    batchConditions.push({ code: batchCode });
  }

  if (batchConditions.length === 0) {
    return null; // Tidak ada filter batch spesifik
  }

  const matchingBatches = await prisma.batch.findMany({
    where: { AND: batchConditions },
    select: { batchId: true, code: true, name: true, startDate: true, endDate: true }
  });

  return matchingBatches.map(b => b.batchId);
};

/**
 * Helper untuk menyusun array AND conditions untuk filtering User / Crew pada modul laporan.
 */
const buildUserFilterConditions = async (query = {}, currentUser = null) => {
  const andConditions = [];

  // Role Scoping
  if (currentUser) {
    const roleCode = (currentUser.role?.roleCode || currentUser.role || '').toUpperCase();
    const currentUserId = currentUser.userId || currentUser.id;

    if (roleCode === 'STORE_LEADER') {
      const slDepts = await prisma.department.findMany({
        where: {
          OR: [
            { userSlId: currentUserId },
            ...(currentUser.departmentId ? [{ departmentId: currentUser.departmentId }] : [])
          ]
        },
        select: { departmentId: true }
      });
      const slDeptIds = slDepts.map(d => d.departmentId);
      andConditions.push({
        OR: [
          { userBuddyId: currentUserId },
          ...(slDeptIds.length > 0 ? [{ departmentId: { in: slDeptIds } }] : [])
        ]
      });
    } else if (roleCode === 'DISTRICT_MANAGER') {
      const dmDepts = await prisma.department.findMany({
        where: {
          OR: [
            { userDmId: currentUserId },
            ...(currentUser.departmentId ? [{ departmentId: currentUser.departmentId }] : [])
          ]
        },
        select: { departmentId: true }
      });
      const dmDeptIds = dmDepts.map(d => d.departmentId);
      andConditions.push({ departmentId: { in: dmDeptIds } });
    }
  }

  // Filter Store / Department
  if (query.storeCode || query.departmentCode) {
    const code = query.storeCode || query.departmentCode;
    andConditions.push({
      department: { departmentCode: code }
    });
  } else if (query.departmentId) {
    andConditions.push({ departmentId: query.departmentId });
  }

  // Filter DM
  if (query.dmId || query.userDmId) {
    const dmId = query.dmId || query.userDmId;
    andConditions.push({
      department: { userDmId: dmId }
    });
  }

  // Filter Batch & Periode Tanggal Journey
  const matchedBatchIds = await resolveBatchFilter(query);
  if (matchedBatchIds !== null) {
    if (matchedBatchIds.length === 0) {
      andConditions.push({ batchId: '00000000-0000-0000-0000-000000000000' });
    } else {
      andConditions.push({
        OR: [
          { batchId: { in: matchedBatchIds } },
          { activeBatchId: { in: matchedBatchIds } }
        ]
      });
    }
  }

  // Pencarian Teks
  if (query.search || query.q) {
    const s = String(query.search || query.q).trim();
    andConditions.push({
      OR: [
        { name: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } }
      ]
    });
  }

  return andConditions;
};

/**
 * 1. GET BUDDY INCENTIVE REPORT
 * Menghasilkan rekapitulasi data bimbingan mentor buddy untuk dasar perhitungan insentif HR.
 */
const getBuddyIncentiveReport = async (query = {}, currentUser = null) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const isExportAll = query.exportAll === true || query.exportAll === 'true';

  // 1. Filter dasar pencarian Buddy
  const whereBuddy = {
    OR: [
      { isBuddy: true },
      { mentees: { some: {} } }
    ],
    isActive: true
  };

  // 1b. Role Scoping untuk STORE_LEADER dan DISTRICT_MANAGER
  if (currentUser) {
    const roleCode = (currentUser.role?.roleCode || currentUser.role || '').toUpperCase();
    const currentUserId = currentUser.userId || currentUser.id;

    if (roleCode === 'STORE_LEADER') {
      whereBuddy.userId = currentUserId;
    } else if (roleCode === 'DISTRICT_MANAGER') {
      const dmDepts = await prisma.department.findMany({
        where: {
          OR: [
            { userDmId: currentUserId },
            ...(currentUser.departmentId ? [{ departmentId: currentUser.departmentId }] : [])
          ]
        },
        select: { departmentId: true }
      });
      const dmDeptIds = dmDepts.map(d => d.departmentId);
      whereBuddy.departmentId = { in: dmDeptIds };
    }
  }

  if (query.storeCode || query.departmentCode) {
    const code = query.storeCode || query.departmentCode;
    whereBuddy.department = { departmentCode: code };
  } else if (query.departmentId) {
    whereBuddy.departmentId = query.departmentId;
  }

  if (query.dmId || query.userDmId) {
    const dmId = query.dmId || query.userDmId;
    whereBuddy.department = {
      ...(whereBuddy.department || {}),
      userDmId: dmId
    };
  }

  if (query.search || query.q) {
    const s = String(query.search || query.q).trim();
    whereBuddy.AND = [
      {
        OR: [
          { name: { contains: s, mode: 'insensitive' } },
          { email: { contains: s, mode: 'insensitive' } }
        ]
      }
    ];
  }

  // Ambil seluruh Buddy yang sesuai kriteria
  const buddiesList = await prisma.user.findMany({
    where: whereBuddy,
    select: {
      userId: true,
      name: true,
      email: true,
      departmentId: true,
      department: {
        select: {
          departmentId: true,
          departmentCode: true,
          departmentName: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  const buddyIds = buddiesList.map(b => b.userId);

  // 2. Ambil seluruh mentee (CREW) yang dibimbing oleh para buddy tersebut
  const whereMentee = {
    userBuddyId: { in: buddyIds },
    role: { roleCode: 'CREW' },
    isActive: true
  };

  const matchedBatchIds = await resolveBatchFilter(query);
  if (matchedBatchIds !== null) {
    if (matchedBatchIds.length === 0) {
      whereMentee.batchId = '00000000-0000-0000-0000-000000000000';
    } else {
      whereMentee.OR = [
        { batchId: { in: matchedBatchIds } },
        { activeBatchId: { in: matchedBatchIds } }
      ];
    }
  }

  if (query.storeCode || query.departmentCode) {
    whereMentee.department = { departmentCode: query.storeCode || query.departmentCode };
  } else if (query.departmentId) {
    whereMentee.departmentId = query.departmentId;
  }

  if (query.dmId || query.userDmId) {
    whereMentee.department = {
      ...(whereMentee.department || {}),
      userDmId: query.dmId || query.userDmId
    };
  }

  const mentees = await prisma.user.findMany({
    where: whereMentee,
    select: {
      userId: true,
      name: true,
      email: true,
      userBuddyId: true,
      department: {
        select: {
          departmentCode: true,
          departmentName: true
        }
      },
      batch: {
        select: {
          batchId: true,
          code: true,
          name: true,
          status: true,
          startDate: true,
          endDate: true
        }
      },
      activeBatch: {
        select: {
          batchId: true,
          code: true,
          name: true,
          status: true,
          startDate: true,
          endDate: true
        }
      }
    }
  });

  const menteeIds = mentees.map(m => m.userId);

  // 3. Ambil misi bertipe BUDDY (Pre-Batch 3 Hari) untuk seluruh mentee
  const userMissions = await prisma.userMission.findMany({
    where: {
      userId: { in: menteeIds },
      mission: { type: 'BUDDY' }
    },
    select: {
      userMissionId: true,
      userId: true,
      status: true,
      tlScore: true,
      finalScore: true,
      tlScoredAt: true,
      updatedAt: true,
      mission: {
        select: {
          missionId: true,
          missionTitle: true,
          category: true,
          type: true,
          batchId: true
        }
      }
    }
  });

  // Petakan misi per mentee
  const missionsByMentee = new Map();
  userMissions.forEach(um => {
    if (!missionsByMentee.has(um.userId)) {
      missionsByMentee.set(um.userId, []);
    }
    missionsByMentee.get(um.userId).push(um);
  });

  // Petakan mentee yang telah dievaluasi per buddy
  const menteesByBuddy = new Map();
  mentees.forEach(m => {
    const bId = m.userBuddyId;
    if (!menteesByBuddy.has(bId)) {
      menteesByBuddy.set(bId, []);
    }

    const mBatch = m.batch || m.activeBatch;
    const mList = missionsByMentee.get(m.userId) || [];
    const totalIndicators = mList.length;
    const evaluatedMissions = mList.filter(item => item.status === 'COMPLETED' || item.tlScore !== null);
    const evaluatedCount = evaluatedMissions.length;

    const scoredMissions = mList.filter(item => (item.finalScore !== null || item.tlScore !== null));
    const avgScore = scoredMissions.length > 0
      ? parseFloat((scoredMissions.reduce((acc, curr) => acc + (curr.finalScore ?? curr.tlScore ?? 0), 0) / scoredMissions.length).toFixed(1))
      : 0;

    const isCompleted = totalIndicators > 0 && evaluatedCount === totalIndicators;

    // Cari tanggal penilaian terakhir
    const latestDate = scoredMissions.reduce((latest, curr) => {
      const d = curr.tlScoredAt || curr.updatedAt;
      return d && (!latest || new Date(d) > new Date(latest)) ? d : latest;
    }, null);

    menteesByBuddy.get(bId).push({
      menteeId: m.userId,
      menteeName: m.name,
      menteeEmail: m.email,
      departmentName: m.department?.departmentName || '-',
      departmentCode: m.department?.departmentCode || '-',
      batchId: mBatch?.batchId || null,
      batchCode: mBatch?.code || '-',
      batchName: mBatch?.name || '-',
      status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
      isCompleted,
      totalIndicators,
      evaluatedCount,
      avgScore,
      completedAt: isCompleted ? latestDate : null,
      reportUrl: mBatch ? `/api/evaluations/buddy-report/${m.userId}?batchId=${mBatch.batchId}` : null
    });
  });

  // 4. Kalkulasi data rekapitulasi per Buddy
  const aggregatedBuddies = buddiesList.map(buddy => {
    const menteeList = menteesByBuddy.get(buddy.userId) || [];
    const totalAssigned = menteeList.length;
    const completedCount = menteeList.filter(m => m.isCompleted).length;
    const inProgressCount = totalAssigned - completedCount;

    const evaluatedMentees = menteeList.filter(m => m.avgScore > 0);
    const avgScoreGiven = evaluatedMentees.length > 0
      ? parseFloat((evaluatedMentees.reduce((acc, curr) => acc + curr.avgScore, 0) / evaluatedMentees.length).toFixed(1))
      : 0;

    return {
      buddyId: buddy.userId,
      buddyName: buddy.name,
      buddyEmail: buddy.email,
      departmentId: buddy.departmentId,
      departmentName: buddy.department?.departmentName || 'Gerai Re.juve',
      departmentCode: buddy.department?.departmentCode || '-',
      completedCount,
      inProgressCount,
      totalAssigned,
      avgScoreGiven,
      isEligibleForIncentive: completedCount > 0,
      incentiveUnits: completedCount, // Jumlah kelayakan insentif berdasarkan mentee yang tuntas
      mentees: menteeList
    };
  });

  // Urutkan: Mentor dengan bimbingan tuntas terbanyak di urutan atas
  aggregatedBuddies.sort((a, b) => {
    if (b.completedCount !== a.completedCount) {
      return b.completedCount - a.completedCount;
    }
    return a.buddyName.localeCompare(b.buddyName);
  });

  // Ringkasan Global
  const totalBuddies = aggregatedBuddies.length;
  const totalMenteesAssigned = aggregatedBuddies.reduce((sum, b) => sum + b.totalAssigned, 0);
  const totalMenteesCompleted = aggregatedBuddies.reduce((sum, b) => sum + b.completedCount, 0);
  const totalMenteesInProgress = aggregatedBuddies.reduce((sum, b) => sum + b.inProgressCount, 0);

  const paginatedBuddies = isExportAll
    ? aggregatedBuddies
    : aggregatedBuddies.slice((page - 1) * limit, page * limit);

  return {
    summary: {
      totalBuddies,
      totalMenteesAssigned,
      totalMenteesCompleted,
      totalMenteesInProgress,
      eligibleBuddiesCount: aggregatedBuddies.filter(b => b.isEligibleForIncentive).length
    },
    buddies: paginatedBuddies,
    pagination: {
      total: totalBuddies,
      page,
      limit,
      totalPages: Math.ceil(totalBuddies / limit) || 1
    }
  };
};

/**
 * 2. EXPORT BUDDY INCENTIVE REPORT TO EXCEL (.XLSX)
 * Membangun spreadsheet siap pakai dengan 2 sheet (Rekap per Buddy & Rincian Mentee).
 */
const exportBuddyIncentiveExcel = async (query = {}, currentUser = null) => {
  const reportData = await getBuddyIncentiveReport({ ...query, exportAll: true }, currentUser);
  const { summary, buddies } = reportData;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Re.juve Gamification Platform';
  workbook.created = new Date();

  // ─── SHEET 1: REKAPITULASI INSENTIF BUDDY ─────────────────────────────────
  const wsSummary = workbook.addWorksheet('Rekap Insentif Buddy', {
    views: [{ showGridLines: true }]
  });

  // Judul & Banner Laporan
  wsSummary.mergeCells('A1:I1');
  const titleCell = wsSummary.getCell('A1');
  titleCell.value = 'RE.JUVE — LAPORAN REKAPITULASI INSENTIF PEMBIMBINGAN BUDDY';
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF831843' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  wsSummary.getRow(1).height = 32;

  // Metadata Cetak
  wsSummary.mergeCells('A2:I2');
  const metaCell = wsSummary.getCell('A2');
  metaCell.value = `Tanggal Ekspor: ${formatDate(new Date())} | Total Buddy: ${summary.totalBuddies} | Total Mentee Tuntas (Hak Insentif): ${summary.totalMenteesCompleted} Kru`;
  metaCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  metaCell.alignment = { vertical: 'middle', horizontal: 'center' };
  wsSummary.getRow(2).height = 20;

  wsSummary.addRow([]); // Baris kosong 3

  // Header Kolom Tabel (Baris 4)
  const summaryHeaders = [
    'No',
    'Nama Store Leader (Buddy)',
    'Email Buddy',
    'Kode Gerai',
    'Nama Gerai / Toko',
    'Mentee Selesai (Hak Insentif)',
    'Mentee In-Progress',
    'Total Ditugaskan',
    'Rata-rata Skor Bimbingan'
  ];
  wsSummary.addRow(summaryHeaders);
  const headerRow = wsSummary.getRow(4);
  headerRow.height = 26;
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9D174D' } };
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF6B133A' } },
      left: { style: 'thin', color: { argb: 'FF6B133A' } },
      bottom: { style: 'medium', color: { argb: 'FF4A0D28' } },
      right: { style: 'thin', color: { argb: 'FF6B133A' } }
    };
  });

  // Isi Data Sheet 1
  buddies.forEach((b, idx) => {
    const row = wsSummary.addRow([
      idx + 1,
      b.buddyName,
      b.buddyEmail,
      b.departmentCode,
      b.departmentName,
      b.completedCount,
      b.inProgressCount,
      b.totalAssigned,
      b.avgScoreGiven > 0 ? b.avgScoreGiven : '-'
    ]);

    row.height = 20;
    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Calibri', size: 10 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
      if (colNum === 1 || colNum === 4 || colNum >= 6) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }

      // Beri highlight hijau muda pada kolom insentif jika > 0
      if (colNum === 6 && b.completedCount > 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
        cell.font = { bold: true, color: { argb: 'FF166534' } };
      }
    });
  });

  // Baris Total Akumulasi di Bawah Tabel
  const totalRowIndex = wsSummary.rowCount + 1;
  const totalRow = wsSummary.addRow([
    'TOTAL',
    '',
    '',
    '',
    '',
    summary.totalMenteesCompleted,
    summary.totalMenteesInProgress,
    summary.totalMenteesAssigned,
    ''
  ]);
  wsSummary.mergeCells(`A${totalRowIndex}:E${totalRowIndex}`);
  totalRow.height = 22;
  totalRow.eachCell((cell, colNum) => {
    cell.font = { name: 'Calibri', size: 10, bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    cell.border = {
      top: { style: 'double', color: { argb: 'FF94A3B8' } },
      bottom: { style: 'double', color: { argb: 'FF94A3B8' } }
    };
    cell.alignment = { vertical: 'middle', horizontal: colNum >= 6 ? 'center' : 'center' };
  });

  wsSummary.columns = [
    { width: 6 },
    { width: 28 },
    { width: 32 },
    { width: 14 },
    { width: 30 },
    { width: 20 },
    { width: 18 },
    { width: 16 },
    { width: 20 }
  ];

  // ─── SHEET 2: RINCIAN MENTEE PER BUDDY ───────────────────────────────────
  const wsDetail = workbook.addWorksheet('Rincian Mentee', {
    views: [{ showGridLines: true }]
  });

  wsDetail.mergeCells('A1:J1');
  const titleDetail = wsDetail.getCell('A1');
  titleDetail.value = 'RINCIAN REKAPITULASI MENTEE KRU BARU PER BUDDY';
  titleDetail.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  titleDetail.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF831843' } };
  titleDetail.alignment = { vertical: 'middle', horizontal: 'center' };
  wsDetail.getRow(1).height = 28;

  const detailHeaders = [
    'No',
    'Nama Store Leader (Buddy)',
    'Nama Mentee (Kru Baru)',
    'Email Mentee',
    'Gerai Mentee',
    'Kode Batch',
    'Status Evaluasi',
    'Indikator Tuntas',
    'Rata-rata Skor',
    'Tanggal Tuntas Dinilai'
  ];
  wsDetail.addRow(detailHeaders);
  const detailHeaderRow = wsDetail.getRow(2);
  detailHeaderRow.height = 24;
  detailHeaderRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9D174D' } };
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF6B133A' } },
      left: { style: 'thin', color: { argb: 'FF6B133A' } },
      bottom: { style: 'medium', color: { argb: 'FF4A0D28' } },
      right: { style: 'thin', color: { argb: 'FF6B133A' } }
    };
  });

  let detailIdx = 1;
  buddies.forEach(buddy => {
    (buddy.mentees || []).forEach(mentee => {
      const row = wsDetail.addRow([
        detailIdx++,
        buddy.buddyName,
        mentee.menteeName,
        mentee.menteeEmail,
        `${mentee.departmentName} (${mentee.departmentCode})`,
        mentee.batchCode,
        mentee.status,
        `${mentee.evaluatedCount}/${mentee.totalIndicators}`,
        mentee.avgScore > 0 ? mentee.avgScore : '-',
        mentee.completedAt ? formatDate(mentee.completedAt) : '-'
      ]);

      row.height = 19;
      row.eachCell((cell, colNum) => {
        cell.font = { name: 'Calibri', size: 9.5 };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
        if (colNum === 1 || colNum === 6 || colNum === 7 || colNum === 8 || colNum === 9 || colNum === 10) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }

        if (colNum === 7) {
          if (mentee.status === 'COMPLETED') {
            cell.font = { bold: true, color: { argb: 'FF166534' } };
          } else {
            cell.font = { color: { argb: 'FFB45309' } };
          }
        }
      });
    });
  });

  wsDetail.columns = [
    { width: 6 },
    { width: 26 },
    { width: 26 },
    { width: 30 },
    { width: 30 },
    { width: 18 },
    { width: 16 },
    { width: 16 },
    { width: 16 },
    { width: 20 }
  ];

  return await workbook.xlsx.writeBuffer();
};


/**
 * 2b. GET BUDDY INCENTIVE DETAIL BY USER ID
 * Mengambil detail bimbingan mentor buddy untuk satu Store Leader tertentu,
 * mencakup profil, metrik insentif, dan rincian seluruh mentee.
 */
const getBuddyIncentiveDetailByUserId = async (userId, query = {}) => {
  if (!userId) {
    throw new Error('Parameter userId wajib diisi.');
  }

  const user = await prisma.user.findUnique({
    where: { userId },
    select: {
      userId: true,
      name: true,
      email: true,
      phone: true,
      gender: true,
      avatarUrl: true,
      isBuddy: true,
      isActive: true,
      departmentId: true,
      department: {
        select: {
          departmentId: true,
          departmentCode: true,
          departmentName: true
        }
      },
      role: {
        select: {
          roleId: true,
          roleCode: true,
          roleName: true
        }
      }
    }
  });

  if (!user) return null;

  // Tarik data laporan buddy dengan filter batchId jika ada
  const reportData = await getBuddyIncentiveReport({ ...query, exportAll: true });
  const buddyReport = reportData.buddies.find(b => b.buddyId === userId);

  return {
    buddy: {
      userId: user.userId,
      name: user.name,
      email: user.email,
      phone: user.phone || '-',
      gender: user.gender || '-',
      avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`,
      roleCode: user.role?.roleCode || '-',
      roleName: user.role?.roleName || '-',
      departmentId: user.departmentId,
      departmentCode: user.department?.departmentCode || '-',
      departmentName: user.department?.departmentName || 'Gerai Re.juve',
      isBuddy: Boolean(user.isBuddy),
      isActive: user.isActive
    },
    metrics: buddyReport ? {
      totalAssigned: buddyReport.totalAssigned,
      completedCount: buddyReport.completedCount,
      inProgressCount: buddyReport.inProgressCount,
      avgScoreGiven: buddyReport.avgScoreGiven,
      isEligibleForIncentive: buddyReport.isEligibleForIncentive,
      incentiveStatus: buddyReport.isEligibleForIncentive ? 'ELIGIBLE' : 'PENDING'
    } : {
      totalAssigned: 0,
      completedCount: 0,
      inProgressCount: 0,
      avgScoreGiven: 0,
      isEligibleForIncentive: false,
      incentiveStatus: 'NOT_APPLICABLE'
    },
    mentees: buddyReport ? buddyReport.mentees : []
  };
};


/**
 * 2c. EXPORT SINGLE BUDDY INCENTIVE TO EXCEL (.XLSX)
 * Mengunduh lembar rekapitulasi dan rincian mentee khusus 1 Store Leader/Buddy.
 */
const exportSingleBuddyIncentiveExcel = async (userId, query = {}) => {
  const detail = await getBuddyIncentiveDetailByUserId(userId, query);
  if (!detail) return null;

  const { buddy, metrics, mentees } = detail;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Re.juve Gamification Platform';
  workbook.created = new Date();

  const ws = workbook.addWorksheet(`Insentif - ${buddy.name.slice(0, 20)}`, {
    views: [{ showGridLines: true }]
  });

  // Judul & Banner Laporan (A1:I1)
  ws.mergeCells('A1:I1');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'RE.JUVE — LEMBAR REKAPITULASI INSENTIF PEMBIMBINGAN BUDDY';
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF831843' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(1).height = 32;

  // Profil Buddy (A2:I2)
  ws.mergeCells('A2:I2');
  const metaCell = ws.getCell('A2');
  metaCell.value = `Nama Buddy: ${buddy.name} | Email: ${buddy.email} | Gerai: [${buddy.departmentCode}] ${buddy.departmentName} | Tanggal Ekspor: ${formatDate(new Date())}`;
  metaCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  metaCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(2).height = 20;

  ws.addRow([]); // Baris 3 kosong

  // Summary Metrics Card (Baris 4-5)
  ws.mergeCells('A4:B4');
  ws.getCell('A4').value = 'Total Ditugaskan';
  ws.mergeCells('A5:B5');
  ws.getCell('A5').value = metrics.totalAssigned;

  ws.mergeCells('C4:D4');
  ws.getCell('C4').value = 'Mentee Tuntas (Hak Insentif)';
  ws.mergeCells('C5:D5');
  ws.getCell('C5').value = metrics.completedCount;

  ws.mergeCells('E4:F4');
  ws.getCell('E4').value = 'Mentee In-Progress';
  ws.mergeCells('E5:F5');
  ws.getCell('E5').value = metrics.inProgressCount;

  ws.mergeCells('G4:H4');
  ws.getCell('G4').value = 'Rata-rata Skor Bimbingan';
  ws.mergeCells('G5:H5');
  ws.getCell('G5').value = metrics.avgScoreGiven;

  ws.getCell('I4').value = 'Status Insentif';
  ws.getCell('I5').value = metrics.isEligibleForIncentive ? 'MEMENUHI SYARAT (ELIGIBLE)' : 'BELUM MEMENUHI';

  // Format KPI box
  ['A4', 'C4', 'E4', 'G4', 'I4'].forEach(cellRef => {
    const c = ws.getCell(cellRef);
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDF2F8' } };
    c.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF9D174D' } };
    c.alignment = { vertical: 'middle', horizontal: 'center' };
    c.border = { top: { style: 'thin', color: { argb: 'FFCBD5E1' } }, bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } }, left: { style: 'thin', color: { argb: 'FFCBD5E1' } }, right: { style: 'thin', color: { argb: 'FFCBD5E1' } } };
  });
  ['A5', 'C5', 'E5', 'G5', 'I5'].forEach(cellRef => {
    const c = ws.getCell(cellRef);
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    c.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF1E293B' } };
    c.alignment = { vertical: 'middle', horizontal: 'center' };
    c.border = { top: { style: 'thin', color: { argb: 'FFCBD5E1' } }, bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } }, left: { style: 'thin', color: { argb: 'FFCBD5E1' } }, right: { style: 'thin', color: { argb: 'FFCBD5E1' } } };
  });
  ws.getRow(4).height = 20;
  ws.getRow(5).height = 26;

  ws.addRow([]); // Baris 6 kosong

  // Header Kolom Mentee (Baris 7)
  const menteeHeaders = [
    'No',
    'Nama Mentee (Kru)',
    'Email Mentee',
    'Kode Gerai',
    'Nama Gerai Penempatan',
    'Batch',
    'Status Evaluasi 3 Hari',
    'Rata-rata Nilai Skor',
    'Tanggal Tuntas Evaluasi'
  ];
  ws.addRow(menteeHeaders);
  const headerRow = ws.getRow(7);
  headerRow.height = 26;
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9D174D' } };
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF6B133A' } },
      left: { style: 'thin', color: { argb: 'FF6B133A' } },
      bottom: { style: 'medium', color: { argb: 'FF4A0D28' } },
      right: { style: 'thin', color: { argb: 'FF6B133A' } }
    };
  });

  // Data Mentee
  mentees.forEach((m, idx) => {
    const row = ws.addRow([
      idx + 1,
      m.menteeName,
      m.menteeEmail,
      m.departmentCode,
      m.departmentName,
      m.batchCode,
      m.status === 'COMPLETED' ? 'LULUS / SELESAI' : 'DALAM PROSES',
      m.avgScore,
      formatDate(m.completedAt)
    ]);
    row.height = 22;
    const isEven = idx % 2 === 0;
    const bgArgb = isEven ? 'FFFFFFFF' : 'FFFDF2F8';

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
      cell.font = { name: 'Calibri', size: 10 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
      if ([1, 4, 6, 7, 8, 9].includes(colNumber)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
      if (colNumber === 7) {
        cell.font = {
          name: 'Calibri',
          size: 10,
          bold: true,
          color: { argb: m.status === 'COMPLETED' ? 'FF15803D' : 'FF1D4ED8' }
        };
      }
    });
  });

  ws.columns = [
    { width: 6 },
    { width: 28 },
    { width: 30 },
    { width: 16 },
    { width: 26 },
    { width: 18 },
    { width: 24 },
    { width: 20 },
    { width: 22 }
  ];

  return await workbook.xlsx.writeBuffer();
};

/**
 * 3. GET USER TRACEABILITY LIST (Active New Recruit Report)
 * Menyediakan daftar pencarian dan filtering pengguna untuk modul Traceability,
 * memenuhi seluruh 17 kolom spesifikasi Active new Recruit Report.
 */
const getUserTraceabilityList = async (query = {}, currentUser = null) => {
  const isExportAll = query.exportAll === true || query.exportAll === 'true';
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const andConditions = await buildUserFilterConditions(query, currentUser);
  if (query.role) {
    andConditions.push({ role: { roleCode: String(query.role).toUpperCase() } });
  } else {
    andConditions.push({ role: { roleCode: 'CREW' } });
  }
  const where = andConditions.length > 0 ? { AND: andConditions } : {};

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip: isExportAll ? undefined : skip,
      take: isExportAll ? undefined : limit,
      select: {
        userId: true,
        name: true,
        email: true,
        gender: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        stars: true,
        points: true,
        level: true,
        isBuddy: true,
        role: {
          select: {
            roleId: true,
            roleCode: true,
            roleName: true
          }
        },
        departmentId: true,
        department: {
          select: {
            departmentId: true,
            departmentCode: true,
            departmentName: true,
            userSlId: true,
            userDmId: true
          }
        },
        userBuddy: {
          select: {
            userId: true,
            name: true,
            email: true,
            department: {
              select: {
                departmentCode: true,
                departmentName: true
              }
            }
          }
        },
        batch: {
          select: {
            batchId: true,
            code: true,
            name: true,
            status: true
          }
        },
        activeBatch: {
          select: {
            batchId: true,
            code: true,
            name: true,
            status: true
          }
        },
        missions: {
          select: {
            userMissionId: true,
            status: true,
            tlScore: true,
            tlScoredAt: true,
            dmScore: true,
            dmReviewedAt: true,
            finalScore: true,
            submittedAt: true,
            createdAt: true,
            mission: {
              select: {
                type: true,
                weekOrDayNumber: true
              }
            }
          }
        },
        createdAt: true
      },
      orderBy: { name: 'asc' }
    })
  ]);

  // Resolusi nama Store Leader (Assignment SL) per departemen penempatan kerja
  const deptIds = users.map(u => u.departmentId).filter(Boolean);
  const storeLeaders = deptIds.length > 0
    ? await prisma.user.findMany({
        where: {
          departmentId: { in: deptIds },
          role: { roleCode: { in: ['STORE_LEADER', 'SUPERVISOR'] } },
          isActive: true
        },
        select: {
          userId: true,
          name: true,
          departmentId: true
        }
      })
    : [];

  const slByDept = new Map();
  storeLeaders.forEach(sl => slByDept.set(sl.departmentId, sl.name));

  const now = Date.now();

  const formattedUsers = users.map(u => {
    const currentBatch = u.activeBatch || u.batch;
    const allMissions = u.missions || [];

    // 1. Evaluasi Status Buddy (Pre-Batch 3 Hari)
    const buddyMissions = allMissions.filter(m => m.mission?.type === 'BUDDY');
    let buddyStatus = 'NOT_STARTED';
    if (buddyMissions.length > 0) {
      const completed = buddyMissions.filter(m => m.status === 'COMPLETED' || m.tlScore !== null);
      if (completed.length === buddyMissions.length) {
        buddyStatus = 'COMPLETED';
      } else if (completed.length > 0) {
        buddyStatus = 'IN_PROGRESS';
      }
    }

    // 2. Evaluasi Status per Minggu Journey (Week 1, 2, 3)
    const resolveWeekStatus = (weekNum) => {
      const weekMissions = allMissions.filter(m => m.mission?.type === 'JOURNEY' && m.mission?.weekOrDayNumber === weekNum);
      if (weekMissions.length === 0) return 'NOT_STARTED';
      if (weekMissions.every(m => m.status === 'COMPLETED')) return 'COMPLETED';
      if (weekMissions.some(m => m.status === 'SCORED_BY_TL' || (m.tlScore !== null && m.dmScore === null && m.status !== 'COMPLETED'))) return 'PENDING_REVIEW';
      if (weekMissions.some(m => m.status === 'ACTIVE' || m.status === 'SUBMITTED')) return 'IN_PROGRESS';
      if (weekMissions.every(m => m.status === 'LOCKED')) return 'LOCKED';
      return 'IN_PROGRESS';
    };

    const week1Status = resolveWeekStatus(1);
    const week2Status = resolveWeekStatus(2);
    const week3Status = resolveWeekStatus(3);

    // 3. Lapsing Approval Days (udah berapa hari belum di-approve sama DM)
    const pendingDmMissions = allMissions.filter(m => 
      m.status === 'SCORED_BY_TL' || (m.tlScore !== null && m.dmScore === null && m.status !== 'COMPLETED')
    );
    let lapsingApprovalDays = 0;
    if (pendingDmMissions.length > 0) {
      const daysArr = pendingDmMissions.map(m => {
        const refDate = m.tlScoredAt || m.submittedAt || m.createdAt;
        if (!refDate) return 0;
        const diffMs = Math.max(0, now - new Date(refDate).getTime());
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
      });
      lapsingApprovalDays = Math.max(...daysArr);
    }

    const assignmentSlName = slByDept.get(u.departmentId) || '-';

    const completedMissionsCount = allMissions.filter(m => m.status === 'COMPLETED').length;
    const notCompletedMissionsCount = allMissions.filter(m => m.status !== 'COMPLETED').length;

    return {
      // ─── 17 Kolom Utama Spesifikasi Active New Recruit Report ───
      id: u.userId,
      userId: u.userId,
      batch: currentBatch?.code || '-',
      name: u.name,
      gender: u.gender || '-',
      phone: u.phone || '-',
      email: u.email,
      buddy: u.userBuddy?.name || '-',
      buddySL: u.userBuddy?.name || '-',
      buddyStoreCode: u.userBuddy?.department?.departmentCode || '-',
      assignmentSL: assignmentSlName,
      assignmentStoreCode: u.department?.departmentCode || '-',
      buddyStatus,
      week1Status,
      week2Status,
      week3Status,
      completedMissionsCount,
      notCompletedMissionsCount,
      lapsingApprovalDays,
      scoreBintang: u.stars || 0,
      scorePoint: u.points || 0,

      // ─── Atribut Pelengkap & Nilai Tambah ───
      stars: u.stars || 0,
      points: u.points || 0,
      level: u.level || 1,
      batchId: currentBatch?.batchId || null,
      batchCode: currentBatch?.code || '-',
      batchName: currentBatch?.name || '-',
      currentBatchStatus: currentBatch?.status || '-',
      departmentId: u.department?.departmentId || null,
      assignmentStoreName: u.department?.departmentName || 'Belum Ditugaskan',
      buddyStoreName: u.userBuddy?.department?.departmentName || '-',
      roleCode: u.role?.roleCode || '-',
      roleName: u.role?.roleName || '-',
      isActive: u.isActive,
      isBuddy: Boolean(u.isBuddy),
      avatarUrl: u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`,
      createdAt: u.createdAt
    };
  });

  return {
    data: formattedUsers,
    pagination: {
      total,
      page: isExportAll ? 1 : page,
      limit: isExportAll ? total : limit,
      totalPages: isExportAll ? 1 : (Math.ceil(total / limit) || 1)
    }
  };
};


/**
 * 3b. EXPORT USER TRACEABILITY EXCEL (Active New Recruit Report)
 * Membangun spreadsheet siap pakai dengan 17 kolom standar spesifikasi foto + atribut pelengkap.
 */
const exportUserTraceabilityExcel = async (query = {}, currentUser = null) => {
  const result = await getUserTraceabilityList({ ...query, exportAll: true }, currentUser);
  const users = result.data || [];

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Re.juve Gamification Platform';
  workbook.created = new Date();

  const ws = workbook.addWorksheet('Active New Recruit Report', {
    views: [{ showGridLines: true }]
  });

  // Judul & Banner Laporan (A1:X1)
  ws.mergeCells('A1:X1');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'RE.JUVE — ACTIVE NEW RECRUIT REPORT (USER TRACEABILITY AUDIT)';
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF831843' } }; // Re.juve Maroon
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(1).height = 32;

  // Metadata Cetak (A2:X2)
  ws.mergeCells('A2:X2');
  const metaCell = ws.getCell('A2');
  const filterDesc = [
    query.search || query.q ? `Pencarian: "${query.search || query.q}"` : null,
    query.role ? `Role: ${query.role}` : null,
    query.storeCode ? `Store: ${query.storeCode}` : (query.departmentId ? `Dept ID: ${query.departmentId}` : null),
    query.startDate && query.endDate ? `Periode: ${query.startDate} s/d ${query.endDate}` : null,
    query.batchId ? `Batch ID: ${query.batchId}` : 'Semua Batch'
  ].filter(Boolean).join(' | ');

  metaCell.value = `Tanggal Ekspor: ${formatDate(new Date())} | Total Kru: ${users.length} Orang | Filter: ${filterDesc}`;
  metaCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  metaCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(2).height = 20;

  ws.addRow([]); // Baris 3 kosong

  // Header Kolom Tabel (Baris 4) - 24 Kolom (17 spesifikasi foto + pelengkap)
  const headers = [
    'No',
    'ID (User UUID)',
    'Batch',
    'Nama Kru',
    'Gender',
    'Phone / WA',
    'Email',
    'Buddy SL',
    'Buddy Store Code',
    'Buddy Store Name',
    'Assignment SL',
    'Assignment Store Code',
    'Assignment Store Name',
    'Buddy Status (3 Hari)',
    'Week 1 Status',
    'Week 2 Status',
    'Week 3 Status',
    'Jumlah Misi Complete',
    'Jumlah Misi Not Complete',
    'Lapsing Approval Days (Pending DM)',
    'Score Bintang',
    'Score Point',
    'Level Gamifikasi',
    'Status User'
  ];

  ws.addRow(headers);
  const headerRow = ws.getRow(4);
  headerRow.height = 26;
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9D174D' } };
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF6B133A' } },
      left: { style: 'thin', color: { argb: 'FF6B133A' } },
      bottom: { style: 'medium', color: { argb: 'FF4A0D28' } },
      right: { style: 'thin', color: { argb: 'FF6B133A' } }
    };
  });

  // Isi data baris
  users.forEach((u, idx) => {
    const row = ws.addRow([
      idx + 1,
      u.id,
      u.batch,
      u.name,
      u.gender,
      u.phone,
      u.email,
      u.buddySL,
      u.buddyStoreCode,
      u.buddyStoreName,
      u.assignmentSL,
      u.assignmentStoreCode,
      u.assignmentStoreName,
      u.buddyStatus,
      u.week1Status,
      u.week2Status,
      u.week3Status,
      u.completedMissionsCount,
      u.notCompletedMissionsCount,
      u.lapsingApprovalDays,
      u.scoreBintang,
      u.scorePoint,
      u.level,
      u.isActive ? 'Aktif' : 'Non-Aktif'
    ]);

    row.height = 22;
    const isEven = idx % 2 === 0;
    const bgArgb = isEven ? 'FFFFFFFF' : 'FFFDF2F8';

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
      cell.font = { name: 'Calibri', size: 10 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };

      // Alignment rules
      if ([1, 5, 14, 15, 16, 17, 18, 19, 20, 21, 22].includes(colNumber)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if ([3, 9, 12].includes(colNumber)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }

      // Status color highlighting
      if ([14, 15, 16, 17].includes(colNumber)) {
        if (cell.value === 'COMPLETED') {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF15803D' } };
        } else if (cell.value === 'PENDING_REVIEW') {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFB45309' } };
        } else if (cell.value === 'IN_PROGRESS') {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1D4ED8' } };
        }
      }

      // Lapsing days highlight
      if (colNumber === 18 && Number(cell.value) > 3) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFDC2626' } };
      }
    });
  });

  // Lebar Kolom
  ws.columns = [
    { width: 6 },   // No
    { width: 36 },  // User ID
    { width: 20 },  // Batch
    { width: 28 },  // Name
    { width: 10 },  // Gender
    { width: 18 },  // Phone
    { width: 30 },  // Email
    { width: 24 },  // Buddy SL
    { width: 18 },  // Buddy Store Code
    { width: 26 },  // Buddy Store Name
    { width: 24 },  // Assignment SL
    { width: 22 },  // Assignment Store Code
    { width: 26 },  // Assignment Store Name
    { width: 22 },  // Buddy Status
    { width: 18 },  // Week 1 Status
    { width: 18 },  // Week 2 Status
    { width: 18 },  // Week 3 Status
    { width: 24 },  // Lapsing Approval Days
    { width: 15 },  // Score Bintang
    { width: 15 },  // Score Point
    { width: 18 },  // Level Gamifikasi
    { width: 14 }   // Status User
  ];

  return await workbook.xlsx.writeBuffer();
};

/**
 * 4. GET USER TRACEABILITY DETAIL
 * Menyediakan audit riwayat jejak penugasan, gerai, misi, serta evaluator SL dan DM.
 */
const getUserTraceabilityDetail = async (userId) => {
  if (!userId) {
    throw new Error('Parameter userId wajib diisi.');
  }

  const user = await prisma.user.findUnique({
    where: { userId },
    include: {
      role: true,
      department: true,
      batch: true,
      activeBatch: true,
      userBuddy: {
        select: {
          userId: true,
          name: true,
          email: true,
          department: {
            select: {
              departmentCode: true,
              departmentName: true
            }
          }
        }
      }
    }
  });

  if (!user) {
    return null;
  }

  // 1. Temukan Pemimpin Gerai (Store Leader & District Manager) yang membawahi gerai aktif user
  let storeLeader = null;
  let districtManager = null;

  if (user.departmentId) {
    const leaders = await prisma.user.findMany({
      where: {
        departmentId: user.departmentId,
        role: {
          roleCode: { in: ['STORE_LEADER', 'DISTRICT_MANAGER', 'SUPERVISOR', 'HEAD'] }
        },
        isActive: true
      },
      select: {
        userId: true,
        name: true,
        email: true,
        role: { select: { roleCode: true, roleName: true } }
      }
    });

    storeLeader = leaders.find(l => l.role?.roleCode === 'STORE_LEADER' || l.role?.roleCode === 'SUPERVISOR') || null;
    districtManager = leaders.find(l => l.role?.roleCode === 'DISTRICT_MANAGER' || l.role?.roleCode === 'HEAD') || null;
  }

  // 2. Ambil seluruh riwayat misi yang pernah dikerjakan oleh user ini
  const userMissions = await prisma.userMission.findMany({
    where: { userId },
    include: {
      mission: {
        include: {
          batch: {
            select: {
              batchId: true,
              code: true,
              name: true,
              status: true
            }
          }
        }
      },
      tl: {
        select: {
          userId: true,
          name: true,
          email: true,
          role: { select: { roleCode: true, roleName: true } }
        }
      },
      dm: {
        select: {
          userId: true,
          name: true,
          email: true,
          role: { select: { roleCode: true, roleName: true } }
        }
      }
    },
    orderBy: [
      { mission: { startDate: 'desc' } },
      { createdAt: 'desc' }
    ]
  });

  // 3. Format riwayat misi
  const missionHistory = userMissions.map(um => {
    return {
      userMissionId: um.userMissionId,
      missionId: um.missionId,
      missionTitle: um.mission?.missionTitle || 'Misi Gamifikasi',
      description: um.mission?.description || '',
      category: um.mission?.category || '-',
      type: um.mission?.type || 'JOURNEY',
      weekOrDayNumber: um.mission?.weekOrDayNumber || 1,
      batch: um.mission?.batch ? {
        batchId: um.mission.batch.batchId,
        code: um.mission.batch.code,
        name: um.mission.batch.name,
        status: um.mission.batch.status
      } : null,
      status: um.status,
      evidenceUrl: um.evidenceUrl || null,
      submissionNotes: um.submissionNotes || null,
      submittedAt: um.submittedAt || null,
      // Evaluasi Store Leader (SL)
      tlScore: um.tlScore,
      tlNotes: um.tlNotes || null,
      tlScoredAt: um.tlScoredAt || null,
      storeLeader: um.tl ? {
        userId: um.tl.userId,
        name: um.tl.name,
        email: um.tl.email,
        roleCode: um.tl.role?.roleCode
      } : null,
      // Review District Manager (DM)
      dmScore: um.dmScore,
      dmNotes: um.dmNotes || null,
      dmReviewedAt: um.dmReviewedAt || null,
      districtManager: um.dm ? {
        userId: um.dm.userId,
        name: um.dm.name,
        email: um.dm.email,
        roleCode: um.dm.role?.roleCode
      } : null,
      finalScore: um.finalScore,
      starsEarned: um.stars || 0
    };
  });

  // 4. Kalkulasi Statistik Traceability
  const totalMissions = missionHistory.length;
  const completedMissions = missionHistory.filter(m => m.status === 'COMPLETED').length;
  const scoredMissions = missionHistory.filter(m => m.finalScore !== null && m.finalScore !== undefined);
  const averageScore = scoredMissions.length > 0
    ? parseFloat((scoredMissions.reduce((acc, m) => acc + m.finalScore, 0) / scoredMissions.length).toFixed(1))
    : 0;
  const totalStarsFromMissions = parseFloat(
    missionHistory.reduce((acc, m) => acc + (m.starsEarned || 0), 0).toFixed(1)
  );

  const activeBatch = user.activeBatch || user.batch;

  return {
    profile: {
      userId: user.userId,
      name: user.name,
      email: user.email,
      gender: user.gender || '-',
      phone: user.phone || '-',
      avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`,
      roleCode: user.role?.roleCode || '-',
      roleName: user.role?.roleName || '-',
      isActive: user.isActive,
      currentDepartment: user.department ? {
        departmentId: user.department.departmentId,
        departmentCode: user.department.departmentCode,
        departmentName: user.department.departmentName
      } : null,
      currentBatch: activeBatch ? {
        batchId: activeBatch.batchId,
        code: activeBatch.code,
        name: activeBatch.name,
        status: activeBatch.status,
        currentWeek: activeBatch.currentWeek,
        startDate: activeBatch.startDate,
        endDate: activeBatch.endDate
      } : null,
      mentorBuddy: user.userBuddy ? {
        userId: user.userBuddy.userId,
        name: user.userBuddy.name,
        email: user.userBuddy.email,
        departmentName: user.userBuddy.department?.departmentName || '-'
      } : null,
      gamification: {
        stars: user.stars || 0,
        points: user.points || 0,
        level: user.level || 1
      },
      createdAt: user.createdAt
    },
    leadershipContext: {
      storeLeader: storeLeader ? {
        userId: storeLeader.userId,
        name: storeLeader.name,
        email: storeLeader.email,
        roleTitle: storeLeader.role?.roleName || 'Store Leader'
      } : null,
      districtManager: districtManager ? {
        userId: districtManager.userId,
        name: districtManager.name,
        email: districtManager.email,
        roleTitle: districtManager.role?.roleName || 'District Manager'
      } : null
    },
    statistics: {
      totalMissions,
      completedMissions,
      completionRate: totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0,
      averageScore,
      totalStarsFromMissions
    },
    missionHistory
  };
};


/**
 * 4b. EXPORT SINGLE USER TRACEABILITY TO EXCEL (.XLSX)
 * Mengunduh kartu audit riwayat jejak, kepemimpinan, dan evaluasi misi untuk 1 pengguna.
 */
const exportSingleUserTraceabilityExcel = async (userId) => {
  const detail = await getUserTraceabilityDetail(userId);
  if (!detail) return null;

  const user = detail.profile || detail.user || {};
  const leadershipContext = detail.leadershipContext || {};
  const statistics = detail.statistics || {};
  const missionHistory = detail.missionHistory || [];

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Re.juve Gamification Platform';
  workbook.created = new Date();

  // ─── SHEET 1: KARTU AUDIT PENGGUNA ─────────────────────────────────────────
  const wsCard = workbook.addWorksheet('Kartu Audit Profil', {
    views: [{ showGridLines: true }]
  });

  wsCard.mergeCells('A1:F1');
  const titleCell = wsCard.getCell('A1');
  titleCell.value = 'RE.JUVE — KARTU AUDIT TRACEABILITY PENGGUNA';
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF831843' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  wsCard.getRow(1).height = 32;

  const kruId = user.userId || user.id || userId;
  wsCard.mergeCells('A2:F2');
  const metaCell = wsCard.getCell('A2');
  metaCell.value = `ID Kru: ${kruId} | Tanggal Ekspor: ${formatDate(new Date())}`;
  metaCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  metaCell.alignment = { vertical: 'middle', horizontal: 'center' };
  wsCard.getRow(2).height = 20;

  wsCard.addRow([]); // baris 3 kosong

  const deptCode = user.currentDepartment?.departmentCode || user.department?.departmentCode;
  const deptName = user.currentDepartment?.departmentName || user.department?.departmentName;
  const deptDisplay = deptCode ? `[${deptCode}] ${deptName || ''}` : '-';

  const batchCode = user.currentBatch?.code || user.batch?.code;
  const batchName = user.currentBatch?.name || user.batch?.name;
  const batchDisplay = batchCode ? `[${batchCode}] ${batchName || ''}` : '-';
  const batchStatus = user.currentBatch?.status || user.batch?.status || '-';

  const buddyName = user.mentorBuddy?.name || user.buddySL?.name;
  const buddyEmail = user.mentorBuddy?.email || user.buddySL?.email;
  const buddyDisplay = buddyName ? `${buddyName}${buddyEmail ? ` (${buddyEmail})` : ''}` : '-';

  const starsVal = statistics.totalStarsFromMissions ?? user.gamification?.stars ?? 0;
  const pointsVal = user.gamification?.points ?? 0;
  const levelVal = user.gamification?.level ?? 1;
  const compMissions = statistics.completedMissions ?? 0;
  const totMissions = statistics.totalMissions ?? 0;
  const compRate = statistics.completionRate ?? 0;

  const profileRows = [
    ['Nama Lengkap', user.name || '-', 'Role / Jabatan', user.roleName || user.roleCode || '-'],
    ['Email', user.email || '-', 'Status Akun', user.isActive ? 'Aktif' : 'Non-Aktif'],
    ['Nomor Telepon / WA', user.phone || '-', 'Jenis Kelamin', user.gender === 'M' ? 'Laki-laki (M)' : (user.gender === 'F' ? 'Perempuan (F)' : '-')],
    ['Batch Penugasan', batchDisplay, 'Status Batch', batchStatus],
    ['Gerai Penempatan', deptDisplay, 'Mentor Buddy (3 Hari)', buddyDisplay],
    ['Store Leader (SL Penempatan)', leadershipContext.storeLeader?.name || '-', 'District Manager (DM Wilayah)', leadershipContext.districtManager?.name || '-'],
    ['Total Bintang', starsVal, 'Total Poin', pointsVal],
    ['Level Gamifikasi', levelVal, 'Penyelesaian Misi', `${compMissions} dari ${totMissions} (${compRate}%)`]
  ];

  profileRows.forEach(p => {
    const r = wsCard.addRow([p[0], p[1], '', p[2], p[3], '']);
    r.height = 22;
  });

  for (let rNum = 4; rNum <= 11; rNum++) {
    wsCard.mergeCells(`B${rNum}:C${rNum}`);
    wsCard.mergeCells(`E${rNum}:F${rNum}`);

    const lbl1 = wsCard.getCell(`A${rNum}`);
    const val1 = wsCard.getCell(`B${rNum}`);
    const lbl2 = wsCard.getCell(`D${rNum}`);
    const val2 = wsCard.getCell(`E${rNum}`);

    [lbl1, lbl2].forEach(c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDF2F8' } };
      c.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF831843' } };
      c.border = { top: { style: 'thin', color: { argb: 'FFE2E8F0' } }, bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }, left: { style: 'thin', color: { argb: 'FFE2E8F0' } }, right: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
      c.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    [val1, val2].forEach(c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
      c.font = { name: 'Calibri', size: 10, color: { argb: 'FF1E293B' } };
      c.border = { top: { style: 'thin', color: { argb: 'FFE2E8F0' } }, bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }, left: { style: 'thin', color: { argb: 'FFE2E8F0' } }, right: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
      c.alignment = { vertical: 'middle', horizontal: 'left' };
    });
  }

  wsCard.columns = [
    { width: 26 },
    { width: 22 },
    { width: 14 },
    { width: 26 },
    { width: 22 },
    { width: 14 }
  ];

  // ─── SHEET 2: RIWAYAT EVALUASI MISI ─────────────────────────────────────────
  const wsMissions = workbook.addWorksheet('Riwayat Evaluasi Misi', {
    views: [{ showGridLines: true }]
  });

  wsMissions.mergeCells('A1:J1');
  const mTitle = wsMissions.getCell('A1');
  mTitle.value = `RE.JUVE — RIWAYAT EVALUASI & SKOR MISI: ${(user.name || '').toUpperCase()}`;
  mTitle.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  mTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF831843' } };
  mTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  wsMissions.getRow(1).height = 30;

  const missionHeaders = [
    'No',
    'Tipe Misi',
    'Minggu / Hari',
    'Judul Misi',
    'Status Misi',
    'Skor SL',
    'Catatan Evaluator SL',
    'Skor DM',
    'Catatan Reviewer DM',
    'Nilai Akhir (Bintang)'
  ];
  wsMissions.addRow(missionHeaders);
  const mHeaderRow = wsMissions.getRow(2);
  mHeaderRow.height = 26;
  mHeaderRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9D174D' } };
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { top: { style: 'thin', color: { argb: 'FF6B133A' } }, left: { style: 'thin', color: { argb: 'FF6B133A' } }, bottom: { style: 'medium', color: { argb: 'FF4A0D28' } }, right: { style: 'thin', color: { argb: 'FF6B133A' } } };
  });

  missionHistory.forEach((m, idx) => {
    const row = wsMissions.addRow([
      idx + 1,
      m.type || m.missionType || 'JOURNEY',
      m.weekOrDayNumber || '-',
      m.missionTitle || m.title || '-',
      m.status,
      m.tlScore ?? m.slEvaluation?.score ?? '-',
      m.tlNotes || m.slEvaluation?.notes || '-',
      m.dmScore ?? m.dmReview?.score ?? '-',
      m.dmNotes || m.dmReview?.notes || '-',
      m.finalScore ?? m.scores?.finalScore ?? m.starsEarned ?? '-'
    ]);
    row.height = 22;
    const isEven = idx % 2 === 0;
    const bgArgb = isEven ? 'FFFFFFFF' : 'FFFDF2F8';

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
      cell.font = { name: 'Calibri', size: 10 };
      cell.border = { top: { style: 'thin', color: { argb: 'FFE2E8F0' } }, bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }, left: { style: 'thin', color: { argb: 'FFE2E8F0' } }, right: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
      if ([1, 2, 3, 5, 6, 8, 10].includes(colNumber)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
      if (colNumber === 5) {
        cell.font = {
          name: 'Calibri',
          size: 10,
          bold: true,
          color: { argb: m.status === 'COMPLETED' ? 'FF15803D' : (m.status === 'PENDING_REVIEW' ? 'FFB45309' : 'FF1D4ED8') }
        };
      }
    });
  });

  wsMissions.columns = [
    { width: 6 },
    { width: 14 },
    { width: 15 },
    { width: 32 },
    { width: 18 },
    { width: 12 },
    { width: 28 },
    { width: 12 },
    { width: 28 },
    { width: 20 }
  ];

  return await workbook.xlsx.writeBuffer();
};

/**
 * 4. GET SCORE REPORT
 * Menampilkan rekapitulasi nilai mingguan (Week 1, 2, 3), score bintang, dan point kru.
 */
const getScoreReport = async (query = {}, currentUser = null) => {
  const isExportAll = query.exportAll === true || query.exportAll === 'true';
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const andConditions = await buildUserFilterConditions(query, currentUser);
  andConditions.push({ role: { roleCode: 'CREW' } });
  const where = { AND: andConditions };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip: isExportAll ? undefined : skip,
      take: isExportAll ? undefined : limit,
      select: {
        userId: true,
        name: true,
        email: true,
        gender: true,
        phone: true,
        stars: true,
        points: true,
        departmentId: true,
        department: {
          select: {
            departmentId: true,
            departmentCode: true,
            departmentName: true
          }
        },
        userBuddyId: true,
        userBuddy: {
          select: {
            userId: true,
            name: true,
            email: true,
            department: {
              select: {
                departmentCode: true,
                departmentName: true
              }
            }
          }
        },
        batch: {
          select: {
            batchId: true,
            code: true,
            name: true
          }
        },
        activeBatch: {
          select: {
            batchId: true,
            code: true,
            name: true
          }
        },
        missions: {
          select: {
            userMissionId: true,
            status: true,
            tlScore: true,
            dmScore: true,
            finalScore: true,
            mission: {
              select: {
                type: true,
                weekOrDayNumber: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })
  ]);

  const deptIds = users.map(u => u.departmentId).filter(Boolean);
  const storeLeaders = deptIds.length > 0
    ? await prisma.user.findMany({
        where: {
          departmentId: { in: deptIds },
          role: { roleCode: { in: ['STORE_LEADER', 'SUPERVISOR'] } },
          isActive: true
        },
        select: {
          userId: true,
          name: true,
          departmentId: true
        }
      })
    : [];

  const slByDept = new Map();
  storeLeaders.forEach(sl => slByDept.set(sl.departmentId, sl.name));

  const data = users.map(u => {
    const currentBatch = u.activeBatch || u.batch;
    const allMissions = u.missions || [];

    const calculateWeekScore = (weekNum) => {
      const weekMissions = allMissions.filter(m => m.mission?.type === 'JOURNEY' && m.mission?.weekOrDayNumber === weekNum);
      const scored = weekMissions.filter(m => m.finalScore !== null || m.tlScore !== null);
      if (scored.length === 0) return 0;
      const sum = scored.reduce((acc, curr) => acc + (curr.finalScore ?? curr.tlScore ?? 0), 0);
      return parseFloat((sum / scored.length).toFixed(1));
    };

    return {
      id: u.userId,
      userId: u.userId,
      batch: currentBatch?.code || '-',
      name: u.name,
      buddySL: u.userBuddy?.name || '-',
      buddyStoreCode: u.userBuddy?.department?.departmentCode || '-',
      viewBuddyReport: u.userBuddyId ? `/api/reports/buddy-incentive/${u.userBuddyId}` : null,
      assignmentSL: slByDept.get(u.departmentId) || '-',
      assignmentStoreCode: u.department?.departmentCode || '-',
      week1Score: calculateWeekScore(1),
      week2Score: calculateWeekScore(2),
      week3Score: calculateWeekScore(3),
      scoreBintang: u.stars || 0,
      scorePoint: u.points || 0
    };
  });

  return {
    data,
    pagination: {
      total,
      page: isExportAll ? 1 : page,
      limit: isExportAll ? total : limit,
      totalPages: isExportAll ? 1 : (Math.ceil(total / limit) || 1)
    }
  };
};

/**
 * 4b. EXPORT SCORE REPORT EXCEL
 */
const exportScoreReportExcel = async (query = {}, currentUser = null) => {
  const result = await getScoreReport({ ...query, exportAll: true }, currentUser);
  const list = result.data || [];

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Re.juve Gamification Platform';
  workbook.created = new Date();

  const ws = workbook.addWorksheet('Score Report', {
    views: [{ showGridLines: true }]
  });

  ws.mergeCells('A1:M1');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'RE.JUVE — SCORE REPORT (REKAPITULASI NILAI MISI & SKOR KRU)';
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF831843' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(1).height = 32;

  ws.mergeCells('A2:M2');
  const metaCell = ws.getCell('A2');
  metaCell.value = `Tanggal Ekspor: ${formatDate(new Date())} | Total Data: ${list.length} Kru`;
  metaCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  metaCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(2).height = 20;

  ws.addRow([]);

  const headers = [
    'No',
    'ID (User UUID)',
    'Batch',
    'Nama Kru',
    'Buddy SL',
    'Buddy Store Code',
    'Assignment SL',
    'Assignment Store Code',
    'Week 1 Score',
    'Week 2 Score',
    'Week 3 Score',
    'Score Bintang',
    'Score Point'
  ];

  ws.addRow(headers);
  const headerRow = ws.getRow(4);
  headerRow.height = 26;
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9D174D' } };
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF6B133A' } },
      left: { style: 'thin', color: { argb: 'FF6B133A' } },
      bottom: { style: 'medium', color: { argb: 'FF4A0D28' } },
      right: { style: 'thin', color: { argb: 'FF6B133A' } }
    };
  });

  list.forEach((item, idx) => {
    const row = ws.addRow([
      idx + 1,
      item.id,
      item.batch,
      item.name,
      item.buddySL,
      item.buddyStoreCode,
      item.assignmentSL,
      item.assignmentStoreCode,
      item.week1Score,
      item.week2Score,
      item.week3Score,
      item.scoreBintang,
      item.scorePoint
    ]);
    row.height = 22;
    const isEven = idx % 2 === 0;
    const bgArgb = isEven ? 'FFFFFFFF' : 'FFFDF2F8';

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
      cell.font = { name: 'Calibri', size: 10 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
      if ([1, 3, 5, 6, 8, 9, 10, 11, 12, 13].includes(colNumber)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });
  });

  ws.columns = [
    { width: 6 },
    { width: 36 },
    { width: 16 },
    { width: 24 },
    { width: 22 },
    { width: 18 },
    { width: 22 },
    { width: 22 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 14 }
  ];

  return await workbook.xlsx.writeBuffer();
};

/**
 * 5. GET REPORT BY STORE
 * Rekapitulasi progres onboarding new hire per gerai (Store).
 */
const getStoreReport = async (query = {}, currentUser = null) => {
  const isExportAll = query.exportAll === true || query.exportAll === 'true';
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  // Department where conditions
  const deptWhere = { isActive: true };

  // Role Scoping
  if (currentUser) {
    const roleCode = (currentUser.role?.roleCode || currentUser.role || '').toUpperCase();
    const currentUserId = currentUser.userId || currentUser.id;

    if (roleCode === 'STORE_LEADER') {
      deptWhere.OR = [
        { userSlId: currentUserId },
        ...(currentUser.departmentId ? [{ departmentId: currentUser.departmentId }] : [])
      ];
    } else if (roleCode === 'DISTRICT_MANAGER') {
      deptWhere.OR = [
        { userDmId: currentUserId },
        ...(currentUser.departmentId ? [{ departmentId: currentUser.departmentId }] : [])
      ];
    }
  }

  if (query.storeCode || query.departmentCode) {
    deptWhere.departmentCode = query.storeCode || query.departmentCode;
  }
  if (query.departmentId) {
    deptWhere.departmentId = query.departmentId;
  }
  if (query.dmId || query.userDmId) {
    deptWhere.userDmId = query.dmId || query.userDmId;
  }
  if (query.search || query.q) {
    const s = String(query.search || query.q).trim();
    deptWhere.OR = [
      { departmentCode: { contains: s, mode: 'insensitive' } },
      { departmentName: { contains: s, mode: 'insensitive' } }
    ];
  }

  const [total, departments] = await Promise.all([
    prisma.department.count({ where: deptWhere }),
    prisma.department.findMany({
      where: deptWhere,
      skip: isExportAll ? undefined : skip,
      take: isExportAll ? undefined : limit,
      orderBy: { departmentCode: 'asc' }
    })
  ]);

  const deptIds = departments.map(d => d.departmentId);
  const managerIds = [...new Set(departments.flatMap(d => [d.userSlId, d.userDmId]).filter(Boolean))];

  const managers = managerIds.length > 0
    ? await prisma.user.findMany({
        where: { userId: { in: managerIds } },
        select: { userId: true, name: true }
      })
    : [];
  const managerMap = new Map();
  managers.forEach(m => managerMap.set(m.userId, m.name));

  // Ambil data kru di gerai-gerai ini
  const matchedBatchIds = await resolveBatchFilter(query);
  const crewWhere = {
    departmentId: { in: deptIds },
    role: { roleCode: 'CREW' },
    isActive: true
  };
  if (matchedBatchIds !== null) {
    if (matchedBatchIds.length === 0) {
      crewWhere.batchId = '00000000-0000-0000-0000-000000000000';
    } else {
      crewWhere.OR = [
        { batchId: { in: matchedBatchIds } },
        { activeBatchId: { in: matchedBatchIds } }
      ];
    }
  }

  const crews = await prisma.user.findMany({
    where: crewWhere,
    select: {
      userId: true,
      name: true,
      departmentId: true,
      createdAt: true,
      batch: { select: { batchId: true, code: true, startDate: true } },
      activeBatch: { select: { batchId: true, code: true, startDate: true } },
      missions: {
        select: {
          userMissionId: true,
          status: true,
          tlScore: true,
          dmScore: true,
          finalScore: true,
          dmReviewedAt: true,
          updatedAt: true,
          mission: {
            select: {
              type: true,
              weekOrDayNumber: true
            }
          }
        }
      }
    }
  });

  const crewsByDept = new Map();
  crews.forEach(c => {
    if (!crewsByDept.has(c.departmentId)) crewsByDept.set(c.departmentId, []);
    crewsByDept.get(c.departmentId).push(c);
  });

  const data = departments.map(d => {
    const deptCrews = crewsByDept.get(d.departmentId) || [];
    const dmName = d.userDmId ? (managerMap.get(d.userDmId) || '-') : '-';
    const slName = d.userSlId ? (managerMap.get(d.userSlId) || '-') : '-';

    const uniqueBatches = new Set();
    let stepBuddyCount = 0;
    let stepWeek1Count = 0;
    let stepWeek2Count = 0;
    let stepWeek3Count = 0;
    let completeCount = 0;
    const completeDurations = [];

    deptCrews.forEach(c => {
      const b = c.activeBatch || c.batch;
      if (b?.code) uniqueBatches.add(b.code);

      const allM = c.missions || [];
      const buddyMissions = allM.filter(m => m.mission?.type === 'BUDDY');
      const isBuddyComplete = buddyMissions.length > 0 && buddyMissions.every(m => m.status === 'COMPLETED' || m.tlScore !== null);

      const resolveWeekDone = (wn) => {
        const wm = allM.filter(m => m.mission?.type === 'JOURNEY' && m.mission?.weekOrDayNumber === wn);
        return wm.length > 0 && wm.every(m => m.status === 'COMPLETED');
      };

      const isW1Done = resolveWeekDone(1);
      const isW2Done = resolveWeekDone(2);
      const isW3Done = resolveWeekDone(3);

      if (!isBuddyComplete) {
        stepBuddyCount++;
      } else if (!isW1Done) {
        stepWeek1Count++;
      } else if (!isW2Done) {
        stepWeek2Count++;
      } else if (!isW3Done) {
        stepWeek3Count++;
      } else {
        completeCount++;
        const lastMission = allM.filter(m => m.mission?.type === 'JOURNEY' && m.mission?.weekOrDayNumber === 3)
          .sort((a, b) => new Date(b.dmReviewedAt || b.updatedAt) - new Date(a.dmReviewedAt || a.updatedAt))[0];
        const endDate = lastMission?.dmReviewedAt || lastMission?.updatedAt || new Date();
        const startDate = b?.startDate || c.createdAt;
        const diffDays = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));
        completeDurations.push(diffDays);
      }
    });

    const avgCompleteDays = completeDurations.length > 0
      ? parseFloat((completeDurations.reduce((acc, curr) => acc + curr, 0) / completeDurations.length).toFixed(1))
      : 0;

    return {
      departmentId: d.departmentId,
      storeCode: d.departmentCode,
      storeName: d.departmentName,
      dm: dmName,
      storeLeader: slName,
      batchCount: uniqueBatches.size,
      numberOfNewHire: deptCrews.length,
      newHireStepBuddyCount: stepBuddyCount,
      newHireStepWeek1Count: stepWeek1Count,
      newHireStepWeek2Count: stepWeek2Count,
      newHireStepWeek3Count: stepWeek3Count,
      newHireCompleteCount: completeCount,
      avgCompleteDays
    };
  });

  return {
    data,
    pagination: {
      total,
      page: isExportAll ? 1 : page,
      limit: isExportAll ? total : limit,
      totalPages: isExportAll ? 1 : (Math.ceil(total / limit) || 1)
    }
  };
};

/**
 * 5b. EXPORT REPORT BY STORE EXCEL
 */
const exportStoreReportExcel = async (query = {}, currentUser = null) => {
  const result = await getStoreReport({ ...query, exportAll: true }, currentUser);
  const list = result.data || [];

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Re.juve Gamification Platform';
  workbook.created = new Date();

  const ws = workbook.addWorksheet('Report by Store', {
    views: [{ showGridLines: true }]
  });

  ws.mergeCells('A1:L1');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'RE.JUVE — REPORT BY STORE (PROGRESS ONBOARDING PER GERAI)';
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF831843' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(1).height = 32;

  ws.mergeCells('A2:L2');
  const metaCell = ws.getCell('A2');
  metaCell.value = `Tanggal Ekspor: ${formatDate(new Date())} | Total Gerai: ${list.length}`;
  metaCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  metaCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(2).height = 20;

  ws.addRow([]);

  const headers = [
    'No',
    'Store Code',
    'Nama Gerai',
    'District Manager (DM)',
    'Store Leader (SL)',
    'Jumlah Batch',
    'Number of New Hire',
    'Step Buddy',
    'Step Week 1',
    'Step Week 2',
    'Step Week 3',
    'Complete',
    'Avg Complete Days'
  ];

  ws.addRow(headers);
  const headerRow = ws.getRow(4);
  headerRow.height = 26;
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9D174D' } };
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF6B133A' } },
      left: { style: 'thin', color: { argb: 'FF6B133A' } },
      bottom: { style: 'medium', color: { argb: 'FF4A0D28' } },
      right: { style: 'thin', color: { argb: 'FF6B133A' } }
    };
  });

  list.forEach((item, idx) => {
    const row = ws.addRow([
      idx + 1,
      item.storeCode,
      item.storeName,
      item.dm,
      item.storeLeader,
      item.batchCount,
      item.numberOfNewHire,
      item.newHireStepBuddyCount,
      item.newHireStepWeek1Count,
      item.newHireStepWeek2Count,
      item.newHireStepWeek3Count,
      item.newHireCompleteCount,
      item.avgCompleteDays
    ]);
    row.height = 22;
    const isEven = idx % 2 === 0;
    const bgArgb = isEven ? 'FFFFFFFF' : 'FFFDF2F8';

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
      cell.font = { name: 'Calibri', size: 10 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
      if ([1, 2, 6, 7, 8, 9, 10, 11, 12, 13].includes(colNumber)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });
  });

  ws.columns = [
    { width: 6 },
    { width: 16 },
    { width: 28 },
    { width: 22 },
    { width: 22 },
    { width: 14 },
    { width: 18 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 18 }
  ];

  return await workbook.xlsx.writeBuffer();
};

/**
 * 6. GET REPORT BY DM
 * Evaluasi performa approval District Manager dan gerai supervisi.
 */
const getDmReport = async (query = {}, currentUser = null) => {
  const isExportAll = query.exportAll === true || query.exportAll === 'true';
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const deptWhere = { isActive: true };

  // Role Scoping
  if (currentUser) {
    const roleCode = (currentUser.role?.roleCode || currentUser.role || '').toUpperCase();
    const currentUserId = currentUser.userId || currentUser.id;

    if (roleCode === 'STORE_LEADER') {
      deptWhere.OR = [
        { userSlId: currentUserId },
        ...(currentUser.departmentId ? [{ departmentId: currentUser.departmentId }] : [])
      ];
    } else if (roleCode === 'DISTRICT_MANAGER') {
      deptWhere.OR = [
        { userDmId: currentUserId },
        ...(currentUser.departmentId ? [{ departmentId: currentUser.departmentId }] : [])
      ];
    }
  }

  if (query.storeCode || query.departmentCode) {
    deptWhere.departmentCode = query.storeCode || query.departmentCode;
  }
  if (query.departmentId) {
    deptWhere.departmentId = query.departmentId;
  }
  if (query.dmId || query.userDmId) {
    deptWhere.userDmId = query.dmId || query.userDmId;
  }
  if (query.search || query.q) {
    const s = String(query.search || query.q).trim();
    deptWhere.OR = [
      { departmentCode: { contains: s, mode: 'insensitive' } },
      { departmentName: { contains: s, mode: 'insensitive' } }
    ];
  }

  const [total, departments] = await Promise.all([
    prisma.department.count({ where: deptWhere }),
    prisma.department.findMany({
      where: deptWhere,
      skip: isExportAll ? undefined : skip,
      take: isExportAll ? undefined : limit,
      orderBy: { departmentCode: 'asc' }
    })
  ]);

  const deptIds = departments.map(d => d.departmentId);
  const dmIds = [...new Set(departments.map(d => d.userDmId).filter(Boolean))];

  const dmUsers = dmIds.length > 0
    ? await prisma.user.findMany({
        where: { userId: { in: dmIds } },
        select: { userId: true, name: true }
      })
    : [];
  const dmMap = new Map();
  dmUsers.forEach(u => dmMap.set(u.userId, u.name));

  const matchedBatchIds = await resolveBatchFilter(query);
  const crewWhere = {
    departmentId: { in: deptIds },
    role: { roleCode: 'CREW' },
    isActive: true
  };
  if (matchedBatchIds !== null) {
    if (matchedBatchIds.length === 0) {
      crewWhere.batchId = '00000000-0000-0000-0000-000000000000';
    } else {
      crewWhere.OR = [
        { batchId: { in: matchedBatchIds } },
        { activeBatchId: { in: matchedBatchIds } }
      ];
    }
  }

  const crews = await prisma.user.findMany({
    where: crewWhere,
    select: {
      userId: true,
      name: true,
      departmentId: true,
      points: true,
      batch: { select: { batchId: true, code: true } },
      activeBatch: { select: { batchId: true, code: true } },
      missions: {
        select: {
          userMissionId: true,
          status: true,
          tlScore: true,
          tlScoredAt: true,
          dmScore: true,
          dmReviewedAt: true,
          submittedAt: true,
          createdAt: true
        }
      }
    }
  });

  const crewsByDept = new Map();
  crews.forEach(c => {
    if (!crewsByDept.has(c.departmentId)) crewsByDept.set(c.departmentId, []);
    crewsByDept.get(c.departmentId).push(c);
  });

  const data = departments.map(d => {
    const deptCrews = crewsByDept.get(d.departmentId) || [];
    const dmName = d.userDmId ? (dmMap.get(d.userDmId) || '-') : '-';

    const uniqueBatches = new Set();
    let totalPoints = 0;
    const approvalDurations = [];
    let unscoredBySlCount = 0;
    let unscoredByDmCount = 0;

    deptCrews.forEach(c => {
      const b = c.activeBatch || c.batch;
      if (b?.code) uniqueBatches.add(b.code);
      totalPoints += (c.points || 0);

      (c.missions || []).forEach(m => {
        if (m.tlScoredAt && m.dmReviewedAt) {
          const startMs = new Date(m.tlScoredAt).getTime();
          const endMs = new Date(m.dmReviewedAt).getTime();
          const diffHours = Math.max(0, (endMs - startMs) / (1000 * 60 * 60));
          approvalDurations.push(diffHours);
        }

        if (m.tlScore === null && (m.dmScore !== null || m.status === 'COMPLETED')) {
          unscoredBySlCount++;
        }

        if (m.tlScore !== null && m.dmScore === null && m.status !== 'COMPLETED') {
          unscoredByDmCount++;
        }
      });
    });

    const avgApprovalHours = approvalDurations.length > 0
      ? parseFloat((approvalDurations.reduce((acc, curr) => acc + curr, 0) / approvalDurations.length).toFixed(1))
      : 0;

    let avgApprovalFormatted = '-';
    if (avgApprovalHours > 0) {
      if (avgApprovalHours >= 24) {
        avgApprovalFormatted = `${(avgApprovalHours / 24).toFixed(1)} Hari`;
      } else {
        avgApprovalFormatted = `${avgApprovalHours} Jam`;
      }
    }

    return {
      departmentId: d.departmentId,
      storeCode: d.departmentCode,
      storeName: d.departmentName,
      dm: dmName,
      avgApprovalHours,
      avgApprovalFormatted,
      batchCount: uniqueBatches.size,
      numberOfNewHire: deptCrews.length,
      totalPointsGiven: Math.round(totalPoints),
      unscoredMissionsBySl: unscoredBySlCount,
      unscoredMissionsByDm: unscoredByDmCount
    };
  });

  return {
    data,
    pagination: {
      total,
      page: isExportAll ? 1 : page,
      limit: isExportAll ? total : limit,
      totalPages: isExportAll ? 1 : (Math.ceil(total / limit) || 1)
    }
  };
};

/**
 * 6b. EXPORT REPORT BY DM EXCEL
 */
const exportDmReportExcel = async (query = {}, currentUser = null) => {
  const result = await getDmReport({ ...query, exportAll: true }, currentUser);
  const list = result.data || [];

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Re.juve Gamification Platform';
  workbook.created = new Date();

  const ws = workbook.addWorksheet('Report by DM', {
    views: [{ showGridLines: true }]
  });

  ws.mergeCells('A1:J1');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'RE.JUVE — REPORT BY DM (EVALUASI SUPERVISI & APPROVAL DISTRICT MANAGER)';
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF831843' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(1).height = 32;

  ws.mergeCells('A2:J2');
  const metaCell = ws.getCell('A2');
  metaCell.value = `Tanggal Ekspor: ${formatDate(new Date())} | Total Gerai Supervisi: ${list.length}`;
  metaCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  metaCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(2).height = 20;

  ws.addRow([]);

  const headers = [
    'No',
    'Store Code',
    'Nama Gerai',
    'District Manager (DM)',
    'Rata-rata Waktu Approval (SL -> DM)',
    'Jumlah Batch',
    'Jumlah New Hire',
    'Total Points Diberikan',
    'Misi Tidak Dinilai SL',
    'Misi Tidak Dinilai DM'
  ];

  ws.addRow(headers);
  const headerRow = ws.getRow(4);
  headerRow.height = 26;
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9D174D' } };
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF6B133A' } },
      left: { style: 'thin', color: { argb: 'FF6B133A' } },
      bottom: { style: 'medium', color: { argb: 'FF4A0D28' } },
      right: { style: 'thin', color: { argb: 'FF6B133A' } }
    };
  });

  list.forEach((item, idx) => {
    const row = ws.addRow([
      idx + 1,
      item.storeCode,
      item.storeName,
      item.dm,
      item.avgApprovalFormatted,
      item.batchCount,
      item.numberOfNewHire,
      item.totalPointsGiven,
      item.unscoredMissionsBySl,
      item.unscoredMissionsByDm
    ]);
    row.height = 22;
    const isEven = idx % 2 === 0;
    const bgArgb = isEven ? 'FFFFFFFF' : 'FFFDF2F8';

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
      cell.font = { name: 'Calibri', size: 10 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
      if ([1, 2, 5, 6, 7, 8, 9, 10].includes(colNumber)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });
  });

  ws.columns = [
    { width: 6 },
    { width: 16 },
    { width: 28 },
    { width: 22 },
    { width: 26 },
    { width: 14 },
    { width: 18 },
    { width: 20 },
    { width: 22 },
    { width: 22 }
  ];

  return await workbook.xlsx.writeBuffer();
};

module.exports = {
  getBuddyIncentiveReport,
  exportBuddyIncentiveExcel,
  getBuddyIncentiveDetailByUserId,
  exportSingleBuddyIncentiveExcel,
  getUserTraceabilityList,
  exportUserTraceabilityExcel,
  getUserTraceabilityDetail,
  exportSingleUserTraceabilityExcel,
  getScoreReport,
  exportScoreReportExcel,
  getStoreReport,
  exportStoreReportExcel,
  getDmReport,
  exportDmReportExcel
};
