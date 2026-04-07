/**
 * URL Shortening Utility
 * Uses TinyURL API to shorten long share URLs.
 */

export async function shortenUrl(longUrl) {
    if (!longUrl) return null;

    try {
        console.log('[Shortener] Shortening URL:', longUrl);
        // Using TinyURL simple API
        const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`, {
            method: 'GET',
            // Note: TinyURL doesn't always support CORS, but we'll try.
            // If CORS fails, the catch block will return the long URL.
        });

        if (response.ok) {
            const shortUrl = await response.text();
            console.log('[Shortener] Success:', shortUrl);
            return shortUrl;
        }

        console.warn('[Shortener] Failed with status:', response.status);
        return longUrl; // Fallback to original URL
    } catch (error) {
        console.error('[Shortener] Error:', error);
        return longUrl; // Fallback to original URL on error (e.g. CORS)
    }
}
