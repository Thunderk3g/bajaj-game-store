import React from 'react';

interface Props {
  onPlay: () => void;
}

const IntroScreen: React.FC<Props> = ({ onPlay }) => (
  <div
    className="screen-scroll flex min-h-full w-full flex-col items-center justify-center"
    style={{
      background: 'radial-gradient(circle at top, #24104b 0%, #120326 52%, #080114 100%)',
    }}
  >
    <div className="relative flex h-full min-h-0 w-full max-w-md flex-col justify-end overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-0 overflow-hidden rounded-none">
        <img
          src={new URL('intro_page.png', import.meta.url).href}
          alt="Pulse Breaker intro"
          className="h-full w-full object-cover object-top"
          style={{
            minHeight: 'var(--app-height, 100vh)',
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-36"
        style={{
          background: 'linear-gradient(180deg, rgba(8,1,20,0) 0%, rgba(8,1,20,0.7) 45%, rgba(8,1,20,0.96) 100%)',
        }}
      />

      <div
        className="relative z-10 mt-auto w-full"
        style={{
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
        }}
      >
        <button
          onClick={onPlay}
          className="w-full rounded-full py-4 text-lg font-extrabold tracking-wide text-white btn-press"
          style={{
            background: 'linear-gradient(90deg, #ff2d78, #ff6bb3)',
            boxShadow: '0 0 18px rgba(255,45,120,0.7), 0 6px 24px rgba(255,45,120,0.4)',
          }}
        >
          PLAY
        </button>
      </div>
    </div>
  </div>
);

export default IntroScreen;
