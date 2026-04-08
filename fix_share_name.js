const fs = require('fs');
const path = require('path');

const filesToFix = [
    'Tile-Flipping-game/src/components/screens/ScoreScreen.jsx',
    'Snake-Life/src/features/game/components/ConversionScreen.jsx',
    'secure-saga/src/features/financialMatch/components/ResultScreen.jsx',
    'retirement-sudoku/src/pages/ResultPage.jsx',
    'retirement-readiness-journey/src/components/Results.jsx',
    'Scramble-Words/src/components/ResultScreen.jsx',
    'life-snakes-ladders/src/components/screens/EndScreen.tsx',
    'quiz-game/src/components/ResultsScreen.jsx',
    'life-sorted/src/features/lifeSorted/components/FinalScreen.jsx',
    'one-life/src/features/game/components/ConversionScreen.jsx',
    'life-shield-bomber/src/features/bomberman/components/ResultScreen.jsx',
    'financial-tetris/src/features/financialTetris/components/ConversionScreen.jsx',
    'life-goals/src/components/ScoreResultsScreen.jsx',
    'life-milestone-race/src/features/lifeMilestoneRace/components/ResultScreen.jsx',
    'life-milestone-race/src/features/lifeMilestoneRace/components/ConversionScreen.jsx',
    'life-flight/src/features/flight/pages/GameOverPage.jsx'
];

for (const relPath of filesToFix) {
    const fullPath = path.join(__dirname, relPath);
    if (!fs.existsSync(fullPath)) {
        console.warn('File not found:', fullPath);
        continue;
    }

    let content = fs.readFileSync(fullPath, 'utf8');

    // Find the definition of senderName or similar and replace it
    // Examples:
    // const senderName = sessionStorage.getItem('gamification_emp_name') || '';
    // const agentName = sessionStorage.getItem('gamification_emp_name') || '';
    
    // We modify it so that `senderName` becomes `<playerName> || ''`
    
    let playerNameVar = "leadData?.name";
    if (content.includes("entryDetails?.name")) {
        playerNameVar = "entryDetails?.name";
    } else if (content.includes("playerDetails?.name")) {
        playerNameVar = "playerDetails?.name";
    } else if (content.match(/formData(\?.|)name/) || content.includes("formData?.name") || (content.includes("formData") && content.includes("name"))) {
        if (content.includes("formData.name")) playerNameVar = "formData?.name";
    } else if (content.includes("leadData?.name")) {
        playerNameVar = "leadData?.name";
    } else if (content.includes("userName")) {
        playerNameVar = "userName";
    } else if (content.includes("userInfo?.name")) {
        playerNameVar = "userInfo?.name";
    }

    // Specific overrides based on known files
    if (relPath.includes('life-shield-bomber')) {
        playerNameVar = "entryDetails?.name";
    } else if (relPath.includes('secure-saga')) {
        playerNameVar = "formData?.name || userName"; 
    } else if (relPath.includes('life-goals')) {
        playerNameVar = "leadData?.name";
    } else if (relPath.includes('Tile-Flipping-game')) {
        playerNameVar = "leadData?.name";
    } else if (relPath.includes('life-flight')) {
        playerNameVar = "leadData?.name";
    }

    const pattern = /const\s+(senderName|empName|agentName)\s*=\s*sessionStorage\.getItem\(['"]gamification_emp_name['"]\)(?:\s*\|\|\s*['"][^'"]*['"])?;/g;
    
    const replacementString = `const $1 = ${playerNameVar} || '';`;
    
    const newContent = content.replace(pattern, replacementString);
    if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log('Fixed', relPath);
    } else {
        console.log('No change needed or pattern not found in', relPath);
    }
}
