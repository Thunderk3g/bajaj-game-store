import { useState } from 'react';

/**
 * FormInput component with built-in error display
 */
export function FormInput({ id, label, error, className = '', ...inputProps }) {
    return (
        <div className="form-group">
            {label && (
                <label className="form-label" htmlFor={id}>
                    {label}
                </label>
            )}
            <input
                id={id}
                className={`form-input ${error ? 'form-input--error' : ''} ${className}`}
                autoComplete="off"
                {...inputProps}
            />
            <div className="form-error">{error || ''}</div>
        </div>
    );
}

/**
 * Checkbox component
 */
export function Checkbox({ id, label, checked, onChange }) {
    return (
        <div className="form-group">
            <div
                className="checkbox-wrapper"
                role="checkbox"
                aria-checked={checked}
                tabIndex={0}
                onClick={() => onChange(!checked)}
                onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(!checked); } }}
            >
                <div className={`checkbox-box ${checked ? 'checkbox-box--checked' : ''}`} />
                <span
                    className="checkbox-label"
                    dangerouslySetInnerHTML={{ __html: label }}
                />
            </div>
        </div>
    );
}
