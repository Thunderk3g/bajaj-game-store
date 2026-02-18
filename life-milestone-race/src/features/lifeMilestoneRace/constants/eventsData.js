/**
 * Events data for the Life Milestone Race.
 * Each stage has exactly 5 events.
 *
 * Scoring: +10 protected / -10 exposed (flat, no compounding).
 * Starting score: 50/100.
 *
 * Severity is visual only (for impact badge styling).
 *   high   → "High Impact" (orange badge)
 *   medium → "Medium Impact" (blue badge)
 */

const EVENTS = [
    // ───────────────────────── First Job (22–25) ─────────────────────────
    {
        id: 'fj-01',
        stage: 'first-job',
        title: 'Sudden Medical Emergency',
        severity: 'high',
        description: 'A critical health issue requires immediate hospitalisation. Medical bills are piling up fast.',
        impactProtected: 10,
        impactExposed: -10,
    },
    {
        id: 'fj-02',
        stage: 'first-job',
        title: 'Bike Accident Injury',
        severity: 'high',
        description: 'A road accident leaves you with injuries needing weeks of recovery and treatment costs.',
        impactProtected: 10,
        impactExposed: -10,
    },
    {
        id: 'fj-03',
        stage: 'first-job',
        title: 'Laptop Theft',
        severity: 'medium',
        description: 'Your work laptop and valuables are stolen from your paying guest accommodation.',
        impactProtected: 10,
        impactExposed: -10,
    },
    {
        id: 'fj-04',
        stage: 'first-job',
        title: 'Job Loss Without Savings',
        severity: 'high',
        description: 'Your startup downsizes unexpectedly and you have no emergency fund to fall back on.',
        impactProtected: 10,
        impactExposed: -10,
    },
    {
        id: 'fj-05',
        stage: 'first-job',
        title: 'First Health Insurance Decision',
        severity: 'medium',
        description: 'Your employer offers health insurance opt-in. Should you invest in comprehensive coverage?',
        impactProtected: 10,
        impactExposed: -10,
    },

    // ───────────────────────── Marriage (25–30) ─────────────────────────
    {
        id: 'mr-01',
        stage: 'marriage',
        title: 'Spouse Critical Illness',
        severity: 'high',
        description: 'Your spouse is diagnosed with a critical illness requiring expensive long-term treatment.',
        impactProtected: 10,
        impactExposed: -10,
    },
    {
        id: 'mr-02',
        stage: 'marriage',
        title: 'Home Loan EMI Default Risk',
        severity: 'high',
        description: 'An unexpected job change puts your home loan EMI payments at risk for several months.',
        impactProtected: 10,
        impactExposed: -10,
    },
    {
        id: 'mr-03',
        stage: 'marriage',
        title: 'Wedding Expense Overrun',
        severity: 'medium',
        description: 'Wedding expenses significantly exceeded the budget, eating into your emergency fund.',
        impactProtected: 10,
        impactExposed: -10,
    },
    {
        id: 'mr-04',
        stage: 'marriage',
        title: 'Joint Financial Planning Gap',
        severity: 'medium',
        description: 'Neither spouse has life insurance. A sudden event could leave the other financially stranded.',
        impactProtected: 10,
        impactExposed: -10,
    },
    {
        id: 'mr-05',
        stage: 'marriage',
        title: 'Rental Deposit Loss',
        severity: 'medium',
        description: 'Your landlord refuses to return your deposit after property damage disputes.',
        impactProtected: 10,
        impactExposed: -10,
    },

    // ───────────────────────── Parenthood (30–35) ─────────────────────────
    {
        id: 'ph-01',
        stage: 'parenthood',
        title: 'Child Born with Complications',
        severity: 'high',
        description: 'Your newborn requires NICU care and specialised treatment for several weeks.',
        impactProtected: 10,
        impactExposed: -10,
    },
    {
        id: 'ph-02',
        stage: 'parenthood',
        title: 'Daycare & Education Cost Spike',
        severity: 'medium',
        description: 'Premium childcare and education costs have doubled, straining your monthly budget.',
        impactProtected: 10,
        impactExposed: -10,
    },
    {
        id: 'ph-03',
        stage: 'parenthood',
        title: 'Parental Emergency Travel',
        severity: 'medium',
        description: 'An elderly parent falls ill in another city, requiring urgent travel and medical support.',
        impactProtected: 10,
        impactExposed: -10,
    },
    {
        id: 'ph-04',
        stage: 'parenthood',
        title: 'Income Loss During Maternity',
        severity: 'high',
        description: 'Reduced household income during parental leave creates a significant financial gap.',
        impactProtected: 10,
        impactExposed: -10,
    },
    {
        id: 'ph-05',
        stage: 'parenthood',
        title: 'Child Education Fund Crisis',
        severity: 'high',
        description: 'Rising school fees and inflation threaten the education fund you planned for your child.',
        impactProtected: 10,
        impactExposed: -10,
    },

    // ───────────────────────── Mid-Career (35–50) ─────────────────────────
    {
        id: 'mc-01',
        stage: 'mid-career',
        title: 'Disability from Workplace Injury',
        severity: 'high',
        description: 'A serious workplace accident causes partial disability, impacting your ability to earn.',
        impactProtected: 10,
        impactExposed: -10,
    },
    {
        id: 'mc-02',
        stage: 'mid-career',
        title: 'Business Venture Failure',
        severity: 'high',
        description: 'A side business investment crashes, wiping out a significant portion of your savings.',
        impactProtected: 10,
        impactExposed: -10,
    },
    {
        id: 'mc-03',
        stage: 'mid-career',
        title: "Child's Higher Education Abroad",
        severity: 'medium',
        description: 'Your child gets admission overseas. The tuition and living costs are substantial.',
        impactProtected: 10,
        impactExposed: -10,
    },
    {
        id: 'mc-04',
        stage: 'mid-career',
        title: 'Lifestyle Disease Diagnosis',
        severity: 'high',
        description: 'You are diagnosed with a chronic lifestyle disease requiring lifelong treatment and medication.',
        impactProtected: 10,
        impactExposed: -10,
    },
    {
        id: 'mc-05',
        stage: 'mid-career',
        title: 'Market Crash Hits Investments',
        severity: 'medium',
        description: 'A sudden market downturn drastically reduces your portfolio value close to a milestone goal.',
        impactProtected: 10,
        impactExposed: -10,
    },

    // ───────────────────────── Approaching Retirement (55–60) ─────────────────────────
    {
        id: 'rt-01',
        stage: 'retirement',
        title: 'Outliving Your Savings',
        severity: 'high',
        description: 'Medical advances mean you may live 15+ years post-retirement. Will your corpus last?',
        impactProtected: 10,
        impactExposed: -10,
    },
    {
        id: 'rt-02',
        stage: 'retirement',
        title: 'Inflation Eroding Pension',
        severity: 'high',
        description: 'Rising inflation has significantly reduced the purchasing power of your pension income.',
        impactProtected: 10,
        impactExposed: -10,
    },
    {
        id: 'rt-03',
        stage: 'retirement',
        title: 'Elderly Care Dependency',
        severity: 'medium',
        description: 'Your own need for full-time assisted care creates recurring monthly expenses.',
        impactProtected: 10,
        impactExposed: -10,
    },
    {
        id: 'rt-04',
        stage: 'retirement',
        title: 'Unexpected Major Surgery',
        severity: 'high',
        description: 'A complex surgery costs significantly more than your health insurance covers.',
        impactProtected: 10,
        impactExposed: -10,
    },
    {
        id: 'rt-05',
        stage: 'retirement',
        title: 'Legacy & Estate Planning Gap',
        severity: 'medium',
        description: 'Without proper estate planning, your assets may not pass smoothly to your dependents.',
        impactProtected: 10,
        impactExposed: -10,
    },
];

export default EVENTS;
