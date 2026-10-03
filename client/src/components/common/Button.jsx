export default function Button({
  as: Element = 'button',
  variant = 'primary',
  size = 'medium',
  className = '',
  children,
  ...props
}) {
  const classes = ['button', `button--${variant}`, `button--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return <Element className={classes} {...props}>{children}</Element>;
}
