const ftp = require("basic-ftp");
const path = require("path");
const chokidar = require("chokidar");
require("dotenv").config();

const config = {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    remoteDir: process.env.FTP_REMOTE_DIR || "/www",
    localDir: path.join(__dirname, "../dist/nutrisnap/browser")
};

const queue = new Set();
let isProcessing = false;
let client = null;

function enqueue(localPath) {
    queue.add(localPath);
    processQueue();
}

async function processQueue() {
    if (isProcessing || queue.size === 0) return;
    isProcessing = true;

    while (queue.size > 0) {
        const [localPath] = queue;
        queue.delete(localPath);
        await uploadFile(localPath);
    }

    isProcessing = false;
}

async function uploadFile(localPath, attempt = 1) {
    const relativePath = path.relative(config.localDir, localPath);
    const remotePath = path.join(config.remoteDir, relativePath).replace(/\\/g, "/");
    const timestamp = new Date().toLocaleTimeString();

    try {
        process.stdout.write(`[${timestamp}] 🚀 ${relativePath}${attempt > 1 ? ` (retry ${attempt})` : ""} ... `);
        await client.ensureDir(path.dirname(remotePath));
        await client.uploadFrom(localPath, remotePath);
        console.log("✅");
    } catch (err) {
        console.log("❌ " + err.message);

        const isConnError = err.message.includes("closed") || err.message.includes("ECONNRESET") || err.message.includes("FIN");
        if (isConnError && attempt < 3) {
            const ok = await reconnect();
            if (ok) return uploadFile(localPath, attempt + 1);
        }
    }
}

async function reconnect() {
    try {
        console.log("🔄 Reconnecting...");
        if (client) client.close();
        client = new ftp.Client();
        client.ftp.verbose = false;
        await client.access({
            host: config.host,
            user: config.user,
            password: config.password,
            secure: false // plain FTP — most shared hosts do not support FTPS; credentials come from .env (gitignored)
        });
        console.log("🔓 Reconnected.");
        return true;
    } catch (err) {
        console.error("❌ Reconnection failed:", err.message);
        return false;
    }
}

// Keepalive: NOOP toutes les 30s pour éviter que OVH coupe la connexion idle
function startKeepalive() {
    setInterval(async () => {
        if (!isProcessing && client && !client.closed) {
            try { await client.send("NOOP"); } catch { await reconnect(); }
        }
    }, 30000);
}

async function startSync() {
    console.log("-----------------------------------------");
    console.log("🛰️  NutriSnap FTP Auto-Deploy Sync started");
    console.log(`📡 Target: ${config.host}`);
    console.log(`📁 Remote Dir: ${config.remoteDir}`);
    console.log("-----------------------------------------");

    client = new ftp.Client();
    client.ftp.verbose = false;

    try {
        await client.access({
            host: config.host,
            user: config.user,
            password: config.password,
            secure: false // plain FTP — most shared hosts do not support FTPS; credentials come from .env (gitignored)
        });
        console.log("🔓 Connected to FTP server.");
        startKeepalive();

        const watcher = chokidar.watch(config.localDir, {
            persistent: true,
            ignoreInitial: true,
            awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 }
        });

        watcher.on("add", enqueue);
        watcher.on("change", enqueue);

        console.log(`👀 Watching for changes in ${config.localDir}...`);
    } catch (err) {
        console.error("❌ FTP Connection failed:", err.message);
        process.exit(1);
    }
}

startSync();
