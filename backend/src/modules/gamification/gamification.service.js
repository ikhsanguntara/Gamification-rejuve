'use strict';

/**
 * @file gamification.service.js
 * @description Service untuk kalkulasi perolehan bintang (Max 5 Bintang) & points desimal serta kenaikan level Crew.
 * Spesifikasi Point Conversion Re.juve:
 * - 1 Kartu Mission = Skala 0 - 100 Point (Maksimal 5 Bintang)
 * - 1 Bintang = 20 Points
 * - Rumus Bintang: (Point / 100) * 5, dibulatkan ke 1 desimal (contoh: 81.5 point -> 4.075 -> 4.1 bintang)
 */

const prisma = require('../../config/db');

const STAR_LEVEL_THRESHOLDS = [
  { level: 1, minStars: 0, title: 'Novice Crew' },
  { level: 2, minStars: 10, title: 'Apprentice Specialist' },
  { level: 3, minStars: 25, title: 'Field Operator' },
  { level: 4, minStars: 50, title: 'Senior Operator' },
  { level: 5, minStars: 80, title: 'Rising Star' },
  { level: 6, minStars: 120, title: 'Master Specialist' },
  { level: 7, minStars: 150, title: 'Elite Inspector' },
  { level: 8, minStars: 200, title: 'Operations Veteran' },
  { level: 9, minStars: 250, title: 'Grandmaster' },
  { level: 10, minStars: 350, title: 'Star Legend' }
];

/**
 * Hitung jumlah bintang dari skor (0 - 100 Point -> Max 5 Bintang).
 * @param {number} score - Skor evaluasi (0-100)
 * @returns {number} Jumlah bintang (desimal 1 angka di belakang koma)
 */
const calculateStars = (score) => {
  const numScore = Math.max(0, Math.min(100, Number(score) || 0));
  if (numScore <= 0) return 0;
  return parseFloat(((numScore / 100) * 5).toFixed(1));
};

/**
 * Dapatkan level bintang berdasarkan akumulasi total bintang.
 * @param {number} totalStars
 * @returns {number} Level 1 - 10
 */
const calculateLevel = (totalStars) => {
  const stars = Math.max(0, Number(totalStars) || 0);
  for (let i = STAR_LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (stars >= STAR_LEVEL_THRESHOLDS[i].minStars) {
      return STAR_LEVEL_THRESHOLDS[i].level;
    }
  }
  return 1;
};

/**
 * Berikan reward bintang dan poin ke user dan update level secara otomatis (Hanya untuk misi JOURNEY).
 * @param {string} userId - UUID User/Crew
 * @param {number} score - Skor final misi yang diperoleh (0-100)
 * @param {object} [tx] - Prisma transaction client opsional
 * @returns {Promise<{ starsEarned: number, pointsEarned: number, totalStars: number, totalPoints: number, level: number }>}
 */
const awardStars = async (userId, score, tx = null) => {
  const client = tx || prisma;
  const numScore = Math.max(0, Math.min(100, Number(score) || 0));
  const starsEarned = calculateStars(numScore);
  const pointsEarned = parseFloat(numScore.toFixed(1));

  const user = await client.user.findUnique({
    where: { userId },
    select: { stars: true, points: true, level: true }
  });

  if (!user) {
    throw new Error(`User dengan id "${userId}" tidak ditemukan.`);
  }

  const currentStars = Number(user.stars) || 0;
  const currentPoints = Number(user.points) || 0;

  const newStars = parseFloat((currentStars + starsEarned).toFixed(1));
  const newPoints = parseFloat((currentPoints + pointsEarned).toFixed(1));
  const newLevel = calculateLevel(newStars);

  await client.user.update({
    where: { userId },
    data: {
      stars: newStars,
      points: newPoints,
      level: newLevel
    }
  });

  return {
    starsEarned,
    pointsEarned,
    totalStars: newStars,
    totalPoints: newPoints,
    level: newLevel
  };
};

const DEFAULT_EARLY_BIRD_SCORES = [
  { dayOffset: 0, stars: 5, points: 100, label: 'Hari H (Sangat Tepat Waktu)' },
  { dayOffset: 1, stars: 4, points: 80, label: 'H+1' },
  { dayOffset: 2, stars: 3, points: 60, label: 'H+2' },
  { dayOffset: 3, stars: 2, points: 40, label: 'H+3' },
  { dayOffset: 999, stars: 1, points: 20, label: 'H+4 ke atas (Standar)' }
];

/**
 * Proses reward Early Bird saat Kru pertama kali login.
 * @param {object} user - Data user lengkap
 * @param {object} activeBatch - Data batch aktif
 * @param {object} [tx] - Prisma transaction client opsional
 */
const processEarlyBirdReward = async (user, activeBatch, tx = null) => {
  const client = tx || prisma;

  if (user.hasClaimedEarlyBird) {
    return { claimed: false, message: 'Early bird reward sudah pernah diklaim sebelumnya.' };
  }

  let scoreTiers = DEFAULT_EARLY_BIRD_SCORES;
  try {
    const param = await client.param.findFirst({
      where: {
        code: 'EARLY_BIRD_SCORES',
        isActive: true
      }
    });
    if (param && param.value) {
      const parsed = JSON.parse(param.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        scoreTiers = parsed;
      }
    }
  } catch {
    scoreTiers = DEFAULT_EARLY_BIRD_SCORES;
  }

  let dayOffset = 0;
  if (activeBatch?.startDate) {
    const start = new Date(activeBatch.startDate);
    const now = new Date();
    const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = nowDateOnly.getTime() - startDateOnly.getTime();
    dayOffset = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  }

  const sortedTiers = [...scoreTiers].sort(
    (a, b) => (a.dayOffset ?? a.maxDayOffset ?? 0) - (b.dayOffset ?? b.maxDayOffset ?? 0)
  );

  let matchedTier = sortedTiers[sortedTiers.length - 1];
  for (const tier of sortedTiers) {
    const maxOffset = tier.dayOffset !== undefined ? tier.dayOffset : tier.maxDayOffset;
    if (dayOffset <= maxOffset) {
      matchedTier = tier;
      break;
    }
  }

  const starsEarned = parseFloat(Number(matchedTier.stars || 0).toFixed(1));
  const pointsEarned = parseFloat(Number(matchedTier.points || 0).toFixed(1));

  const currentStars = Number(user.stars) || 0;
  const currentPoints = Number(user.points) || 0;
  const newStars = parseFloat((currentStars + starsEarned).toFixed(1));
  const newPoints = parseFloat((currentPoints + pointsEarned).toFixed(1));
  const newLevel = calculateLevel(newStars);

  await client.user.update({
    where: { userId: user.userId },
    data: {
      stars: newStars,
      points: newPoints,
      level: newLevel,
      hasClaimedEarlyBird: true,
      firstLoginAt: new Date()
    }
  });

  return {
    claimed: true,
    dayOffset,
    tierLabel: matchedTier.label || `H+${dayOffset}`,
    starsEarned,
    pointsEarned,
    totalStars: newStars,
    totalPoints: newPoints,
    level: newLevel,
    message: `Selamat! Anda mendapatkan reward Early Bird Login sebesar +${starsEarned} ⭐ Stars dan +${pointsEarned} Poin!`
  };
};

/**
 * GET /api/gamification/leaderboard
 * Mengambil klasemen kru (Podium Top 3, tabel peringkat, posisi ranking saya).
 */
const getLeaderboard = async ({ batchId = null, departmentId = null, search = '', page = 1, limit = 10, currentUserId = null }) => {
  const numPage = Math.max(1, parseInt(page, 10) || 1);
  const numLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (numPage - 1) * numLimit;

  const where = {
    role: { roleCode: 'CREW' },
    isActive: true
  };

  if (batchId) {
    where.OR = [
      { batchId },
      { activeBatchId: batchId }
    ];
  }

  if (departmentId) {
    where.departmentId = departmentId;
  }

  if (search && search.trim()) {
    where.name = { contains: search.trim(), mode: 'insensitive' };
  }

  const allCrews = await prisma.user.findMany({
    where,
    select: {
      userId: true,
      name: true,
      email: true,
      stars: true,
      points: true,
      level: true,
      departmentId: true,
      department: {
        select: {
          departmentId: true,
          departmentCode: true,
          departmentName: true
        }
      },
      batch: {
        select: {
          batchId: true,
          code: true,
          name: true
        }
      }
    },
    orderBy: [
      { stars: 'desc' },
      { points: 'desc' },
      { name: 'asc' }
    ]
  });

  const total = allCrews.length;

  const rankedCrews = allCrews.map((crew, index) => {
    const levelObj = STAR_LEVEL_THRESHOLDS.find(t => t.level === crew.level) || { title: 'Novice Crew' };
    return {
      rank: index + 1,
      userId: crew.userId,
      name: crew.name,
      email: crew.email,
      stars: crew.stars,
      points: crew.points,
      level: crew.level,
      levelTitle: levelObj.title,
      departmentId: crew.departmentId,
      departmentName: crew.department?.departmentName || 'Gerai Re.juve',
      departmentCode: crew.department?.departmentCode || '-',
      batchName: crew.batch?.name || '-'
    };
  });

  const podium = rankedCrews.slice(0, 3);
  const rankings = rankedCrews.slice(skip, skip + numLimit);

  let myRank = null;
  if (currentUserId) {
    const found = rankedCrews.find(c => c.userId === currentUserId);
    if (found) {
      myRank = {
        rank: found.rank,
        totalCrews: total,
        stars: found.stars,
        points: found.points,
        level: found.level,
        levelTitle: found.levelTitle
      };
    }
  }

  return {
    podium,
    rankings,
    myRank,
    pagination: {
      total,
      page: numPage,
      limit: numLimit,
      totalPages: Math.ceil(total / numLimit) || 1
    }
  };
};

module.exports = {
  calculateStars,
  calculateLevel,
  awardStars,
  processEarlyBirdReward,
  getLeaderboard,
  STAR_LEVEL_THRESHOLDS,
  DEFAULT_EARLY_BIRD_SCORES
};
