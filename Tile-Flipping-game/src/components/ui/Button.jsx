

/**
 * Button component
 * @param {string}   variant   - 'primary' | 'secondary' | 'outline' | 'ghost'
 * @param {string}   size      - '' | 'lg' | 'sm'
 * @param {boolean}  fullWidth
 * @param {boolean}  loading
 * @param {string}   className
 */
export default function Button({
    children,
    variant = 'primary',
    size = '',
    fullWidth = false,
    loading = false,
    className = '',
    ...rest
}) {
    const classes = [
        'btn',
        `btn--${variant}`,
        size && `btn--${size}`,
        fullWidth && 'btn--full',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button className={classes} disabled={loading || rest.disabled} {...rest}>
            {loading ? <span className="spinner" /> : null}
            {children}
        </button>
    );
}
