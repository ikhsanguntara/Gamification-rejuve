'use strict';

/**
 * @file gamificationService.js
 * @description Service untuk kalkulasi perolehan bintang dan kenaikan level Crew.
 */

const prisma = require('../config/db');

const STAR_LEVEL_THRESHOLDS = [
  { level: 1, minStars: 0, title: 'Novice Crew' },
  { level: 2, minStars: 100, title: 'Apprentice Specialist' },
  { level: 3, minStars: 250, title: 'Field Operator' },
  { level: 4, minStars: 500, title: 'Senior Operator' },
  { level: 5, minStars: 800, title: 'Rising Star' },
  { level: 6, minStars: 1200, title: 'Master Specialist' },
  { level: 7, minStars: 1500, title: 'Elite Inspector' },
  { level: 8, minStars: 2000, title: 'Operations Veteran' },
  { level: 9, minStars: 2500, title: 'Grandmaster' },
  { level: 10, minStars: 3500, title: 'Star Legend' }
];

/**
 * Hitung jumlah bintang dari skor berdasarkan scaleConfig atau default kelipatan 10.
 * @param {number} score - Skor evaluasi (0-100)
 * @param {object} [scaleConfig] - Konfigurasi skala JSON opsional { min, max, step, starPerStep }
 * @returns {number} Jumlah bintang yang diperoleh
 */
const calculateStars = (score, scaleConfig = null) => {
  const numScore = Math.max(0, Number(score) || 0);
  if (numScore <= 0) return 0;

  if (scaleConfig && typeof scaleConfig === 'object' && scaleConfig.step) {
    const step = Number(scaleConfig.step) || 10;
    const starPerStep = Number(scaleConfig.starPerStep) || 1;
    return Math.floor(numScore / step) * starPerStep;
  }

  // Standar default: 1 bintang per 10 poin (maks 10 bintang dari skor 100)
  return Math.min(10, Math.max(0, Math.round(numScore / 10)));
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
 * Berikan reward bintang ke user dan update level secara otomatis.
 * @param {string} userId - UUID User/Crew
 * @param {number} score - Skor misi yang diperoleh
 * @param {object} [scaleConfig] - Konfigurasi skala misi opsional
 * @param {object} [tx] - Prisma transaction client opsional
 * @returns {Promise<{ starsEarned: number, newStars: number, newLevel: number }>}
 */
const awardStars = async (userId, score, scaleConfig = null, tx = null) => {
  const client = tx || prisma;
  const starsEarned = calculateStars(score, scaleConfig);

  if (starsEarned <= 0) {
    const user = await client.user.findUnique({
      where: { userId },
      select: { stars: true, level: true }
    });
    return {
      starsEarned: 0,
      newStars: user ? user.stars : 0,
      newLevel: user ? user.level : 1
    };
  }

  const user = await client.user.findUnique({
    where: { userId },
    select: { stars: true }
  });

  if (!user) {
    throw new Error(`User dengan id "${userId}" tidak ditemukan.`);
  }

  const newStars = (user.stars || 0) + starsEarned;
  const newLevel = calculateLevel(newStars);

  await client.user.update({
    where: { userId },
    data: {
      stars: newStars,
      level: newLevel
    }
  });

  return {
    starsEarned,
    newStars,
    newLevel
  };
};

module.exports = {
  STAR_LEVEL_THRESHOLDS,
  calculateStars,
  calculateLevel,
  awardStars
};
