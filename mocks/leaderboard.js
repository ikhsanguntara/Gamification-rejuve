import { mockCrews } from './crews.js'

/**
 * Mock Data: Leaderboard initial ranking derived from mockCrews sorted by stars descending
 */

export const mockLeaderboard = mockCrews
  .slice()
  .sort((a, b) => b.stars - a.stars)
  .map((crew, index) => ({
    rank: index + 1,
    crewId: crew.id,
    name: crew.name,
    code: crew.code,
    avatar: crew.avatar,
    position: crew.position,
    department: crew.department,
    batchId: crew.batchId,
    stars: crew.stars,
    level: crew.level,
    completedMissions: crew.completedMissions,
    averageScore: crew.averageScore,
    rankChange: index === 0 ? 'same' : index % 2 === 0 ? 'up' : 'same',
    rankChangeAmount: index % 2 === 0 ? 1 : 0
  }))
