import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Pack — the social walking app for dog parents. Earn credits for every walk.';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#FBF7F1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 72px',
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        {/* Tangerine accent bar top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '1200px',
            height: '8px',
            background: '#E08856',
            display: 'flex',
          }}
        />

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '20px' }}>
          {/* Brand row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>🐾</span>
            <span
              style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#3D2A1F',
                letterSpacing: '-0.5px',
              }}
            >
              Pack
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: '80px',
              fontWeight: '700',
              color: '#3D2A1F',
              lineHeight: '1.05',
              letterSpacing: '-2px',
              maxWidth: '900px',
              display: 'flex',
            }}
          >
            Walks worth showing up for.
          </div>

          {/* Subline */}
          <div
            style={{
              fontSize: '32px',
              color: '#7A5A45',
              maxWidth: '820px',
              lineHeight: '1.4',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>Pack — the social walking app for dog parents.</span>
            <span>Earn credits for every walk.</span>
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <span
            style={{
              fontSize: '26px',
              color: '#7A5A45',
              fontFamily: 'Georgia, serif',
              display: 'flex',
            }}
          >
            trypack.app
          </span>
          <div
            style={{
              background: '#7FA88A',
              color: '#FBF7F1',
              fontSize: '24px',
              fontWeight: '600',
              padding: '14px 28px',
              borderRadius: '40px',
              fontFamily: 'Georgia, serif',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>🎁</span>
            <span>First 200 walkers get a free custom tote</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
