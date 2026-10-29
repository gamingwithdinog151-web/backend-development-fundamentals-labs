const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const books = [
  ["To Kill a Mockingbird", "Harper Lee", 450, 336],
  ["1984", "George Orwell", 399, 328],
  ["Pride and Prejudice", "Jane Austen", 350, 432],
  ["The Great Gatsby", "F. Scott Fitzgerald", 300, 180],
  ["The Hobbit", "J. R. R. Tolkien", 550, 310],
  ["The Alchemist", "Paulo Coelho", 280, 208],
  ["Sapiens", "Yuval Noah Harari", 650, 498],
  ["Atomic Habits", "James Clear", 499, 320],
  ["The Kite Runner", "Khaled Hosseini", 420, 371],
  ["A Brief History of Time", "Stephen Hawking", 390, 256],
];

async function seedDatabase() {
  const db = await open({
    filename: path.join(__dirname, "books.db"),
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS book (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price INTEGER NOT NULL CHECK (price >= 0),
      pages INTEGER NOT NULL CHECK (pages > 0)
    );
    DELETE FROM book;
    DELETE FROM sqlite_sequence WHERE name = 'book';
  `);

  for (const book of books) {
    await db.run(
      "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);",
      book
    );
  }
  await db.close();
  console.log("books.db created with 10 sample books.");
}

seedDatabase().catch((error) => {
  console.error("Failed to seed the database:", error.message);
  process.exit(1);
});
