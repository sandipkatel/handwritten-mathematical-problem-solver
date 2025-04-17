const express = require("express");
const multer = require("multer");
const { spawn } = require("child_process");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up file upload with multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Endpoint for image upload and OCR processing
app.post("/api/convert", upload.single("image"), (req, res) => {
  console.log("Received a request to /api/convert");
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  const imagePath = req.file.path;

  // Run Python script with the uploaded image
  const python = spawn("python", [
    "scripts/convert_img_to_latex.py",
    imagePath,
  ]);

  let latexOutput = "";
  let errorOutput = "";

  // Collect data from script
  python.stdout.on("data", (data) => {
    latexOutput += data.toString();
  });

  python.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  // Handle script completion
  python.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: "Failed to process image", details: errorOutput });
    }
  
    try {
      const parsed = JSON.parse(latexOutput); // Parse JSON
      res.json(parsed); // Returns: { latex: "..." }
    } catch (err) {
      res.status(500).json({ error: "Invalid JSON from Python", raw: latexOutput });
    }
  });
});

// Endpoint for solving math expressions
app.post("/api/solve", (req, res) => {
  console.log("Received a request to /api/solve");
  const { latex } = req.body;
  if (!latex) {
    return res.status(400).json({ error: "No LaTeX expression provided" });
  }

  // Run Python script to solve the expression
  const python = spawn("python", ["scripts/solver/main.py", latex]);
  let solutionOutput = "";
  let errorOutput = "";

  // Collect data from script
  python.stdout.on("data", (data) => {
    solutionOutput += data.toString();
  });

  python.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  // Handle script completion
  python.on("close", (code) => {
    if (code !== 0) {
      console.error(`Python script exited with code ${code}`);
      return res
        .status(500)
        .json({ error: "Failed to solve expression", details: errorOutput });
    }
    res.json({ solution: solutionOutput.trim() });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
