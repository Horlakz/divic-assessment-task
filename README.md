# NestJS et GraphQL Auth Boilerplate

## Prerequisites

Before setting up the project, ensure you have the following installed:

- Node.js (>= 20.0.0)
- pnpm (>= 8.0.0)
- PostgreSQL (for the database)

## Environment Setup

1. **Clone the Repository**

   ```sh
   git clone git@github.com:horlakz/divic-assessment-task.git
   cd divic-assessment-task
   ```

2. **Install Dependencies**

   ```sh
   pnpm install
   ```

3. **Configure Environment Variables**

   - Copy the sample environment file and update it with your configuration.
     ```sh
     cp .env.sample .env
     ```
   - Update the `.env` file with your database connection string and other necessary environment variables.

4. **Set Up the Database**
   - Ensure PostgreSQL is running.
   - Create a new database for the application.
   - Run the Prisma migrations to set up the database schema.
     ```sh
     pnpm run db:migrate
     ```

## Running the Application

1. **Start the Application**

   ```sh
   pnpm start
   ```

2. **Access the Application**
   - The application should now be running on `http://localhost:8000`.

## Testing the Endpoints

### Using GraphQL Playground

- locate the GraphQL schema file in the src folder
- Open the GraphQL Playground in your browser by visiting `http://localhost:8000/graphql`.
- You can now test the available queries and mutations.

### Using PostMan

- Create a collection and leverage on the postman auto schema introspection feature to generate the schema for the API.
