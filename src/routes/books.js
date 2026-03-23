import { Router } from 'express';
import { getBooks, getBookById, createBook, updateBook, deleteBook, getStats } from '../database.js';
import { createBookValidation, updateBookValidation, validate } from '../middleware/validate.js';

const router = Router();

router.get('/books', (req, res) => {
  const { category, search, page = 1, limit = 10 } = req.query;
  const result = getBooks({ category, search, page: Number(page), limit: Number(limit) });
  res.json(result);
});

router.get('/stats', (req, res) => {
  res.json(getStats());
});

router.get('/books/:id', (req, res) => {
  const book = getBookById(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

router.post('/books', createBookValidation, validate, (req, res) => {
  try {
    const book = createBook(req.body);
    res.status(201).json(book);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'A book with that ISBN already exists' });
    }
    throw err;
  }
});

router.put('/books/:id', updateBookValidation, validate, (req, res) => {
  try {
    const book = updateBook(req.params.id, req.body);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'A book with that ISBN already exists' });
    }
    throw err;
  }
});

router.delete('/books/:id', (req, res) => {
  const result = deleteBook(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Book not found' });
  res.json({ message: 'Book deleted successfully' });
});

export default router;
