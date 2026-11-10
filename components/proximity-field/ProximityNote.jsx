/**
 * ProximityNote
 * The small annotation in the bottom-left corner: grid size and the cell under the cursor.
 * Purely visual, ignores pointer events so hover still reaches the canvas.
 */

import styles from './proximity.module.css';

const pad = (n) => String(n).padStart(2, '0');

export default function ProximityNote({ cols = 48, rows = 32, cell }) {
  let cursorText = '—';
  if (cell === 'drift') cursorText = 'idle drift';
  else if (cell && typeof cell === 'object') cursorText = `col ${pad(cell.col)} · row ${pad(cell.row)}`;

  return (
    <div className={styles.note}>
      <div className={styles.noteTitle}>Proximity field</div>
      <div className={styles.noteRow}>
        <span>Grid</span>
        <span>{rows} × {cols} · {(rows * cols).toLocaleString('en-US')} blocks</span>
      </div>
      <div className={styles.noteRow}>
        <span>Cursor</span>
        <span>{cursorText}</span>
      </div>
      <div className={styles.noteHint}>Hover to raise. Drag to orbit.</div>
    </div>
  );
}
