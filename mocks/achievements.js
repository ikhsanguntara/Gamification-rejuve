/**
 * Mock Data: 10 Gamification Achievements
 */

export const mockAchievements = [
  {
    id: 'ach-001',
    title: 'Mission Master',
    description: 'Successfully complete 10 operational missions across any active batch.',
    category: 'Missions',
    icon: 'Target',
    targetValue: 10,
    currentValue: 18,
    isUnlocked: true,
    unlockedAt: '2026-08-14',
    starRewardBonus: 50
  },
  {
    id: 'ach-002',
    title: 'Perfect Score',
    description: 'Achieve a flawless 100/100 score on any mission evaluation.',
    category: 'Excellence',
    icon: 'Award',
    targetValue: 1,
    currentValue: 1,
    isUnlocked: true,
    unlockedAt: '2026-08-12',
    starRewardBonus: 100
  },
  {
    id: 'ach-003',
    title: 'Consistent Performer',
    description: 'Complete 100% of all assigned missions in a single week.',
    category: 'Consistency',
    icon: 'CalendarCheck',
    targetValue: 3,
    currentValue: 3,
    isUnlocked: true,
    unlockedAt: '2026-08-16',
    starRewardBonus: 75
  },
  {
    id: 'ach-004',
    title: 'Top Performer',
    description: 'Reach the #1 position on the batch star leaderboard.',
    category: 'Ranking',
    icon: 'Crown',
    targetValue: 1,
    currentValue: 1,
    isUnlocked: true,
    unlockedAt: '2026-08-18',
    starRewardBonus: 150
  },
  {
    id: 'ach-005',
    title: 'Star Collector',
    description: 'Accumulate a career total of 1,000 Stars.',
    category: 'Stars',
    icon: 'Star',
    targetValue: 1000,
    currentValue: 1850,
    isUnlocked: true,
    unlockedAt: '2026-08-15',
    starRewardBonus: 200
  },
  {
    id: 'ach-006',
    title: 'Rising Star',
    description: 'Advance to Star Level 5 by earning stars through approved missions.',
    category: 'Progression',
    icon: 'TrendingUp',
    targetValue: 5,
    currentValue: 8,
    isUnlocked: true,
    unlockedAt: '2026-08-11',
    starRewardBonus: 50
  },
  {
    id: 'ach-007',
    title: 'Star Legend (Level 10)',
    description: 'Reach the pinnacle of performance: Star Level 10 (3,500 Stars).',
    category: 'Progression',
    icon: 'Sparkles',
    targetValue: 3500,
    currentValue: 1850,
    isUnlocked: false,
    unlockedAt: null,
    starRewardBonus: 500
  },
  {
    id: 'ach-008',
    title: 'Zero Revision Veteran',
    description: 'Get 5 consecutive supervisor evaluations approved by Head without any revision requests.',
    category: 'Quality',
    icon: 'ShieldCheck',
    targetValue: 5,
    currentValue: 4,
    isUnlocked: false,
    unlockedAt: null,
    starRewardBonus: 120
  },
  {
    id: 'ach-009',
    title: 'Safety Guardian',
    description: 'Complete 8 safety inspection missions with an average score of 90+.',
    category: 'Safety',
    icon: 'CheckCircle2',
    targetValue: 8,
    currentValue: 6,
    isUnlocked: false,
    unlockedAt: null,
    starRewardBonus: 80
  },
  {
    id: 'ach-010',
    title: 'Cycle Champion',
    description: 'Complete all 3 weeks of a batch cycle with zero overdue missions.',
    category: 'Completion',
    icon: 'Trophy',
    targetValue: 3,
    currentValue: 1,
    isUnlocked: false,
    unlockedAt: null,
    starRewardBonus: 250
  }
]
