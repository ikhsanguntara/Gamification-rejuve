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

    <!-- Sun / warm glow accent with sunbeams -->
    <div class="sun-glow"></div>
    <div class="sunbeam-shimmer"></div>

    <!-- ✨ Ambient Golden Fireflies & Sparkles Floating Layer ✨ -->
    <div class="fireflies-layer">
      <div v-for="i in 14" :key="`ff-${i}`" :class="`firefly ff-${i}`"></div>
    </div>
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

/* ── Sun / warm glow & subtle sunbeam shimmer ─────────────── */
.sun-glow {
  position: absolute;
  top: -40px;
  left: 44%;
  width: 280px;
  height: 280px;
  background: radial-gradient(
    circle,
    rgba(255, 235, 120, 0.45) 0%,
    rgba(255, 185, 30, 0.22) 45%,
    transparent 70%
  );
  border-radius: 50%;
  filter: blur(28px);
  pointer-events: none;
  transform: translateX(-50%);
  animation: sunPulsate 6s ease-in-out infinite alternate;
}

.sunbeam-shimmer {
  position: absolute;
  top: 0;
  left: 20%;
  right: 20%;
  height: 60%;
  background: radial-gradient(
    ellipse at 50% 0%,
    rgba(254, 240, 138, 0.12) 0%,
    rgba(253, 224, 71, 0.05) 50%,
    transparent 80%
  );
  pointer-events: none;
  animation: beamBreathe 8s ease-in-out infinite alternate;
}

@keyframes sunPulsate {
  0% { transform: translateX(-50%) scale(0.95); opacity: 0.8; }
  100% { transform: translateX(-50%) scale(1.1); opacity: 1; }
}

@keyframes beamBreathe {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}

/* ── ✨ Floating Fireflies & Golden Sparkles ──────────────── */
.fireflies-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.firefly {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #fef08a;
  box-shadow: 0 0 8px 3px rgba(250, 204, 21, 0.9), 0 0 16px 6px rgba(234, 179, 8, 0.5);
  animation: fireflyFloat 6s ease-in-out infinite alternate, fireflyGlow 3s ease-in-out infinite alternate;
}

.ff-1  { top: 62%; left: 12%; animation-duration: 7s, 2.5s; animation-delay: 0s; }
.ff-2  { top: 52%; left: 24%; animation-duration: 8s, 3.2s; animation-delay: 1.2s; width: 6px; height: 6px; }
.ff-3  { top: 72%; left: 35%; animation-duration: 6.5s, 2.8s; animation-delay: 0.5s; }
.ff-4  { top: 48%; left: 45%; animation-duration: 9s, 3.5s; animation-delay: 2s; width: 4px; height: 4px; }
.ff-5  { top: 65%; left: 56%; animation-duration: 7.5s, 2.7s; animation-delay: 1.5s; width: 6px; height: 6px; }
.ff-6  { top: 58%; left: 68%; animation-duration: 8.5s, 3.1s; animation-delay: 0.8s; }
.ff-7  { top: 76%; left: 78%; animation-duration: 6s, 2.4s; animation-delay: 2.5s; width: 7px; height: 7px; }
.ff-8  { top: 44%; left: 88%; animation-duration: 9.5s, 3.6s; animation-delay: 1.8s; }
.ff-9  { top: 38%; left: 18%; animation-duration: 7.2s, 3.0s; animation-delay: 3s; width: 4px; height: 4px; }
.ff-10 { top: 82%; left: 48%; animation-duration: 8.2s, 2.9s; animation-delay: 0.3s; }
.ff-11 { top: 34%; left: 74%; animation-duration: 7.8s, 3.4s; animation-delay: 2.1s; width: 5px; height: 5px; }
.ff-12 { top: 85%; left: 85%; animation-duration: 6.8s, 2.6s; animation-delay: 1.4s; width: 6px; height: 6px; }
.ff-13 { top: 55%; left: 92%; animation-duration: 8.7s, 3.3s; animation-delay: 0.9s; }
.ff-14 { top: 70%; left: 6%;  animation-duration: 7.1s, 2.7s; animation-delay: 2.8s; width: 5px; height: 5px; }

@keyframes fireflyFloat {
  0% { transform: translate(0, 0) scale(0.9); }
  50% { transform: translate(14px, -18px) scale(1.15); }
  100% { transform: translate(-12px, -30px) scale(1); }
}

@keyframes fireflyGlow {
  0%, 100% { opacity: 0.25; transform: scale(0.7); }
  50% { opacity: 1; transform: scale(1.3); }
}
</style>
