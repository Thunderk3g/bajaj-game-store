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
export function Checkbox({ id, label, checked, onChange, onClickLabel, error }) {
    const handleLabelClick = (e) => {
        // If the click is on a span with the terms-link class, call onClickLabel
        if (e.target.classList.contains('terms-link')) {
            e.stopPropagation();
            if (onClickLabel) onClickLabel();
        } else {
            // Otherwise toggle the checkbox
            onChange(!checked);
        }
    };

    return (
        <div className="form-group">
            <div
                className="checkbox-wrapper"
                role="checkbox"
                aria-checked={checked}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(!checked); } }}
            >
                <div
                    className={`checkbox-box ${checked ? 'checkbox-box--checked' : ''} ${error ? 'checkbox-box--error' : ''}`}
                    onClick={() => onChange(!checked)}
                />
                <span
                    className="checkbox-label"
                    dangerouslySetInnerHTML={{ __html: label }}
                    onClick={handleLabelClick}
                />
            </div>
        </div>
    );
}
