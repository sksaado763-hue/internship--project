export default function Button({
  as: Element = 'button',
  variant = 'primary',
  size = 'medium',
  className = '',
  children,
  ...props
}) {
  const classes = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    'focus-visible:ring-2 focus-visible:ring-brand-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <Element className={classes} {...props}>{children}</Element>;
}
