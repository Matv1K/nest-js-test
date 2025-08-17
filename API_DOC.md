# API Documentation

This document provides an overview of the available API endpoints, their methods, routes, and required/request body data for this NestJS project.

---

## Auth Endpoints

### Register
- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "email": "string (valid email)",
    "password": "string (min 6 chars)"
  }
  ```
- **Description:** Register a new user.

### Login
- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "string (valid email)",
    "password": "string"
  }
  ```
- **Description:** Log in and receive a JWT token.

---

## User Endpoints

### Get All Users
- **GET** `/users`
- **Description:** Retrieve a list of all users.

---

## Article Endpoints

> **Note:** Creating and updating articles require JWT authentication (send token in `Authorization: Bearer <token>` header).

### Create Article
- **POST** `/articles`
- **Body:**
  ```json
  {
    "title": "string",
    "description": "string",
    "publicationDate": "2003-07-22",
    "author": 1
  }
  ```
- **Description:** Create a new article. Requires authentication.

### Get All Articles
- **GET** `/articles`
- **Description:** Retrieve all articles. Supports query parameters for filtering (see implementation).

### Get Article by ID
- **GET** `/articles/:id`
- **Description:** Retrieve a single article by its ID.

### Update Article
- **PATCH** `/articles/:id`
- **Body:** (any subset of fields)
  ```json
  {
    "title": "string (optional)",
    "description": "string (optional)",
    "publicationDate": "YYYY-MM-DDTHH:MM:SS.sssZ (optional)"
  }
  ```
- **Description:** Update an article by ID. Requires authentication.

### Delete Article
- **DELETE** `/articles/:id`
- **Description:** Delete an article by ID.

---

## Notes
- All request and response bodies are in JSON format.
- For protected endpoints, include the JWT token in the `Authorization` header.
- Validation errors will return 400 responses with details.
