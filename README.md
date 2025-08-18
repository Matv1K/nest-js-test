# How to Run This Project (Dockerized)

**Note: Docker and Docker Compose must be installed on your machine to run this project.**

Follow these steps to set up and run the NestJS + PostgreSQL project using Docker and Docker Compose.

## 1. Prepare Environment Variables

- Copy the provided `.env` file or create your own in the project root with the following content:
  ```env
  DATABASE_HOST=db
  DATABASE_PORT=5432
  DATABASE_USER=your_postgres_username
  DATABASE_PASSWORD=your_postgres_password
  DATABASE_NAME=nest_auth
  JWT_SECRET=your_jwt_secret
  JWT_EXPIRES_IN=3600s
  REDIS_HOST=redis
  REDIS_PORT=6379
  ```
- Update the values as needed.  
  **Note:** For Docker Compose, set `DATABASE_HOST=db` (the service name for PostgreSQL).

## 2. Build and Start the Application

- In the project root, run:
  ```sh
  npm run docker:start
  ```
- This command will:
  - Start a PostgreSQL database container (db)
  - Start a Redis container (redis)
  - Build and start the NestJS app container (nest-app)
- The NestJS app will be available at [http://localhost:3000](http://localhost:3000).

## 3. Stopping the Application

- To stop all containers, press `Ctrl+C` in the terminal where Docker Compose is running.
- To remove containers, networks, and volumes created by Docker Compose:
  ```sh
  docker-compose down -v
  ```

## 4. API Documentation

- See `API_DOC.md` in the project root for available endpoints, request bodies, and usage details.
