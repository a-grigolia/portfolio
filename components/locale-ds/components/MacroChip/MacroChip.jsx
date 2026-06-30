import './MacroChip.css';

export default function MacroChip({ value, label, highlighted = false, ...rest }) {
  const className = `macro-chip${highlighted ? ' macro-chip-highlighted' : ''}`;
  return (
    <div className={className} {...rest}>
      <span className="macro-chip-value">{value}</span>
      <span className="macro-chip-label">{label}</span>
    </div>
  );
}
