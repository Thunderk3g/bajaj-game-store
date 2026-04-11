export function decryptToken(encryptedBase64: string): Record<string, any> | null;
export function encryptPayload(payload: Record<string, any>): string;
export function buildShareUrl(): string | null;
