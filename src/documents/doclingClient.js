const axios = require("axios");
const fs = require("fs");
const { spawn } = require("child_process");

function endpoint() { return String(process.env.PRIME_DOCLING_URL || "").trim(); }

async function convert(filePath, mimeType = "") {
  if (endpoint()) {
    try {
      const data = fs.readFileSync(filePath).toString("base64");
      const r = await axios.post(endpoint(), { filePath, mimeType, data }, { timeout: 120_000 });
      if (typeof r.data?.markdown === "string") return r.data.markdown;
      if (typeof r.data?.text === "string") return r.data.text;
    } catch {}
  }
  if (String(process.env.PRIME_DOCLING_CLI || "false").toLowerCase() === "true") {
    return await new Promise(resolve => {
      const p = spawn(process.env.PRIME_DOCLING_COMMAND || "docling", [filePath], { shell: true });
      let out = ""; p.stdout.on("data", d => out += d.toString()); p.on("close", () => resolve(out.trim() || null)); p.on("error", () => resolve(null));
    });
  }
  return null;
}

module.exports = { convert, enabled: () => Boolean(endpoint()) || String(process.env.PRIME_DOCLING_CLI || "false").toLowerCase() === "true" };
