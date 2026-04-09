import { shortenUrl } from './retirement-readiness-journey/src/utils/shortener.js';

async function test() {
    const longUrl = 'https://www.google.com';
    console.log('Testing shortener with:', longUrl);
    const shortUrl = await shortenUrl(longUrl);
    console.log('Result:', shortUrl);
}

test();
