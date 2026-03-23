import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, '..', 'bookstore.db'));

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    author      TEXT NOT NULL,
    isbn        TEXT UNIQUE,
    price       REAL,
    category    TEXT,
    stock       INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now'))
  )
`);

const count = db.prepare('SELECT COUNT(*) as count FROM books').get();
if (count.count === 0) {
  const insert = db.prepare(`
    INSERT INTO books (title, author, isbn, price, category, stock)
    VALUES (@title, @author, @isbn, @price, @category, @stock)
  `);
  const seed = db.transaction(() => {
    insert.run({ title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', price: 12.99, category: 'Fiction', stock: 25 });
    insert.run({ title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '9780553380163', price: 15.99, category: 'Science', stock: 18 });
    insert.run({ title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316097', price: 17.99, category: 'History', stock: 30 });
    insert.run({ title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '9780374533557', price: 16.99, category: 'Psychology', stock: 12 });
    insert.run({ title: 'The Pragmatic Programmer', author: 'David Thomas', isbn: '9780135957059', price: 49.99, category: 'Technology', stock: 8 });
  });
  seed();
}

export function getBooks({ category, search, page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }
  if (search) {
    conditions.push('(title LIKE ? OR author LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const total = db.prepare(`SELECT COUNT(*) as count FROM books ${where}`).get(...params).count;
  const books = db.prepare(`SELECT * FROM books ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);

  return { books, total, page: Number(page), limit: Number(limit) };
}

export function getBookById(id) {
  return db.prepare('SELECT * FROM books WHERE id = ?').get(id);
}

export function createBook(data) {
  const { title, author, isbn = null, price = null, category = null, stock = 0 } = data;
  const result = db.prepare(`
    INSERT INTO books (title, author, isbn, price, category, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(title, author, isbn, price, category, stock);
  return getBookById(result.lastInsertRowid);
}

export function updateBook(id, data) {
  const book = getBookById(id);
  if (!book) return null;

  const updated = { ...book, ...data };
  db.prepare(`
    UPDATE books SET title = ?, author = ?, isbn = ?, price = ?, category = ?, stock = ?
    WHERE id = ?
  `).run(updated.title, updated.author, updated.isbn, updated.price, updated.category, updated.stock, id);

  return getBookById(id);
}

export function deleteBook(id) {
  return db.prepare('DELETE FROM books WHERE id = ?').run(id);
}

export function getStats() {
  return db.prepare(`
    SELECT
      COUNT(*)                   AS totalBooks,
      COUNT(DISTINCT category)   AS totalCategories,
      ROUND(AVG(price), 2)       AS avgPrice,
      SUM(stock)                 AS totalStock
    FROM books
  `).get();
}
