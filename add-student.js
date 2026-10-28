const db = require("./database");
const crypto = require("crypto");

const examNumber = "230010544";
const fullName = "EMMANUEL BOLUWATIFE MOORE";
const pin = "MOORE";

const pinHash = crypto
  .createHash("sha256")
  .update(pin)
  .digest("hex");

const results = {
    institution: "UNIVERSITY OF LAGOS",
    subjects: [
    {
      name: "LITERATURE",
      code: "LIT",
      grade: "B",
      score: "B"
    },
    {
      name: "GOVERNMENT",
      code: "GOV",
      grade: "C",
      score: "C"
    },
    {
      name: "CHRISTIAN STUDIES",
      code: "CRS",
      grade: "B",
      score: "B"
    }
  ]
};

const existing = db
  .prepare("SELECT exam_number FROM students WHERE exam_number = ?")
  .get(examNumber);

if (existing) {
  db.prepare(`
    UPDATE students
    SET full_name = ?, pin_hash = ?, results_json = ?
    WHERE exam_number = ?
  `).run(
    fullName,
    pinHash,
    JSON.stringify(results),
    examNumber
  );

  console.log("Student result updated successfully!");
} else {
  db.prepare(`
    INSERT INTO students (exam_number, full_name, pin_hash, results_json)
    VALUES (?, ?, ?, ?)
  `).run(
    examNumber,
    fullName,
    pinHash,
    JSON.stringify(results)
  );

  console.log("Test student added successfully!");
  console.log("Examination number:", examNumber);
  console.log("PIN:", pin);
}

console.log(
  "Total students:",
  db.prepare("SELECT COUNT(*) AS total FROM students").get().total
);