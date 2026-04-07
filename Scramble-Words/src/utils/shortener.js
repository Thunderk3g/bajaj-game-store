/**
 * URL Shortening Utility
 * Uses TinyURL API to shorten long share URLs.
 */

export async function shortenUrl(longUrl) {
    if (!longUrl) return null;

    try {
        console.log('[Shortener] Shortening URL:', longUrl);
        const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`, {
            method: 'GET',
        });

        if (response.ok) {
            const shortUrl = await response.text();
            console.log('[Shortener] Success:', shortUrl);
            return shortUrl;
        }

        console.warn('[Shortener] Failed with status:', response.status);
        return longUrl;
    } catch (error) {
        console.error('[Shortener] Error:', error);
        return longUrl;
    }
}
