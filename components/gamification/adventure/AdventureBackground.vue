<template>
  <div class="adventure-bg" aria-hidden="true">
    <!-- Sky gradient base -->
    <div class="sky-layer"></div>

    <!-- Animated clouds -->
    <div class="clouds-layer">
      <svg class="cloud cloud-1" viewBox="0 0 120 50" fill="none">
        <ellipse cx="60" cy="32" rx="50" ry="16" fill="rgba(255,255,255,0.55)"/>
        <ellipse cx="40" cy="28" rx="28" ry="18" fill="rgba(255,255,255,0.5)"/>
        <ellipse cx="80" cy="26" rx="32" ry="16" fill="rgba(255,255,255,0.45)"/>
      </svg>
      <svg class="cloud cloud-2" viewBox="0 0 90 40" fill="none">
        <ellipse cx="45" cy="26" rx="38" ry="13" fill="rgba(255,255,255,0.4)"/>
        <ellipse cx="28" cy="22" rx="22" ry="14" fill="rgba(255,255,255,0.38)"/>
        <ellipse cx="65" cy="20" rx="24" ry="13" fill="rgba(255,255,255,0.35)"/>
      </svg>
      <svg class="cloud cloud-3" viewBox="0 0 100 44" fill="none">
        <ellipse cx="50" cy="30" rx="44" ry="14" fill="rgba(255,255,255,0.35)"/>
        <ellipse cx="30" cy="25" rx="26" ry="16" fill="rgba(255,255,255,0.32)"/>
        <ellipse cx="74" cy="23" rx="28" ry="14" fill="rgba(255,255,255,0.3)"/>
      </svg>
    </div>

    <!-- Sun/glow -->
    <div class="sun-glow"></div>

    <!-- Mountain layer - far (lighter, more distant) -->
    <svg class="mountain-layer mountain-far" viewBox="0 0 1200 300" preserveAspectRatio="none" fill="none">
      <path d="M0 300 L0 200 Q100 140 200 180 Q280 210 350 160 Q420 110 500 150 Q560 180 620 140 Q680 100 750 130 Q810 155 870 110 Q930 65 1000 90 Q1060 110 1100 80 Q1150 55 1200 70 L1200 300 Z"
        fill="#4A5240" opacity="0.75"/>
    </svg>

    <!-- Mountain layer - mid (darker) -->
    <svg class="mountain-layer mountain-mid" viewBox="0 0 1200 280" preserveAspectRatio="none" fill="none">
      <path d="M0 280 L0 220 Q60 180 130 200 Q200 220 260 185 Q320 148 400 170 Q460 190 520 162 Q590 130 660 158 Q720 180 800 155 Q870 128 940 148 Q1010 165 1080 140 Q1140 118 1200 130 L1200 280 Z"
        fill="#3A4630" opacity="0.85"/>
    </svg>

    <!-- Jungle/forest mid layer - trees silhouette -->
    <svg class="jungle-layer" viewBox="0 0 1200 220" preserveAspectRatio="none" fill="none">
      <!-- Dense forest left side -->
      <g opacity="0.9">
        <path d="M0 220 L0 155 Q15 130 30 155 Q45 130 60 145 Q75 120 90 140 Q105 115 120 135 L120 220 Z" fill="#1F3A1C"/>
        <path d="M80 220 L80 140 Q95 112 112 135 Q130 108 148 128 Q165 100 182 125 L182 220 Z" fill="#2D6A4F"/>
        <path d="M160 220 L160 145 Q177 118 196 140 Q213 112 232 135 Q250 105 268 128 L268 220 Z" fill="#1F3A1C"/>
      </g>
      <!-- Forest middle -->
      <g opacity="0.85">
        <path d="M250 220 L250 150 Q268 125 285 148 Q303 120 320 145 Q338 118 356 142 L356 220 Z" fill="#2D5A27"/>
        <path d="M330 220 L330 142 Q348 115 366 138 Q384 110 404 135 Q422 108 440 132 L440 220 Z" fill="#1F3A1C"/>
        <path d="M420 220 L420 148 Q438 122 458 145 Q476 118 494 142 L494 220 Z" fill="#2D6A4F"/>
      </g>
      <!-- River area - clearing (lighter) -->
      <path d="M500 220 L500 165 Q520 150 540 165 Q560 150 580 165 L580 220 Z" fill="#2D5A27" opacity="0.7"/>
      <!-- Forest right side -->
      <g opacity="0.88">
        <path d="M560 220 L560 145 Q578 118 596 142 Q614 115 634 140 Q652 112 670 138 L670 220 Z" fill="#1F3A1C"/>
        <path d="M650 220 L650 138 Q668 112 688 135 Q706 108 726 132 Q745 105 764 130 L764 220 Z" fill="#2D6A4F"/>
        <path d="M740 220 L740 145 Q758 118 778 142 Q798 115 818 140 L818 220 Z" fill="#1F3A1C"/>
        <path d="M800 220 L800 140 Q820 112 840 138 Q862 110 882 135 Q902 108 920 132 L920 220 Z" fill="#2D5A27"/>
        <path d="M900 220 L900 142 Q920 115 942 138 Q962 112 982 135 L982 220 Z" fill="#1F3A1C"/>
        <path d="M965 220 L965 138 Q985 110 1008 135 Q1030 108 1052 132 Q1072 105 1092 130 L1092 220 Z" fill="#2D6A4F"/>
        <path d="M1080 220 L1080 145 Q1100 118 1120 142 Q1140 115 1160 140 Q1180 112 1200 138 L1200 220 Z" fill="#1F3A1C"/>
      </g>
    </svg>

    <!-- River / terrain foreground -->
    <svg class="terrain-layer" viewBox="0 0 1200 160" preserveAspectRatio="none" fill="none">
      <!-- Ground terrain -->
      <path d="M0 160 L0 90 Q50 75 100 88 Q150 100 200 85 Q250 70 300 82 Q350 92 400 78 Q450 64 500 76 Q550 86 600 72 Q650 58 700 70 Q750 80 800 67 Q850 55 900 66 Q950 76 1000 63 Q1050 50 1100 62 Q1150 72 1200 60 L1200 160 Z"
        fill="#3B5E2B"/>
      <!-- River winding through -->
      <path d="M400 160 L415 100 Q430 80 450 95 Q468 108 480 90 Q495 72 510 85 L520 160 Z"
        fill="#5B9BD5" opacity="0.7"/>
      <!-- River shimmer -->
      <path d="M418 130 Q435 115 455 128 Q472 140 490 125"
        stroke="rgba(255,255,255,0.5)" stroke-width="2" fill="none"/>
      <!-- Rocks near river -->
      <ellipse cx="390" cy="115" rx="12" ry="7" fill="#5A4A3A" opacity="0.8"/>
      <ellipse cx="535" cy="118" rx="10" ry="6" fill="#5A4A3A" opacity="0.7"/>
      <!-- Path/ground highlight -->
      <path d="M0 160 L0 135 Q200 125 400 135 Q600 145 800 132 Q1000 120 1200 128 L1200 160 Z"
        fill="#4A7A35" opacity="0.6"/>
    </svg>

    <!-- Foreground ground -->
    <div class="ground-layer"></div>
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

.sky-layer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    170deg,
    #FF8C42 0%,
    #FFAA55 15%,
    #FFD166 38%,
    #FFF4BB 52%,
    #E8F5C8 65%,
    #C8E6A8 78%,
    #A8D888 90%,
    #88C868 100%
  );
}

.clouds-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40%;
  pointer-events: none;
}
.cloud {
  position: absolute;
  top: 0;
}
.cloud-1 {
  width: 180px;
  top: 5%;
  left: -180px;
  animation: cloudDrift1 45s linear infinite;
  opacity: 0.85;
}
.cloud-2 {
  width: 130px;
  top: 15%;
  left: -130px;
  animation: cloudDrift1 60s linear infinite;
  animation-delay: -20s;
  opacity: 0.7;
}
.cloud-3 {
  width: 150px;
  top: 8%;
  left: -150px;
  animation: cloudDrift1 38s linear infinite;
  animation-delay: -8s;
  opacity: 0.65;
}
@keyframes cloudDrift1 {
  from { transform: translateX(0); }
  to { transform: translateX(calc(100vw + 300px)); }
}

.sun-glow {
  position: absolute;
  top: -60px;
  right: 15%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,215,60,0.45) 0%, rgba(255,165,20,0.2) 40%, transparent 70%);
  border-radius: 50%;
  filter: blur(20px);
  pointer-events: none;
}

.mountain-layer {
  position: absolute;
  bottom: 35%;
  left: 0;
  width: 100%;
}
.mountain-far { bottom: 38%; }
.mountain-mid { bottom: 33%; }

.jungle-layer {
  position: absolute;
  bottom: 22%;
  left: 0;
  width: 100%;
}

.terrain-layer {
  position: absolute;
  bottom: 10%;
  left: 0;
  width: 100%;
}

.ground-layer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 12%;
  background: linear-gradient(180deg, #3B5E2B 0%, #2D4A1E 100%);
}
</style>
