# How to Run This Project

Follow these steps to set up and run the NestJS + PostgreSQL project:

## 1. Environment Setup
- Copy the provided `.env` file or create your own in the project root:
  ```env
  DATABASE_HOST=localhost
  DATABASE_PORT=5432
  DATABASE_USER=your_postgres_username
  DATABASE_PASSWORD=your_postgres_password
  DATABASE_NAME=nest_auth
  JWT_SECRET=your_jwt_secret
  JWT_EXPIRES_IN=3600s
  ```
- Update the values to match your local PostgreSQL credentials.

## 2. Database Setup
- Create a new PostgreSQL database named `nest_auth` (or the name you set in `.env`).
- Example using psql:
  ```sh
  createdb nest_auth
  ```

## 3. Install Dependencies
- In the project root, run:
  ```sh
  npm install
  ```

## 4. Run the Application
- For local development:
  ```sh
  npm run start:dev
  ```

## 5. API Documentation
- See `API_DOC.md` in the project root for available endpoints, request bodies, and usage details.
