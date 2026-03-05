export class LeadService {
    constructor() {
        this.gameId = crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15);
    }

    async submitLead(leadData) {
        const payload = {
            id: this.gameId,
            timestamp: new Date().toISOString(),
            ...leadData,
            metadata: {
                userAgent: navigator.userAgent,
                screenSize: `${window.innerWidth}x${window.innerHeight}`
            }
        };

        console.log('[LeadService] Submitting Lead Data:', payload);

        // Simulate API delay
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, leadId: this.gameId });
            }, 1500);
        });
    }
}

export const leadService = new LeadService();
