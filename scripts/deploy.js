const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");
const chokidar = require("chokidar");
require("dotenv").config();

const config = {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    remoteDir: process.env.FTP_REMOTE_DIR || "/www",
    localDir: path.join(__dirname, "../dist/nutrisnap/browser")
};

async function deployFile(client, localPath) {
    const relativePath = path.relative(config.localDir, localPath);
    const remotePath = path.join(config.remoteDir, relativePath).replace(/\\/g, "/");
    
    try {
        const timestamp = new Date().toLocaleTimeString();
        process.stdout.write(`[${timestamp}] 🚀 Transferring: ${relativePath} ... `);
        
        // Ensure remote directory exists
        await client.ensureDir(path.dirname(remotePath));
        await client.uploadFrom(localPath, remotePath);
        
        console.log("✅ SUCCESS");
    } catch (err) {
        console.log("❌ ERROR");
        console.error(`   Error details: ${err.message}`);
    }
}

async function startSync() {
    console.log("-----------------------------------------");
    console.log("🛰️  NutriSnap FTP Auto-Deploy Sync started");
    console.log(`📡 Target: ${config.host}`);
    console.log(`📁 Remote Dir: ${config.remoteDir}`);
    console.log("-----------------------------------------");

    const client = new ftp.Client();
    client.ftp.verbose = false;

    try {
        await client.access({
            host: config.host,
            user: config.user,
            password: config.password,
            secure: false // OVH default is often plain or implicit SSL, adjust if needed
        });

        console.log("🔓 Connected to FTP server.");

        const watcher = chokidar.watch(config.localDir, {
            persistent: true,
            ignoreInitial: true, // Don't sync everything at start, wait for changes
            awaitWriteFinish: {
                stabilityThreshold: 500,
                pollInterval: 100
            }
        });

        watcher.on("change", (filePath) => deployFile(client, filePath));
        watcher.on("add", (filePath) => deployFile(client, filePath));

        console.log(`👀 Watching for changes in ${config.localDir}...`);

    } catch (err) {
        console.error("❌ FTP Connection failed:", err.message);
        process.exit(1);
    }
}

// Start the process
startSync();
