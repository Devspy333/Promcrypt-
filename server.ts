import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ dest: 'uploads/' });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to decrypt Prometheus files
  app.post("/api/decrypt-prometheus", upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const inputPath = req.file.path;
    const outputPath = `${inputPath}_decrypted`;
    
    // The binary is in the bin/ directory
    const binaryPath = path.join(__dirname, 'bin', 'prometheus_decrypt');
    
    // Ensure binary is executable
    if (fs.existsSync(binaryPath)) {
      fs.chmodSync(binaryPath, '755');
    }

    // Command to decrypt
    // We will just try to guess the password or use a specific format if possible.
    // The tool supports guessing. Let's run it with default guessing.
    const cmd = `"${binaryPath}" -i "${inputPath}" -o "${outputPath}"`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("Decryption error:", error);
        console.error("stderr:", stderr);
        // Clean up
        fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        return res.status(500).json({ error: "Failed to decrypt", details: stderr || stdout });
      }

      console.log("Decryption stdout:", stdout);

      if (fs.existsSync(outputPath)) {
        const decryptedContent = fs.readFileSync(outputPath, 'utf-8');
        // Clean up
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
        res.json({ success: true, content: decryptedContent, logs: stdout });
      } else {
        // Clean up
        fs.unlinkSync(inputPath);
        res.status(500).json({ error: "Decrypted file not found", details: stdout });
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
