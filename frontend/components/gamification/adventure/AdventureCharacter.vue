<template>
  <div class="adventure-character pointer-events-none">
    <!-- Motivational Explorer Speech Bubble -->
    <div class="char-speech-bubble">
      <span class="bubble-sparkle">✨</span>
      <span class="bubble-text">Ayo Taklukkan Misi!</span>
    </div>

    <!-- Star Aura particles around character -->
    <div class="char-aura">
      <div class="aura-star a-star-1">★</div>
      <div class="aura-star a-star-2">★</div>
    </div>

    <div class="char-shadow"></div>
    <svg width="44" height="60" viewBox="0 0 44 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-lg">
      <!-- Backpack -->
      <rect x="24" y="20" width="9" height="12" rx="2" fill="#8B4513" stroke="#5D2E0C" stroke-width="1"/>
      <rect x="25" y="22" width="4" height="3" rx="1" fill="#A0522D"/>
      <line x1="24" y1="21" x2="19" y2="24" stroke="#5D2E0C" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="24" y1="28" x2="19" y2="28" stroke="#5D2E0C" stroke-width="1.5" stroke-linecap="round"/>
      <!-- Body -->
      <rect x="14" y="22" width="14" height="16" rx="3" fill="#E67E22"/>
      <path d="M20 22 L22 25 L24 22" stroke="#D35400" stroke-width="1" fill="none"/>
      <!-- Head -->
      <circle cx="22" cy="13" r="9" fill="#F4C68F"/>
      <circle cx="19" cy="12" r="1.5" fill="#5D3A1A"/>
      <circle cx="25" cy="12" r="1.5" fill="#5D3A1A"/>
      <path d="M19 16 Q22 18 25 16" stroke="#5D3A1A" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <circle cx="17" cy="14" r="1.8" fill="#F1948A" opacity="0.5"/>
      <circle cx="27" cy="14" r="1.8" fill="#F1948A" opacity="0.5"/>
      <!-- Explorer hat -->
      <ellipse cx="22" cy="5" rx="12" ry="3.5" fill="#8B6914"/>
      <rect x="16" y="2" width="12" height="5" rx="2.5" fill="#A0791A"/>
      <rect x="16" y="5.5" width="12" height="2" fill="#5D3A1A"/>
      <!-- Arms -->
      <path d="M14 24 Q8 27 9 33" stroke="#F4C68F" stroke-width="4.5" stroke-linecap="round" fill="none"/>
      <path d="M28 24 Q34 27 34 33" stroke="#F4C68F" stroke-width="4.5" stroke-linecap="round" fill="none"/>
      <!-- Walking stick -->
      <line x1="34" y1="32" x2="37" y2="46" stroke="#8B4513" stroke-width="2" stroke-linecap="round"/>
      <circle cx="37" cy="46" r="1.8" fill="#5D2E0C"/>
      <!-- Pants -->
      <rect x="14" y="37" width="6" height="16" rx="2.5" fill="#2C4A6E"/>
      <rect x="22" y="37" width="6" height="16" rx="2.5" fill="#2C4A6E"/>
      <!-- Boots -->
      <rect x="12" y="50" width="8" height="6" rx="2" fill="#3D1C02"/>
      <rect x="22" y="50" width="8" height="6" rx="2" fill="#3D1C02"/>
    </svg>
  </div>
</template>

<script setup>
// Pure visual component — no props needed
</script>

<style scoped>
.adventure-character {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  animation: charBob 2.4s ease-in-out infinite;
  transform-origin: bottom center;
}

/* ── Speech Bubble ───────────────────────────────────────── */
.char-speech-bubble {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.92);
  border: 1.5px solid #f59e0b;
  color: #fef08a;
  padding: 2px 7px;
  border-radius: 9999px;
  font-size: 9px;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35), 0 0 8px rgba(245, 158, 11, 0.4);
  display: flex;
  align-items: center;
  gap: 3px;
  animation: bubbleFloat 2.4s ease-in-out infinite alternate;
  z-index: 30;
}

.char-speech-bubble::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid rgba(15, 23, 42, 0.92);
}

.bubble-sparkle {
  font-size: 8px;
  animation: sparkleRotate 2s linear infinite;
}

/* ── Star Aura ───────────────────────────────────────────── */
.char-aura {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.aura-star {
  position: absolute;
  font-size: 10px;
  color: #fbbf24;
  text-shadow: 0 0 6px rgba(251, 191, 36, 0.8);
}

.a-star-1 {
  top: 10px;
  left: -8px;
  animation: starTwinkle1 2s ease-in-out infinite;
}

.a-star-2 {
  top: 18px;
  right: -8px;
  animation: starTwinkle2 2.3s ease-in-out infinite 0.6s;
}

@keyframes bubbleFloat {
  0% { transform: translateX(-50%) translateY(0); }
  100% { transform: translateX(-50%) translateY(-3px); }
}

@keyframes sparkleRotate {
  0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.7; }
  50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
}

@keyframes starTwinkle1 {
  0%, 100% { transform: scale(0.6) rotate(0deg); opacity: 0.3; }
  50% { transform: scale(1.2) rotate(45deg); opacity: 1; }
}

@keyframes starTwinkle2 {
  0%, 100% { transform: scale(1.1) rotate(0deg); opacity: 1; }
  50% { transform: scale(0.5) rotate(-45deg); opacity: 0.2; }
}

.char-shadow {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 26px;
  height: 7px;
  background: rgba(0,0,0,0.3);
  border-radius: 50%;
  filter: blur(3px);
  animation: shadowPulse 2.4s ease-in-out infinite;
}
@keyframes charBob {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-7px); }
}
@keyframes shadowPulse {
  0%, 100% { transform: translateX(-50%) scaleX(1); opacity: 0.3; }
  50% { transform: translateX(-50%) scaleX(0.7); opacity: 0.15; }
}
</style>
