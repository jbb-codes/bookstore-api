# bookstore-api

A REST API for managing a bookstore inventory, built with Node.js, Express, and SQLite.

## Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 5
- **Database:** SQLite via better-sqlite3
- **Validation:** express-validator

## Project Structure

```
bookstore-api/
├── src/
│   ├── index.js              # Server entry point
│   ├── database.js           # SQLite setup, seed data, query functions
│   ├── routes/
│   │   └── books.js          # Book and stats route handlers
│   └── middleware/
│       └── validate.js       # Request validation rules and middleware
├── bookstore.db              # SQLite database (auto-created on first run)
└── package.json
```

## Getting Started

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

Start with auto-reload (development):

```bash
npm run dev
```

The server starts on port 3000 by default. Set the `PORT` environment variable to use a different port.

The SQLite database is created automatically at `bookstore.db` on first run. If the books table is empty, 5 sample books are seeded across Fiction, Science, History, Psychology, and Technology categories.

## API Reference

### Health

```
GET /health
```

Returns server status, current timestamp, and process uptime.

---

### Books

#### List books

```
GET /api/books
```

Query parameters:

| Parameter  | Type    | Description                          |
|------------|---------|--------------------------------------|
| `category` | string  | Filter by category (exact match)     |
| `search`   | string  | Search by title or author            |
| `page`     | integer | Page number (default: 1)             |
| `limit`    | integer | Results per page (default: 10)       |

Response:

```json
{
  "books": [...],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

---

#### Get a book

```
GET /api/books/:id
```

Returns a single book by ID. Returns `404` if not found.

---

#### Create a book

```
POST /api/books
```

Request body:

| Field      | Type    | Required | Notes                        |
|------------|---------|----------|------------------------------|
| `title`    | string  | Yes      |                              |
| `author`   | string  | Yes      |                              |
| `isbn`     | string  | No       | Must be unique               |
| `price`    | number  | No       | Must be non-negative         |
| `category` | string  | No       |                              |
| `stock`    | integer | No       | Must be non-negative         |

Returns `201` with the created book, `409` if the ISBN already exists, or `422` with a validation errors array.

---

#### Update a book

```
PUT /api/books/:id
```

Partial update — only the fields provided are changed. Same field rules as POST, but all fields are optional. Returns `404` if not found, `409` if the ISBN conflicts.

---

#### Delete a book

```
DELETE /api/books/:id
```

Returns `{ "message": "Book deleted successfully" }`. Returns `404` if not found.

---

### Stats

```
GET /api/stats
```

Returns aggregate data across all books:

```json
{
  "totalBooks": 5,
  "totalCategories": 5,
  "avgPrice": 22.79,
  "totalStock": 93
}
```

## Error Responses

| Status | Meaning                                      |
|--------|----------------------------------------------|
| `404`  | Resource or route not found                  |
| `409`  | ISBN conflict on create or update            |
| `422`  | Validation failed — body includes `errors[]` |
| `500`  | Unexpected server error                      |

Validation error response shape:

```json
{
  "errors": [
    { "field": "title", "message": "title is required" }
  ]
}
```
