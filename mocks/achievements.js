/**
 * Mock Data: Lencana Pencapaian (Achievements)
 */

export const mockAchievements = [
  {
    id: 'ach-001',
    title: 'Juara Misi',
    description: 'Selesaikan 10 misi operasional gerai.',
    category: 'Misi',
    icon: 'Target',
    targetValue: 10,
    currentValue: 10,
    isUnlocked: true,
    unlockedAt: '2026-08-14',
    starRewardBonus: 50
  },
  {
    id: 'ach-002',
    title: 'Nilai Sempurna',
    description: 'Dapatkan nilai sempurna 100 pada salah satu evaluasi misi.',
    category: 'Mutu',
    icon: 'Award',
    targetValue: 1,
    currentValue: 1,
    isUnlocked: true,
    unlockedAt: '2026-08-12',
    starRewardBonus: 100
  },
  {
    id: 'ach-003',
    title: 'Disiplin Mingguan',
    description: 'Selesaikan seluruh misi dalam 1 minggu penuh.',
    category: 'Disiplin',
    icon: 'CalendarCheck',
    targetValue: 1,
    currentValue: 1,
    isUnlocked: true,
    unlockedAt: '2026-08-16',
    starRewardBonus: 75
  },
  {
    id: 'ach-004',
    title: 'Peringkat #1 Gerai',
    description: 'Raih posisi nomor 1 di leaderboard bintang gerai.',
    category: 'Peringkat',
    icon: 'Crown',
    targetValue: 1,
    currentValue: 1,
    isUnlocked: true,
    unlockedAt: '2026-08-18',
    starRewardBonus: 150
  },
  {
    id: 'ach-005',
    title: 'Kolektor 1.000 Bintang',
    description: 'Kumpulkan total 1.000 ⭐ Bintang dari misi gerai.',
    category: 'Bintang',
    icon: 'Star',
    targetValue: 1000,
    currentValue: 1850,
    isUnlocked: true,
    unlockedAt: '2026-08-10',
    starRewardBonus: 100
  },
  {
    id: 'ach-006',
    title: 'Penjaga Suhu Dingin',
    description: 'Lolos audit suhu chiller 2–4°C selama 7 hari berturut-turut.',
    category: 'Suhu',
    icon: 'ShieldCheck',
    targetValue: 7,
    currentValue: 7,
    isUnlocked: true,
    unlockedAt: '2026-08-15',
    starRewardBonus: 80
  },
  {
    id: 'ach-007',
    title: 'Barista Cepat',
    description: 'Layani pesanan pelanggan di bawah 45 detik secara konsisten.',
    category: 'Layanan',
    icon: 'Zap',
    targetValue: 5,
    currentValue: 3,
    isUnlocked: false,
    unlockedAt: null,
    starRewardBonus: 120
  },
  {
    id: 'ach-008',
    title: 'Master Kebersihan Bar',
    description: 'Raih skor sanitasi dan kebersihan bar di atas 95%.',
    category: 'Kebersihan',
    icon: 'Sparkles',
    targetValue: 1,
    currentValue: 0,
    isUnlocked: false,
    unlockedAt: null,
    starRewardBonus: 100
  },
  {
    id: 'ach-009',
    title: 'Master Siklus 3 Minggu',
    description: 'Tuntaskan seluruh 12 misi dalam 1 siklus batch penuh.',
    category: 'Siklus',
    icon: 'Trophy',
    targetValue: 12,
    currentValue: 6,
    isUnlocked: false,
    unlockedAt: null,
    starRewardBonus: 250
  },
  {
    id: 'ach-010',
    title: 'Bintang Legenda',
    description: 'Capai level tertinggi Level 10 (Star Legend).',
    category: 'Level',
    icon: 'Medal',
    targetValue: 3500,
    currentValue: 1850,
    isUnlocked: false,
    unlockedAt: null,
    starRewardBonus: 500
  }
]
