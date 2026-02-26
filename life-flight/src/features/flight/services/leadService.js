import apiClient from './apiClient.js';

/**
 * Submit lead data to CRM.
 * @param {{ name: string, mobile: string, age: string, concern: string, score: number, mode: 'call'|'book' }} payload
 */
export const submitLead = async (payload) => {
    const body = {
        name: payload.name,
        mobile: payload.mobile,
        age: payload.age,
        concern: payload.concern,
        score: payload.score,
        mode: payload.mode,
        timestamp: new Date().toISOString(),
        source: 'LifeFlight_Game',
    };

    try {
        const response = await apiClient.post('/EurekaWSNew/service/pushData', body);
        return { success: true, data: response.data };
    } catch {
        // Optimistic success — do not block user on CRM failure
        return { success: true };
    }
};
