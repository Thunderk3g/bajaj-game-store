import { memo } from 'react';
import PropTypes from 'prop-types';
import { useLeadForm } from '../hooks/useLeadForm.js';

const TIME_OPTIONS = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM',
];

// Get today's date in YYYY-MM-DD format for min date on picker
function getTodayString() {
    const d = new Date();
    return d.toISOString().split('T')[0];
}

function FieldError({ message }) {
    if (!message) return null;
    return (
        <p role="alert" className="text-sudoku-danger text-[0.75rem] mt-1 flex items-center gap-1">
            <span>⚠</span> {message}
        </p>
    );
}

FieldError.propTypes = { message: PropTypes.string };
FieldError.defaultProps = { message: '' };

/**
 * Lead Capture Form component.
 * Controlled inputs with real-time validation.
 */
const LeadForm = memo(function LeadForm({ title, subtitle }) {
    const { form, errors, loading, apiError, submitted, handleChange, handleSubmit } = useLeadForm();

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            className="w-full space-y-4"
            aria-label="Lead capture form"
        >
            {/* Header */}
            <div className="text-center mb-5">
                <h2 className="font-display text-[1.2rem] sm:text-[1.4rem] font-bold text-sudoku-text">
                    {title}
                </h2>
                <p className="text-sudoku-text-dim text-[0.85rem] mt-1">{subtitle}</p>
            </div>

            {/* Full Name */}
            <div>
                <label htmlFor="lead-fullName" className="label">
                    Full Name <span className="text-sudoku-danger">*</span>
                </label>
                <input
                    id="lead-fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={form.fullName}
                    onChange={handleChange}
                    disabled={loading || submitted}
                    className={`input-field ${errors.fullName ? 'border-sudoku-danger' : ''}`}
                    aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                    aria-invalid={!!errors.fullName}
                />
                <FieldError message={errors.fullName} />
            </div>

            {/* Mobile */}
            <div>
                <label htmlFor="lead-mobile" className="label">
                    Mobile Number <span className="text-sudoku-danger">*</span>
                </label>
                <input
                    id="lead-mobile"
                    name="mobile"
                    type="tel"
                    autoComplete="tel"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={form.mobile}
                    onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '');
                        handleChange({ target: { name: 'mobile', value: cleaned } });
                    }}
                    disabled={loading || submitted}
                    className={`input-field ${errors.mobile ? 'border-sudoku-danger' : ''}`}
                    aria-describedby={errors.mobile ? 'mobile-error' : undefined}
                    aria-invalid={!!errors.mobile}
                />
                <FieldError message={errors.mobile} />
            </div>

            {/* Date & Time — stacked on mobile to prevent iOS overflow/overlap */}
            <div className="flex flex-col gap-3">
                {/* Preferred Date */}
                <div>
                    <label htmlFor="lead-preferredDate" className="label">
                        Preferred Date <span className="text-sudoku-danger">*</span>
                    </label>
                    <input
                        id="lead-preferredDate"
                        name="preferredDate"
                        type="date"
                        min={getTodayString()}
                        value={form.preferredDate}
                        onChange={handleChange}
                        disabled={loading || submitted}
                        style={{ colorScheme: 'light', color: 'inherit' }}
                        className={`input-field w-full ${errors.preferredDate ? 'border-sudoku-danger' : ''}`}
                        aria-invalid={!!errors.preferredDate}
                    />
                    <FieldError message={errors.preferredDate} />
                </div>

                {/* Preferred Time */}
                <div>
                    <label htmlFor="lead-preferredTime" className="label">
                        Preferred Time <span className="text-sudoku-danger">*</span>
                    </label>
                    <select
                        id="lead-preferredTime"
                        name="preferredTime"
                        value={form.preferredTime}
                        onChange={handleChange}
                        disabled={loading || submitted}
                        className={`input-field w-full ${errors.preferredTime ? 'border-sudoku-danger' : ''}`}
                        aria-invalid={!!errors.preferredTime}
                    >
                        <option value="">Select time</option>
                        {TIME_OPTIONS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                    <FieldError message={errors.preferredTime} />
                </div>
            </div>

            {/* API Error */}
            {apiError && (
                <div role="alert" className="bg-sudoku-danger/10 border border-sudoku-danger/40 rounded-xl p-3 text-sudoku-danger text-[0.85rem]">
                    {apiError}
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                id="lead-submit-btn"
                disabled={loading || submitted}
                className="btn-primary w-full text-[1rem] py-3.5 mt-2"
            >
                {loading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-sudoku-bg border-t-transparent rounded-full animate-spin" />
                        Submitting...
                    </>
                ) : submitted ? (
                    <>✅ Submitted!</>
                ) : (
                    <>🚀 Book My Consultation</>
                )}
            </button>

            <p className="text-sudoku-muted text-[0.7rem] text-center">
                By submitting, you agree to be contacted by Bajaj Allianz Life.
            </p>
        </form>
    );
});

LeadForm.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
};

LeadForm.defaultProps = {
    title: 'Book a Free Consultation',
    subtitle: 'Our retirement advisor will reach out to you.',
};

export default LeadForm;
