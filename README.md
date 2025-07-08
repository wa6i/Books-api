## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd book-API
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## To run the project:

- `npm run dev` - Start the development server

## API Endpoints

### 1. Add Book

**POST** `/api/books`

Add a new book with ISBN and condition information.

**Request Body:**

```json
{
  "isbn": "9780141439518",
  "condition": "new"
}
```

**Response (200 - Complete):**

```json
{
  "isbn10": "0141439513",
  "isbn13": "9780141439518",
  "condition": "new",
  "price": 1250,
  "title": "Pride and Prejudice",
  "needsManualCompletion": false
}
```

**Response (202 - Partial):**

```json
{
  "isbn10": "0141439513",
  "isbn13": "9780141439518",
  "condition": "new",
  "needsManualCompletion": true
}
```

**Condition Options:**

- `new` - Full price (100%)
- `as_new` - 80% of full price
- `damaged` - 50% of full price

### 2. Get Pricing

**GET** `/api/pricing?isbn=<isbn>`

Get the base price for a book by ISBN.

**Response (200):**

```json
{
  "isbn": "9780141439518",
  "price": 1250
}
```

**Response (404):**

```json
{
  "error": "Price not found for this ISBN"
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Successful request with complete data
- `202` - Accepted but requires manual completion
- `400` - Bad request (missing parameters, invalid ISBN, invalid condition)
- `404` - Price not found for ISBN
- `500` - Internal server error

## Testing

Run the test suite:

```bash
npm test
```

## Project Structure

```
book-API/
├── src/
│   ├── app.ts              # Express app configuration
│   ├── server.ts           # Server entry point
│   ├── routes/
│   │   ├── books.ts        # Book management endpoints
│   │   └── pricing.ts      # Pricing endpoints
│   └── utils/
│       └── price.ts        # Pricing calculation logic
├── tests/
│   ├── books.test.ts       # Book endpoint tests
│   └── pricing.test.ts     # Pricing endpoint tests
├── package.json
├── tsconfig.json
└── jest.config.js
```

## External Dependencies

- **Open Library API**: Used to fetch book titles by ISBN
- **isbn-utils**: Library for ISBN validation and format conversion
