const ftp = require("basic-ftp");
const path = require("path");
require("dotenv").config();

const config = {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    remoteDir: process.env.FTP_REMOTE_DIR || "/www",
    localDir: path.join(__dirname, "../dist/nutrisnap/browser")
};

async function deploy() {
    console.log("-----------------------------------------");
    console.log("🚀 NutriSnap FTP Deploy");
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
            secure: false
        });
        console.log("🔓 Connected.");

        await client.ensureDir(config.remoteDir);
        await client.uploadFromDir(config.localDir, config.remoteDir);

        console.log("✅ Deploy complete.");
    } catch (err) {
        console.error("❌ Deploy failed:", err.message);
        process.exit(1);
    } finally {
        client.close();
    }
}

deploy();
