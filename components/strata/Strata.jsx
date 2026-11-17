'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import StrataPanel from './StrataPanel';
import { DEFAULTS } from './config.js';
import './strata.css';

/**
 * Strata: an interactive three.js piece. Drag to turn the room.
 *
 * Props
 *   panel      show the Adjust panel (default true)
 *   caption    show the title and hint, bottom left (default true)
 *   className  extra class on the wrapper, e.g. to set its height
 */
export default function Strata({ panel = true, caption = true, className = '' }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const apiRef = useRef(null);
  const [params, setParams] = useState(DEFAULTS);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // three.js is loaded here, not at the top of the file, so it stays out of the page's
    // first bundle and never runs on the server.
    import('./scene.js')
      .then(({ createStrata }) => {
        if (cancelled || !canvasRef.current) return;
        apiRef.current = createStrata(canvasRef.current);
        apiRef.current.setGlass(rootRef.current.querySelectorAll('[data-glass]'));
        setParams(apiRef.current.params);
      })
      .catch((err) => {
        console.error('Strata could not start', err);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      apiRef.current?.dispose();
      apiRef.current = null;
    };
  }, []);

  const change = useCallback((key, value) => {
    apiRef.current?.set(key, value);
    setParams((p) => ({ ...p, [key]: value }));
  }, []);
  const changeFinish = useCallback((finish) => {
    apiRef.current?.setFinish(finish);
    setParams((p) => ({ ...p, ...finish }));
  }, []);
  const reset = useCallback(() => {
    if (apiRef.current) setParams(apiRef.current.reset());
  }, []);

  return (
    <div ref={rootRef} className={`strata ${className}`.trim()}>
      <canvas
        ref={canvasRef}
        className="strata__canvas"
        tabIndex={0}
        aria-label="Nested half-sphere shells rotating over a pedestal. Drag to turn the room."
      />
      {failed && <p className="strata__fallback">This piece needs WebGL, and this browser has it turned off.</p>}
      {caption && (
        <div className="strata__note">
          <strong>Strata</strong>
          <span>Digital sculpture. Adjust to suit your mood.</span>
        </div>
      )}
      {panel && !failed && (
        <StrataPanel params={params} onChange={change} onFinish={changeFinish} onReset={reset} />
      )}
    </div>
  );
}
