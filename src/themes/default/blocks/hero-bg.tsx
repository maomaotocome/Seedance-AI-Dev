'use client';

import React, { lazy, Suspense, useEffect, useState } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

function SplineFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(123,92,255,0.22),transparent_30%),radial-gradient(circle_at_78%_32%,rgba(67,208,255,0.14),transparent_24%),radial-gradient(circle_at_20%_72%,rgba(140,87,255,0.12),transparent_22%)]" />
      <div
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cg fill='white' fill-opacity='0.18'%3E%3Ccircle cx='16' cy='18' r='1.1'/%3E%3Ccircle cx='74' cy='36' r='0.9'/%3E%3Ccircle cx='132' cy='24' r='1.2'/%3E%3Ccircle cx='42' cy='96' r='1'/%3E%3Ccircle cx='110' cy='88' r='0.95'/%3E%3Ccircle cx='154' cy='132' r='1.15'/%3E%3Ccircle cx='24' cy='148' r='0.85'/%3E%3Ccircle cx='92' cy='156' r='1.05'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
      <div className="absolute inset-x-0 top-[-8%] h-[58%] bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_52%)]" />
    </div>
  );
}

export default function HeroBg() {
  const [shouldRenderSpline, setShouldRenderSpline] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let idleId: number | undefined;

    const enableSpline = () => {
      if (mounted) {
        setShouldRenderSpline(true);
      }
    };

    const connection =
      typeof navigator !== 'undefined'
        ? ((
            navigator as Navigator & {
              connection?: { saveData?: boolean };
            }
          ).connection ?? null)
        : null;

    const canUseSpline =
      typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 1024px)').matches;

    if (connection?.saveData || !canUseSpline) {
      return () => {
        mounted = false;
      };
    }

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(enableSpline, { timeout: 2500 });
    } else {
      timeoutId = setTimeout(enableSpline, 1500);
    }

    return () => {
      mounted = false;
      if (
        idleId &&
        typeof window !== 'undefined' &&
        'cancelIdleCallback' in window
      ) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {shouldRenderSpline ? (
          <Suspense fallback={<SplineFallback />}>
            <Spline
              style={{
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
              scene="https://prod.spline.design/5CyAYo7535K1c3WK/scene.splinecode"
            />
          </Suspense>
        ) : (
          <SplineFallback />
        )}

        {/* Enhanced gradient overlay for better text readability */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `
              linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.3) 25%, rgba(0, 0, 0, 0.3) 75%, rgba(0, 0, 0, 0.8)),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, transparent 30%, transparent 60%, rgba(0, 0, 0, 0.9))
            `,
            pointerEvents: 'none',
          }}
        />

        {/* Additional shadow layer for enhanced text contrast */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `
              radial-gradient(circle at center, transparent 20%, rgba(0, 0, 0, 0.2) 60%, rgba(0, 0, 0, 0.4) 100%)
            `,
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}
