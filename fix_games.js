const fs = require('fs');
const path = require('path');

// Use process.cwd() to make paths relative to where the script is run
const ROOT_DIR = process.cwd();

const games = [
    'Snake-Life',
    'Tile-Flipping-game',
    'financial-tetris',
    'life-flight',
    'life-goals',
    'life-milestone-race',
    'life-shield-bomber',
    'life-sorted',
    'one-life',
    'quiz-game',
    'retirement-readiness-journey',
    'retirement-sudoku',
    'secure-saga',
    'Scramble-Words' // Added Scramble-Words for consistency
];

games.forEach(game => {
    const mainPath = path.join(ROOT_DIR, game, 'src', 'main.jsx');
    if (fs.existsSync(mainPath)) {
        let content = fs.readFileSync(mainPath, 'utf8');
        
        // Find the block starting with token check and ending with hasParams check
        // Indentation handles both 2-space and 4-space files
        const pattern = /if\s*\(token.*\)\s*\{[\s\S]*?if\s*\(hasParams\)/;
        
        const newBlock = `if (token) {
            hasParams = true;
            if (token !== 'GUEST_SESSION') {
                sessionStorage.setItem('gamification_rawToken', token);
                const payload = decryptToken(token);
                if (payload) {
                    ['game_id', 'emp_id', 'emp_name', 'emp_mobile', 'location', 'zone'].forEach(k => { if (payload[k] != null) sessionStorage.setItem(\`gamification_\${k}\`, String(payload[k])); });
                    sessionStorage.setItem('gamification_referral', payload.referral || 'N');
                }
            }
        }
        if (hasParams)`;

        if (pattern.test(content)) {
            content = content.replace(pattern, newBlock);
            fs.writeFileSync(mainPath, content, 'utf8');
            console.log(`✅ Robust fix applied to ${game}`);
        } else {
            // Already fixed or structure differs
            if (content.includes('GUEST_SESSION')) {
                console.log(`❕ ${game} already fixed or contains GUEST_SESSION check`);
            } else {
                console.warn(`⚠️ Could not match block pattern for ${game}`);
            }
        }
    } else {
        // Log skip if folder doesn't exist (e.g. if one game is missing)
        console.warn(`⏭ Skipping: ${game} (folder not found)`);
    }
});
