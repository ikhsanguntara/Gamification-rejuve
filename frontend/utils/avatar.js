/**
 * Avatar Utility: Helper untuk avatar kartun lucu DiceBear Avataaars
 */

export const AVATAR_SEEDS = [
  'Felix',
  'Aneka',
  'Sasha',
  'Jasper',
  'Leo',
  'Bailey',
  'Sam',
  'Maya',
  'Alex',
  'Charlie',
  'Topik',
  'Bintang',
  'Dayat',
  'Rian',
  'Nadia',
  'Sarah',
  'Dimas',
  'Putri',
  'Kevin',
  'Citra',
  'Budi',
  'Rani',
  'Doni',
  'Tari',
  'Bayu'
]

export function getRandomAvatar(seed = '') {
  if (seed && typeof seed === 'string') {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`
  }
  const randomSeed = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)]
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(randomSeed)}`
}

export function pickRandomAvatar() {
  const randomSeed = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)] + '-' + Math.floor(Math.random() * 10000)
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(randomSeed)}`
}

