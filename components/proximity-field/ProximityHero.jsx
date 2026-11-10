'use client';

/**
 * ProximityHero
 * Everything together: the 3D field, the corner note and the tuner panel.
 * This is the one to drop on a page.
 *
 *   <ProximityHero />                     // 80vh tall, tuner visible
 *   <ProximityHero height="100vh" />
 *   <ProximityHero showTuner={false} />   // field + note only
 *   <ProximityHero showNote={false} />
 */

import { useRef, useState } from 'react';
import { IBM_Plex_Mono } from 'next/font/google';
import ProximityField, { PROXIMITY_DEFAULTS } from './ProximityField';
import ProximityTuner from './ProximityTuner';
import ProximityNote from './ProximityNote';
import styles from './proximity.module.css';

const plexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export default function ProximityHero({ height = '80vh', showTuner = true, showNote = true, className = '' }) {
  const fieldRef = useRef(null);
  const [settings, setSettings] = useState(PROXIMITY_DEFAULTS);
  const [cell, setCell] = useState('drift');

  return (
    <section className={`${plexMono.variable} ${styles.root} ${className}`} style={{ height }}>
      <ProximityField ref={fieldRef} {...settings} onCursor={setCell} />
      {showNote && <ProximityNote cols={settings.cols} rows={settings.rows} cell={cell} />}
      {showTuner && (
        <ProximityTuner
          settings={settings}
          onChange={setSettings}
          onReset={() => fieldRef.current?.resetView()}
        />
      )}
    </section>
  );
}
