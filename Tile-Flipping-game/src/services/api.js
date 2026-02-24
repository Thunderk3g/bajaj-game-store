/**
 * API SERVICE
 * Encapsulates all backend communication.
 * Replace the simulated fetch calls with real endpoints when the backend is ready.
 */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Submit lead data */
export async function submitLead({ name, phone }) {
    await delay(800); // Simulate network
    // Replace with: return fetch('/api/lead', { method: 'POST', body: JSON.stringify({ name, phone }) })
    console.info('[API] Lead submitted:', { name, phone });
    return { success: true };
}

/** Submit score data */
export async function submitScore({ name, phone, score, flips, elapsed }) {
    await delay(300);
    // Replace with: return fetch('/api/score', { method: 'POST', ... })
    console.info('[API] Score submitted:', { name, phone, score, flips, elapsed });
    return { success: true };
}

/** Book a consultation slot */
export async function bookSlot({ name, phone, preferredDate, preferredTime }) {
    await delay(1000);
    // Replace with: return fetch('/api/book-slot', { method: 'POST', ... })
    console.info('[API] Slot booked:', { name, phone, preferredDate, preferredTime });
    return { success: true, bookingId: `BK-${Date.now()}` };
}
