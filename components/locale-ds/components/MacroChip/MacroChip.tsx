import './MacroChip.css';

export interface MacroChipProps extends React.HTMLAttributes<HTMLDivElement> {
  value: React.ReactNode;
  label: React.ReactNode;
  highlighted?: boolean;
}

export default function MacroChip({ value, label, highlighted = false, ...rest }: MacroChipProps) {
  const className = `macro-chip${highlighted ? ' macro-chip-highlighted' : ''}`;
  return (
    <div className={className} {...rest}>
      <span className="macro-chip-value">{value}</span>
      <span className="macro-chip-label">{label}</span>
    </div>
  );
}
