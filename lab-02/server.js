const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
const port = process.env.PORT || 3000;
const databasePath = process.env.DATABASE_PATH || path.join(__dirname, "books.db");
let server;

// The server opens SQLite before registering the API routes.
app.use(express.json());

function isValidBook(book) {
  const { title, author, price, pages } = book;
  return (
    typeof title === "string" && title.trim() !== "" &&
    typeof author === "string" && author.trim() !== "" &&
    Number.isInteger(price) && price >= 0 &&
    Number.isInteger(pages) && pages > 0
  );
}

function bookValues(book) {
  return [book.title.trim(), book.author.trim(), book.price, book.pages];
}

async function initializeDBAndServer() {
  const db = await open({
    filename: databasePath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS book (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price INTEGER NOT NULL CHECK (price >= 0),
      pages INTEGER NOT NULL CHECK (pages > 0)
    )
  `);

  app.get("/", (_request, response) => {
    response.redirect("/books/");
  });

  app.get("/books/", async (_request, response) => {
    try {
      const books = await db.all("SELECT * FROM book ORDER BY id;");
      response.json(books);
    } catch (error) {
      response.status(500).json({ error: "Unable to fetch books." });
    }
  });

  app.get("/books/:bookId/", async (request, response) => {
    try {
      const book = await db.get("SELECT * FROM book WHERE id = ?;", [request.params.bookId]);
      if (!book) {
        return response.status(404).json({ error: "Book not found." });
      }
      return response.json(book);
    } catch (error) {
      return response.status(500).json({ error: "Unable to fetch the book." });
    }
  });

  app.post("/books/", async (request, response) => {
    if (!isValidBook(request.body)) {
      return response.status(400).json({ error: "title, author, price (>= 0), and pages (> 0) are required." });
    }
    try {
      const result = await db.run(
        "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);",
        bookValues(request.body)
      );
      const createdBook = await db.get("SELECT * FROM book WHERE id = ?;", [result.lastID]);
      return response.status(201).json(createdBook);
    } catch (error) {
      return response.status(500).json({ error: "Unable to create the book." });
    }
  });

  app.put("/books/:bookId/", async (request, response) => {
    if (!isValidBook(request.body)) {
      return response.status(400).json({ error: "title, author, price (>= 0), and pages (> 0) are required." });
    }
    try {
      const result = await db.run(
        "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;",
        [...bookValues(request.body), request.params.bookId]
      );
      if (result.changes === 0) {
        return response.status(404).json({ error: "Book not found." });
      }
      const updatedBook = await db.get("SELECT * FROM book WHERE id = ?;", [request.params.bookId]);
      return response.json(updatedBook);
    } catch (error) {
      return response.status(500).json({ error: "Unable to update the book." });
    }
  });

  app.delete("/books/:bookId/", async (request, response) => {
    try {
      const result = await db.run("DELETE FROM book WHERE id = ?;", [request.params.bookId]);
      if (result.changes === 0) {
        return response.status(404).json({ error: "Book not found." });
      }
      return response.status(204).send();
    } catch (error) {
      return response.status(500).json({ error: "Unable to delete the book." });
    }
  });

  server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
  server.ref();

  return server;
}

if (require.main === module) {
  // Keeps this development server active when launched through the local nodemon host.
  setInterval(() => {}, 60_000);
  initializeDBAndServer().catch((error) => {
    console.error("Failed to connect to the database:", error.message);
    process.exit(1);
  });
}

module.exports = { app, initializeDBAndServer };
