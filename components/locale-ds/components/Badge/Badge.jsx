import './Badge.css';

const VARIANT_CLASS = {
  default: 'badge-default',
  new: 'badge-new',
  'new-recipe': 'badge-new-recipe',
  premium: 'badge-premium',
  'early-access': 'badge-early-access',
  vegetarian: 'badge-vegetarian',
  spicy: 'badge-spicy',
  signature: 'badge-signature',
};

export default function Badge({
  variant = 'default',
  icon,
  children,
  className: extraClass,
  ...rest
}) {
  const iconOnly = icon && !children;
  const className = [
    'badge',
    VARIANT_CLASS[variant] || VARIANT_CLASS.default,
    iconOnly ? 'badge-icon-only' : '',
    extraClass,
  ].filter(Boolean).join(' ');

  return (
    <span className={className} {...rest}>
      {icon ? <span className="badge-icon">{icon}</span> : null}
      {children ? <span className="badge-label">{children}</span> : null}
    </span>
  );
}
