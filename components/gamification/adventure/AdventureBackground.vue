<template>
  <div class="adventure-bg" aria-hidden="true">
    <!-- AI-generated background image layer (full image, tidak terpotong) -->
    <div class="bg-image-layer"></div>

    <!-- Soft gradient overlay tipis agar teks & node tetap kontras tanpa menutupi jalan -->
    <div class="bg-overlay"></div>

    <!-- Animated clouds above background -->
    <div class="clouds-layer">
      <svg class="cloud cloud-1" viewBox="0 0 140 55" fill="none">
        <ellipse cx="70" cy="36" rx="58" ry="18" fill="rgba(255,255,255,0.65)"/>
        <ellipse cx="45" cy="30" rx="32" ry="20" fill="rgba(255,255,255,0.6)"/>
        <ellipse cx="98" cy="28" rx="38" ry="18" fill="rgba(255,255,255,0.55)"/>
      </svg>
      <svg class="cloud cloud-2" viewBox="0 0 100 44" fill="none">
        <ellipse cx="50" cy="28" rx="42" ry="14" fill="rgba(255,255,255,0.5)"/>
        <ellipse cx="30" cy="23" rx="25" ry="16" fill="rgba(255,255,255,0.46)"/>
        <ellipse cx="75" cy="22" rx="28" ry="14" fill="rgba(255,255,255,0.42)"/>
      </svg>
      <svg class="cloud cloud-3" viewBox="0 0 110 48" fill="none">
        <ellipse cx="55" cy="32" rx="48" ry="15" fill="rgba(255,255,255,0.38)"/>
        <ellipse cx="33" cy="26" rx="29" ry="17" fill="rgba(255,255,255,0.35)"/>
        <ellipse cx="82" cy="24" rx="32" ry="15" fill="rgba(255,255,255,0.32)"/>
      </svg>
    </div>

    <!-- Sun / warm glow accent -->
    <div class="sun-glow"></div>
  </div>
</template>

<script setup>
// Pure decorative background — no props/logic
</script>

<style scoped>
.adventure-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
}

/* ── AI-generated background image (100% 100% agar seluruh jalan terlihat penuh) ── */
.bg-image-layer {
  position: absolute;
  inset: 0;
  background-image: url('/images/adventure_bg_wide.jpg');
  background-size: 100% 100%;
  background-position: center center;
  background-repeat: no-repeat;
}

/* ── Soft ambient overlay ──── */
.bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.05) 0%,
    rgba(0, 0, 0, 0) 40%,
    rgba(0, 0, 0, 0.08) 100%
  );
  pointer-events: none;
}

/* ── Animated clouds ─────────────────────────────────────── */
.clouds-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 38%;
  pointer-events: none;
}
.cloud {
  position: absolute;
  top: 0;
}
.cloud-1 {
  width: 200px;
  top: 4%;
  left: -200px;
  animation: cloudDrift 50s linear infinite;
  opacity: 0.75;
}
.cloud-2 {
  width: 145px;
  top: 14%;
  left: -145px;
  animation: cloudDrift 65s linear infinite;
  animation-delay: -22s;
  opacity: 0.58;
}
.cloud-3 {
  width: 165px;
  top: 7%;
  left: -165px;
  animation: cloudDrift 42s linear infinite;
  animation-delay: -10s;
  opacity: 0.48;
}
@keyframes cloudDrift {
  from { transform: translateX(0); }
  to   { transform: translateX(calc(100vw + 380px)); }
}

/* ── Sun / warm glow ─────────────────────────────────────── */
.sun-glow {
  position: absolute;
  top: -40px;
  left: 44%;
  width: 240px;
  height: 240px;
  background: radial-gradient(
    circle,
    rgba(255, 225, 80, 0.3) 0%,
    rgba(255, 185, 30, 0.14) 45%,
    transparent 70%
  );
  border-radius: 50%;
  filter: blur(28px);
  pointer-events: none;
  transform: translateX(-50%);
}
</style>
