CREATE TABLE IF NOT EXISTS book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  pages INTEGER NOT NULL CHECK (pages > 0)
);

DELETE FROM book;
DELETE FROM sqlite_sequence WHERE name = 'book';

INSERT INTO book (title, author, price, pages) VALUES
  ('To Kill a Mockingbird', 'Harper Lee', 450, 336),
  ('1984', 'George Orwell', 399, 328),
  ('Pride and Prejudice', 'Jane Austen', 350, 432),
  ('The Great Gatsby', 'F. Scott Fitzgerald', 300, 180),
  ('The Hobbit', 'J. R. R. Tolkien', 550, 310),
  ('The Alchemist', 'Paulo Coelho', 280, 208),
  ('Sapiens', 'Yuval Noah Harari', 650, 498),
  ('Atomic Habits', 'James Clear', 499, 320),
  ('The Kite Runner', 'Khaled Hosseini', 420, 371),
  ('A Brief History of Time', 'Stephen Hawking', 390, 256);
