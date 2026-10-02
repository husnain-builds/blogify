# Blogify

Blogify is a server-rendered blogging application built with Node.js, Express, MongoDB, and EJS. Users can create an account, sign in, publish posts with cover images, read posts, leave comments, and view profile details.

This repository is also a learning project: it brings together common full-stack web concepts such as routing, database models, server-rendered templates, file uploads, password hashing, and cookie-based authentication.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment configuration](#environment-configuration)
- [Run the application](#run-the-application)
- [Routes](#routes)
- [Data models](#data-models)
- [How image uploads work](#how-image-uploads-work)
- [Authentication overview](#authentication-overview)
- [Current limitations and security notes](#current-limitations-and-security-notes)
- [Troubleshooting](#troubleshooting)

## Features

- Sign-up and sign-in pages
- Home page with a responsive list of blog posts and an empty state
- Blog detail pages with author information and comments
- Blog cover image uploads stored on the server
- User profile pages
- EJS templates with shared navigation, page head, and script partials
- MongoDB persistence through Mongoose
- Password hashing with Node's `crypto` module
- JWT-based authentication stored in a cookie

## Technology

- **Runtime:** Node.js (use Node.js 20 or later for the current Mongoose 9 dependency)
- **Server:** Express 5
- **Database:** MongoDB with Mongoose 9
- **Templates:** EJS
- **Authentication:** `jsonwebtoken`, `cookie-parser`, and Node.js `crypto`
- **Uploads:** Multer
- **UI components:** Bootstrap 5.3

## Project structure

```text
blog-project/
├── app.js                    # Express app setup, middleware, database connection, home route
├── controllers/              # Reserved for controller modules
├── middlewares/
│   └── authentication.js     # Reads and validates the authentication cookie
├── models/
│   ├── blog.js               # Blog post schema
│   ├── comment.js            # Comment schema
│   └── user.js               # User schema and password verification
├── public/
│   ├── images/               # Static images, including the default avatar
│   └── uploads/              # Uploaded blog cover images
├── routes/
│   ├── blog.js               # Blog, detail, upload, and comment routes
│   └── user.js               # Sign-up, sign-in, profile, and logout routes
├── services/
│   └── authentication.js     # JWT creation and validation
├── views/
│   ├── partials/             # Shared EJS partials
│   ├── addBlog.ejs           # New blog form
│   ├── blogDetail.ejs        # Blog article and comment thread
│   ├── home.ejs              # Blog listing
│   ├── profile.ejs           # User profile
│   ├── signin.ejs            # Sign-in form
│   └── signup.ejs            # Sign-up form
├── .env                      # Local environment variables (not committed)
└── package.json              # Dependencies and npm scripts
```

## Getting started

### Prerequisites

- Node.js 20 or later and npm
- A MongoDB database, either a local MongoDB server or a MongoDB Atlas cluster

### Install dependencies

From the project directory:

```bash
npm install
```

### Configure environment variables

Create a `.env` file in the `blog-project` directory. Do not put real database credentials in source files or commit them to Git.

For a local MongoDB instance:

```dotenv
MONGO_URL=mongodb://127.0.0.1:27017/blogify
PORT=8001
JWT_SECRET=replace-with-a-generated-random-secret
```

Generate a strong JWT secret locally with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

Use the generated value for `JWT_SECRET` in `.env`. Keep it private and do not commit it.

For MongoDB Atlas, set `MONGO_URL` to your Atlas connection string. Ensure the database user, network access rules, and cluster are configured in Atlas. Do not paste credentials into a public issue or commit them to the repository.

`PORT` is optional; the application defaults to port `8001`.

## Run the application

Start the development server with automatic restarts:

```bash
npm run dev
```

Start the application without the development watcher:

```bash
npm start
```

Open [http://localhost:8001](http://localhost:8001), or use the port configured in `PORT`.

The root route currently redirects visitors without a valid authentication cookie to the sign-in page. Create an account, then sign in to browse the application. After registration, the app redirects to `/user/signin`.

## Routes

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/` | Show the blog home page to an authenticated visitor; otherwise redirect to sign-in |
| `GET` | `/user/signup` | Show the account creation form |
| `POST` | `/user/signup` | Create a user account |
| `GET` | `/user/signin` | Show the sign-in form |
| `POST` | `/user/signin` | Verify credentials and set the authentication cookie |
| `GET` | `/user/profile/:id` | Show a user's profile |
| `GET` | `/user/logout` | Clear the authentication cookie |
| `GET` | `/blog/add-new` | Show the new blog form |
| `POST` | `/blog` | Save a blog post and its uploaded cover image |
| `GET` | `/blog/:id` | Show a blog post and its comments |
| `POST` | `/blog/comment/:blogId` | Add a comment to a blog post |

## Data models

### User

A user record contains a full name, email, password hash, password salt, profile image URL, role, and Mongoose timestamps. The password itself is hashed before storage.

### Blog

A blog record contains a title, body, cover image URL, a reference to its author, and Mongoose timestamps.

### Comment

A comment record contains comment text, a reference to the associated blog, a reference to its author, and Mongoose timestamps.

## How image uploads work

Blog cover images are accepted from the `coverImage` field in the new blog form. Multer stores the uploaded file under `public/uploads/` and the blog stores a URL such as `/uploads/<filename>`. Express serves the `public/` directory as static files, so that URL can be used by the browser.

The upload directory is created automatically when an upload is handled. Uploaded files are stored on the local filesystem; they are not stored in MongoDB or an external object store.

## Authentication overview

The sign-in route verifies the submitted password against the stored hash and creates a JWT. The token is placed in a cookie named `token`. Authentication middleware checks that cookie on incoming requests and attaches the decoded user payload to `req.user` when it is valid.

## Current limitations and security notes

This project is a learning application and should not be deployed publicly without additional security work.

- JWT signing uses the `JWT_SECRET` environment variable. Configure it with a cryptographically random value of at least 32 bytes before deployment. Rotate any key that may have been exposed; changing the key invalidates tokens signed with the previous value, so users will need to sign in again.
- Configure secure cookie options (including `httpOnly`, `sameSite`, and `secure` in production), add request protection such as CSRF defenses where appropriate, and use HTTPS in production.
- Add upload validation for allowed file types and sizes. Consider a managed object store for production deployments.
- Use a dedicated error handler and validate user-supplied ObjectIds and form values before database operations.
- Never commit `.env` or `creds.txt`; both are ignored by the repository's `.gitignore`. If a credential has been committed or shared, rotate it.

## Troubleshooting

### MongoDB connection fails

- Confirm `MONGO_URL` is present in `.env` and correctly formatted.
- For local MongoDB, verify the database server is running.
- For Atlas, verify the network access list and database user permissions.
- Restart the app after changing `.env`.

### Uploaded image does not appear

Confirm the file exists under `public/uploads/` and the stored blog URL begins with `/uploads/`. The browser URL is served from the `public` directory; do not use a filesystem path such as `public/uploads/...` in the image URL.

### Port is already in use

Set a different port in `.env`, for example `PORT=8002`, and open the matching local URL.