const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { rateLimit } = require("express-rate-limit");
const db = require("./database");
const app = express();
const PORT = process.env.PORT || 3000;
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Limit wrong PIN guesses
const checkResultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again after 15 minutes."
  }
});
// Serve the existing website
app.use(express.static(path.join(__dirname, "public")));
// Check whether the backend is working
app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        message: "JUPEB Result Checker backend is running."
    });
});

// Check a student's result
app.post("/api/check-result", checkResultLimiter, (req, res) => {
    const { examNumber, pin } = req.body;

    if (!examNumber || !pin) {
        return res.status(400).json({
            success: false,
            message: "Enter your examination number and PIN."
        });
    }

    const student = db.prepare(`
        SELECT exam_number, full_name, pin_hash, results_json
        FROM students
        WHERE exam_number = ?
    `).get(String(examNumber).trim());

    if (!student) {
              return res.status(401).json({
            success: false,
            message: "Invalid examination number or PIN."
        });
    }

    const submittedHash = crypto
        .createHash("sha256")
        .update(String(pin))
        .digest("hex");

    const storedHash = Buffer.from(student.pin_hash, "hex");
    const submittedBuffer = Buffer.from(submittedHash, "hex");

    if (
        storedHash.length !== submittedBuffer.length ||
        !crypto.timingSafeEqual(storedHash, submittedBuffer)
    ) {
        return res.status(401).json({
            success: false,
            message: "Invalid examination number or PIN."
        });
    }

    let results;

    try {
               results = JSON.parse(student.results_json);
    } catch {
        return res.status(500).json({
            success: false,
            message: "The stored result could not be read."
        });
    }

    res.json({
    success: true,
    student: {
        examNumber: student.exam_number,
        surname: student.full_name.trim().split(/\s+/).slice(-1)[0],
        otherNames: student.full_name.trim().split(/\s+/).slice(0, -1).join(" "),
                institution: results.institution || "",
        subjects: results.subjects || []
    }
});
});

// Start the backend
app.listen(PORT, () => {
    console.log(
        `JUPEB Result Checker running at http://localhost:${PORT}`
    );
});