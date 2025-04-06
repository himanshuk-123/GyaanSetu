# Notes App Backend

This is the backend API for the Notes App, which provides features for user authentication, note management, and file uploads.

## Features

- User authentication with JWT
- CRUD operations for notes
- File uploads for note attachments
- Like and bookmark functionality for notes
- User profile management
- Search and filter notes

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- bcryptjs for password hashing

## Prerequisites

- Node.js (v14+ recommended)
- MongoDB (local or MongoDB Atlas)

## Setup

1. Clone the repository
2. Install dependencies

```
npm install
```

3. Create a `.env` file in the root directory and add the following environment variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/notes_app
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

4. Run the server in development mode

```
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user info (requires authentication)

### Notes

- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create a new note (requires authentication)
- `GET /api/notes/:id` - Get a specific note
- `PUT /api/notes/:id` - Update a note (requires authentication & ownership)
- `DELETE /api/notes/:id` - Delete a note (requires authentication & ownership)
- `PUT /api/notes/:id/like` - Like/unlike a note (requires authentication)
- `PUT /api/notes/:id/bookmark` - Bookmark/unbookmark a note (requires authentication)
- `GET /api/notes/:id/download` - Download a note file

### Users

- `PUT /api/users/profile` - Update user profile (requires authentication)
- `PUT /api/users/password` - Change user password (requires authentication)
- `GET /api/users/notes` - Get user's notes (requires authentication)
- `GET /api/users/bookmarks` - Get user's bookmarked notes (requires authentication)

## Folder Structure

```
src/
  ├── config/      # Configuration files
  ├── controllers/ # Route controllers
  ├── middleware/  # Custom middleware
  ├── models/      # Mongoose models
  ├── routes/      # API routes
  ├── utils/       # Utility functions
  └── server.js    # Entry point
``` 