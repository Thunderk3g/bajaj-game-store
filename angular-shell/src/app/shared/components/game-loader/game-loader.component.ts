import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-stage">
      <div class="aurora aurora-blue"></div>
      <div class="aurora aurora-orange"></div>

      <div class="particles">
        <span
          *ngFor="let p of particles"
          class="particle"
          [style.left.%]="p.left"
          [style.animation-delay.s]="p.delay"
          [style.animation-duration.s]="p.duration"
          [style.width.px]="p.size"
          [style.height.px]="p.size"
        ></span>
      </div>

      <div class="loader-content">
        <div class="emblem">
          <span class="ring ring-outer"></span>
          <span class="ring ring-inner"></span>
          <div class="emblem-core">
            <svg class="gamepad" viewBox="0 0 48 32" fill="none">
              <path
                d="M12.5 2h23a10.5 10.5 0 0 1 10.4 9l1.9 12.6a6.5 6.5 0 0 1-11.2 5.4L31.4 24H16.6l-5.2 5a6.5 6.5 0 0 1-11.2-5.4L2.1 11A10.5 10.5 0 0 1 12.5 2Z"
                fill="url(#padFill)"
                stroke="rgba(255,255,255,0.25)"
                stroke-width="1.5"
              />
              <path d="M14 9v8M10 13h8" stroke="#fff" stroke-width="2.4" stroke-linecap="round" />
              <circle cx="33" cy="10.5" r="2.1" fill="#FF8A2B" />
              <circle cx="38.5" cy="15.5" r="2.1" fill="#fff" opacity="0.9" />
              <defs>
                <linearGradient id="padFill" x1="0" y1="0" x2="48" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#3D7BFF" />
                  <stop offset="1" stop-color="#0047AB" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <h1 class="loader-title">
          Loading your game<span class="dots"><span>.</span><span>.</span><span>.</span></span>
        </h1>

        <div class="progress-track">
          <div class="progress-fill" [style.width.%]="progress">
            <div class="progress-shimmer"></div>
          </div>
        </div>
        <div class="progress-label">{{ progress | number: '1.0-0' }}%</div>

        <p class="loader-tip" [class.tip-visible]="tipVisible">{{ tips[tipIndex] }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      .loader-stage {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background: #02050f;
      }

      .aurora {
        position: absolute;
        border-radius: 50%;
        filter: blur(90px);
        opacity: 0.35;
        pointer-events: none;
      }

      .aurora-blue {
        width: 480px;
        height: 480px;
        left: -120px;
        top: -140px;
        background: radial-gradient(circle, #0047ab 0%, transparent 70%);
        animation: drift 14s ease-in-out infinite alternate;
      }

      .aurora-orange {
        width: 420px;
        height: 420px;
        right: -140px;
        bottom: -160px;
        background: radial-gradient(circle, #f2700f 0%, transparent 70%);
        opacity: 0.18;
        animation: drift 18s ease-in-out infinite alternate-reverse;
      }

      @keyframes drift {
        from {
          transform: translate(0, 0) scale(1);
        }
        to {
          transform: translate(60px, 40px) scale(1.15);
        }
      }

      .particles {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .particle {
        position: absolute;
        bottom: -8px;
        border-radius: 50%;
        background: rgba(61, 123, 255, 0.55);
        animation: rise linear infinite;
      }

      @keyframes rise {
        from {
          transform: translateY(0);
          opacity: 0;
        }
        12% {
          opacity: 0.8;
        }
        88% {
          opacity: 0.5;
        }
        to {
          transform: translateY(-105vh);
          opacity: 0;
        }
      }

      .loader-content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 24px;
      }

      .emblem {
        position: relative;
        width: 132px;
        height: 132px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 28px;
      }

      .ring {
        position: absolute;
        border-radius: 50%;
        border: 2px solid transparent;
      }

      .ring-outer {
        inset: 0;
        border-top-color: #3d7bff;
        border-right-color: rgba(61, 123, 255, 0.25);
        animation: spin 1.6s linear infinite;
      }

      .ring-inner {
        inset: 12px;
        border-bottom-color: #ff8a2b;
        border-left-color: rgba(255, 138, 43, 0.2);
        animation: spin 2.4s linear infinite reverse;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .emblem-core {
        width: 84px;
        height: 84px;
        border-radius: 50%;
        background: #0e1729;
        border: 1px solid rgba(61, 123, 255, 0.3);
        box-shadow: 0 0 40px rgba(61, 123, 255, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          box-shadow: 0 0 28px rgba(61, 123, 255, 0.3);
          transform: scale(1);
        }
        50% {
          box-shadow: 0 0 52px rgba(61, 123, 255, 0.55);
          transform: scale(1.05);
        }
      }

      .gamepad {
        width: 44px;
        height: 30px;
      }

      .loader-title {
        font-family: 'Fredoka', 'Space Grotesk', sans-serif;
        font-weight: 600;
        font-size: 1.55rem;
        color: #ffffff;
        letter-spacing: 0.02em;
        margin: 0 0 24px;
      }

      .dots span {
        display: inline-block;
        animation: bounce 1.2s ease-in-out infinite;
      }

      .dots span:nth-child(2) {
        animation-delay: 0.15s;
      }

      .dots span:nth-child(3) {
        animation-delay: 0.3s;
      }

      @keyframes bounce {
        0%,
        60%,
        100% {
          transform: translateY(0);
        }
        30% {
          transform: translateY(-5px);
        }
      }

      .progress-track {
        width: 240px;
        height: 8px;
        border-radius: 100px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.06);
        overflow: hidden;
      }

      .progress-fill {
        position: relative;
        height: 100%;
        border-radius: 100px;
        background: linear-gradient(90deg, #0047ab, #3d7bff);
        transition: width 0.35s ease;
        overflow: hidden;
      }

      .progress-shimmer {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          110deg,
          transparent 25%,
          rgba(255, 255, 255, 0.45) 50%,
          transparent 75%
        );
        animation: shimmer 1.4s linear infinite;
      }

      @keyframes shimmer {
        from {
          transform: translateX(-100%);
        }
        to {
          transform: translateX(100%);
        }
      }

      .progress-label {
        font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
        font-weight: 600;
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.55);
        margin-top: 10px;
        letter-spacing: 0.08em;
      }

      .loader-tip {
        font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.45);
        margin-top: 26px;
        min-height: 1.4em;
        opacity: 0;
        transition: opacity 0.45s ease;
      }

      .loader-tip.tip-visible {
        opacity: 1;
      }

      @media (max-width: 480px) {
        .emblem {
          width: 108px;
          height: 108px;
        }
        .loader-title {
          font-size: 1.25rem;
        }
        .progress-track {
          width: 200px;
        }
      }
    `,
  ],
})
export class GameLoaderComponent implements OnInit, OnDestroy {
  /**
   * When set, the progress bar fills to 100% over exactly this window
   * (fixed-duration splash). When unset, progress eases toward 96% and
   * waits for the host to unmount the loader (open-ended game load).
   */
  @Input() durationMs?: number;

  progress = 0;
  tipIndex = 0;
  tipVisible = true;

  readonly tips = [
    'Warming up the arcade machines…',
    'Polishing the high-score board…',
    'Charging up power-ups…',
    'Pressing start for you…',
    'Loading pixels, one at a time…',
  ];

  readonly particles = Array.from({ length: 14 }, (_, i) => ({
    left: (i * 7.3 + 4) % 100,
    delay: (i * 0.9) % 6,
    duration: 7 + (i % 5) * 1.6,
    size: 2 + (i % 3),
  }));

  private progressTimer?: ReturnType<typeof setInterval>;
  private tipTimer?: ReturnType<typeof setInterval>;

  ngOnInit() {
    if (this.durationMs) {
      const step = 100 / (this.durationMs / 120);
      this.progressTimer = setInterval(() => {
        this.progress = Math.min(100, this.progress + step);
      }, 120);
    } else {
      // Eased fake progress that approaches but never hits 100% — the wrapper
      // unmounts this overlay when the game iframe actually finishes loading.
      this.progressTimer = setInterval(() => {
        const remaining = 96 - this.progress;
        this.progress = Math.min(96, this.progress + Math.max(0.4, remaining * 0.045));
      }, 120);
    }

    this.tipTimer = setInterval(() => {
      this.tipVisible = false;
      setTimeout(() => {
        this.tipIndex = (this.tipIndex + 1) % this.tips.length;
        this.tipVisible = true;
      }, 450);
    }, 3200);
  }

  ngOnDestroy() {
    clearInterval(this.progressTimer);
    clearInterval(this.tipTimer);
  }
}
