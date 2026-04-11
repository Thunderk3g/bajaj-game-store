/**
 * Smart Incremental Build Script
 * ================================
 * Only rebuilds games whose source files have changed since the last build.
 *
 * Usage:
 *   node scripts/smart-build.js                  # default build (uat)
 *   node scripts/smart-build.js --env prod        # production build
 *   node scripts/smart-build.js --env preprod     # pre-prod build
 *   node scripts/smart-build.js --force           # force rebuild all
 *   node scripts/smart-build.js --env prod --force
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

// ─── CLI Args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

const forceRebuild = args.includes("--force");

let buildEnv = "";
const envIndex = args.indexOf("--env");
if (envIndex !== -1 && args[envIndex + 1]) {
    buildEnv = args[envIndex + 1]; // uat | preprod | prod
}

// ─── Constants ───────────────────────────────────────────────────────────────
const ROOT_DIR = path.resolve(__dirname, "..");
const HASH_FILE_NAME = ".build-hash";

// Files / directories within each game that affect the build output
const SOURCE_PATTERNS = [
    "src",
    "public",
    "index.html",
    "vite.config.js",
    "vite.config.ts",
    "package.json",
    "tailwind.config.js",
    "postcss.config.js",
    "tsconfig.json",
    "tsconfig.app.json",
];

// Also include any .env* files
const ENV_FILE_PATTERN = /^\.env/;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Recursively collect all file paths under a directory.
 */
function getAllFiles(dirPath, fileList = []) {
    if (!fs.existsSync(dirPath)) return fileList;

    const stat = fs.statSync(dirPath);
    if (stat.isFile()) {
        fileList.push(dirPath);
        return fileList;
    }

    const entries = fs.readdirSync(dirPath);
    for (const entry of entries) {
        // Skip node_modules and dist inside any nested dirs
        if (entry === "node_modules" || entry === "dist" || entry === ".git") continue;
        const fullPath = path.join(dirPath, entry);
        const entryStat = fs.statSync(fullPath);
        if (entryStat.isDirectory()) {
            getAllFiles(fullPath, fileList);
        } else {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

/**
 * Compute a combined MD5 hash of all source files for a game.
 */
function computeSourceHash(gameDir) {
    const hash = crypto.createHash("md5");
    const filesToHash = [];

    // Collect files from known source patterns
    for (const pattern of SOURCE_PATTERNS) {
        const fullPath = path.join(gameDir, pattern);
        if (fs.existsSync(fullPath)) {
            getAllFiles(fullPath, filesToHash);
        }
    }

    // Collect .env* files
    try {
        const rootEntries = fs.readdirSync(gameDir);
        for (const entry of rootEntries) {
            if (ENV_FILE_PATTERN.test(entry)) {
                const fullPath = path.join(gameDir, entry);
                if (fs.statSync(fullPath).isFile()) {
                    filesToHash.push(fullPath);
                }
            }
        }
    } catch { /* ignore */ }

    // Sort for deterministic hash regardless of OS file ordering
    filesToHash.sort();

    if (filesToHash.length === 0) {
        return null; // No source files found — unusual, skip gracefully
    }

    for (const file of filesToHash) {
        // Hash relative path (so moving the repo doesn't invalidate)
        const relativePath = path.relative(gameDir, file);
        hash.update(relativePath);
        hash.update(fs.readFileSync(file));
    }

    return hash.digest("hex");
}

/**
 * Read the stored build hash from dist/.build-hash
 */
function getStoredHash(gameDir) {
    const hashFilePath = path.join(gameDir, "dist", HASH_FILE_NAME);
    if (fs.existsSync(hashFilePath)) {
        return fs.readFileSync(hashFilePath, "utf-8").trim();
    }
    return null;
}

/**
 * Save the build hash into dist/.build-hash
 */
function saveHash(gameDir, hash) {
    const distDir = path.join(gameDir, "dist");
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }
    fs.writeFileSync(path.join(distDir, HASH_FILE_NAME), hash, "utf-8");
}

/**
 * Check if a game's dist/ folder has actual build output (not just the hash file).
 */
function hasDistOutput(gameDir) {
    const distDir = path.join(gameDir, "dist");
    if (!fs.existsSync(distDir)) return false;

    const entries = fs.readdirSync(distDir);
    // Must have more than just the .build-hash file
    return entries.some((e) => e !== HASH_FILE_NAME);
}

/**
 * Discover game packages from pnpm-workspace.yaml.
 */
function discoverGames() {
    const workspaceFile = path.join(ROOT_DIR, "pnpm-workspace.yaml");
    const content = fs.readFileSync(workspaceFile, "utf-8");

    const games = [];
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
        const match = line.match(/^\s*-\s*["']?([^"']+)["']?$/);
        if (match) {
            const pkgName = match[1];
            // Exclude the angular shell and root
            if (pkgName === "angular-shell") continue;

            const gameDir = path.join(ROOT_DIR, pkgName);
            if (fs.existsSync(gameDir)) {
                games.push({ name: pkgName, dir: gameDir });
            }
        }
    }
    return games;
}

/**
 * Determine the build script name for a given environment.
 */
function getBuildScript(env) {
    if (!env || env === "uat") return "build";
    return `build:${env}`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
    const startTime = Date.now();
    const games = discoverGames();
    const buildScript = getBuildScript(buildEnv);
    const envLabel = buildEnv || "default (uat)";

    console.log("");
    console.log("╔══════════════════════════════════════════════════╗");
    console.log("║        ⚡ Smart Incremental Build                ║");
    console.log("╚══════════════════════════════════════════════════╝");
    console.log("");
    console.log(`  Environment : ${envLabel}`);
    console.log(`  Build script: ${buildScript}`);
    console.log(`  Force rebuild: ${forceRebuild ? "YES" : "no"}`);
    console.log(`  Games found : ${games.length}`);
    console.log("");
    console.log("──────────────────────────────────────────────────");

    const toBuild = [];
    const skipped = [];

    for (const game of games) {
        const currentHash = computeSourceHash(game.dir);

        if (!currentHash) {
            console.log(`  ⚠  ${game.name} — no source files found, skipping`);
            skipped.push(game.name);
            continue;
        }

        if (forceRebuild) {
            toBuild.push({ ...game, hash: currentHash });
            continue;
        }

        const storedHash = getStoredHash(game.dir);
        const hasDist = hasDistOutput(game.dir);

        if (storedHash === currentHash && hasDist) {
            console.log(`  ✔  ${game.name} — no changes, skipping`);
            skipped.push(game.name);
        } else {
            const reason = !hasDist
                ? "no dist/ found"
                : !storedHash
                    ? "no previous build hash"
                    : "source files changed";
            console.log(`  🔨 ${game.name} — ${reason}, will rebuild`);
            toBuild.push({ ...game, hash: currentHash });
        }
    }

    console.log("");
    console.log("──────────────────────────────────────────────────");
    console.log(
        `  📊 Summary: ${toBuild.length} to build, ${skipped.length} skipped`,
    );
    console.log("──────────────────────────────────────────────────");
    console.log("");

    if (toBuild.length === 0) {
        console.log("  ✅ Nothing to build — all games are up to date!\n");
        return;
    }

    // Build each game sequentially
    let built = 0;
    let failed = 0;

    for (const game of toBuild) {
        const gameStart = Date.now();
        const index = `[${built + failed + 1}/${toBuild.length}]`;

        console.log(`${index} Building ${game.name}...`);

        try {
            execSync(`pnpm run ${buildScript}`, {
                cwd: game.dir,
                stdio: "inherit",
            });

            // Save the hash after successful build
            saveHash(game.dir, game.hash);

            const elapsed = ((Date.now() - gameStart) / 1000).toFixed(1);
            console.log(`  ✅ ${game.name} built successfully (${elapsed}s)\n`);
            built++;
        } catch (err) {
            console.error(`  ❌ ${game.name} build FAILED!\n`);
            failed++;
            // Don't save hash on failure — will retry next time
        }
    }

    const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log("══════════════════════════════════════════════════");
    console.log(`  ⚡ Build complete in ${totalElapsed}s`);
    console.log(`     ✅ Built: ${built}  ⏭ Skipped: ${skipped.length}  ❌ Failed: ${failed}`);
    console.log("══════════════════════════════════════════════════\n");

    if (failed > 0) {
        process.exit(1);
    }
}

main();
