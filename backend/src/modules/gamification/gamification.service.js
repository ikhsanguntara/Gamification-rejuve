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

module.exports = {
  calculateStars,
  calculateLevel,
  awardStars,
  STAR_LEVEL_THRESHOLDS
};
