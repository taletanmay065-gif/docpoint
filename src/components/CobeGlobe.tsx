import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

export default function CobeGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;
    
    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 1000,
      height: 1000,
      phi: 0,
      theta: 0.3,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.95, 0.95, 0.95],
      markerColor: [0.2, 0.4, 1.0],
      glowColor: [1, 1, 1],
      markers: [
        // Representing doctors globally
        { location: [37.7595, -122.4367], size: 0.05 }, // SF
        { location: [40.7128, -74.006], size: 0.06 },   // NY
        { location: [51.5072, -0.1276], size: 0.05 },   // London
        { location: [35.6895, 139.6917], size: 0.07 },  // Tokyo
        { location: [28.6139, 77.2090], size: 0.08 },   // Delhi
        { location: [-33.8688, 151.2093], size: 0.05 }, // Sydney
        { location: [-23.5505, -46.6333], size: 0.05 }, // Sao Paulo
        { location: [48.8566, 2.3522], size: 0.04 },    // Paris
        { location: [1.3521, 103.8198], size: 0.05 },   // Singapore
        { location: [25.2048, 55.2708], size: 0.06 },   // Dubai
      ],
      onRender: (state: any) => {
        state.phi = phi;
        phi += 0.003;
      },
    } as any);

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <div className="w-full flex items-center justify-center pointer-events-none opacity-80" style={{ perspective: '1000px' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: 'auto', maxWidth: '600px', aspectRatio: '1/1' }}
      />
    </div>
  );
}
