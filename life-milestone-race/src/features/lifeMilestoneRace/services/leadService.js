/**
 * Lead submission service.
 * Abstracted API layer for submitting lead capture data.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Submit a lead to the backend.
 *
 * @param {Object} payload
 * @param {string} payload.gameId
 * @param {string} payload.name
 * @param {string} payload.mobile
 * @param {string} payload.preferredDate
 * @param {string} payload.preferredSlot
 * @param {number} payload.lifeProtectionScore
 * @param {string} payload.protectionCategory
 * @param {Array<string>} payload.riskSummary
 * @returns {Promise<Object>}
 */
export async function submitLead(payload) {
    // If no API URL is configured, use mock implementation for development
    if (!import.meta.env.VITE_API_BASE_URL) {
        console.log('[Dev] Mocking submitLead API call:', payload);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: "Lead submitted successfully (Mock)",
                    data: { leadId: "mock-lead-" + Date.now() }
                });
            }, 1000);
        });
    }

    try {
        const response = await fetch(`${API_BASE_URL}/leads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                gameId: payload.gameId,
                name: payload.name,
                mobile: payload.mobile,
                preferredDate: payload.preferredDate,
                preferredSlot: payload.preferredSlot,
                lifeProtectionScore: payload.lifeProtectionScore,
                protectionCategory: payload.protectionCategory,
                riskSummary: payload.riskSummary,
                submittedAt: new Date().toISOString(),
                source: 'life-milestone-race',
            }),
        });

        if (!response.ok) {
            throw new Error(`Lead submission failed: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        // In production, this would integrate with error monitoring (e.g., Sentry)
        throw error;
    }
}

export default { submitLead };
