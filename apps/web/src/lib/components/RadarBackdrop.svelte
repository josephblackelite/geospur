<div class="radar-backdrop" aria-hidden="true">
  <div class="radar-ring ring-one"></div>
  <div class="radar-ring ring-two"></div>
  <div class="radar-ring ring-three"></div>
  <div class="radar-sweep"></div>
</div>

<style>
  .radar-backdrop {
    position: fixed;
    inset: 0;
    overflow: hidden;
    background: radial-gradient(circle at top, rgba(16, 185, 129, 0.25), transparent 55%),
      radial-gradient(circle at bottom, rgba(14, 116, 144, 0.25), transparent 60%),
      linear-gradient(180deg, #020617 0%, #0f172a 100%);
    z-index: 0;
  }

  .radar-ring {
    position: absolute;
    border: 1px solid rgba(56, 189, 248, 0.25);
    border-radius: 999px;
    inset: 50%;
    transform: translate(-50%, -50%);
    animation: pulse 6s ease-in-out infinite;
  }

  .ring-one {
    width: 260px;
    height: 260px;
  }

  .ring-two {
    width: 520px;
    height: 520px;
    animation-delay: 0.8s;
  }

  .ring-three {
    width: 760px;
    height: 760px;
    animation-delay: 1.6s;
  }

  .radar-sweep {
    position: absolute;
    width: 520px;
    height: 520px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 999px;
    background: conic-gradient(
      from 0deg,
      rgba(14, 165, 233, 0.4),
      transparent 60deg,
      transparent 360deg
    );
    animation: sweep 7s linear infinite;
    mix-blend-mode: screen;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.3;
      transform: translate(-50%, -50%) scale(0.9);
    }
    50% {
      opacity: 0.6;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  @keyframes sweep {
    from {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
</style>
