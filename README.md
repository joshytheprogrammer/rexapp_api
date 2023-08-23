# RexApp API

RexApp API is the backend server component of the RexApp project, providing essential functionality for user authentication, browsing automobile spare parts catalog, handling transactions, and more.

## Features

- User registration and login with JWT-based authentication.
- APIs for browsing and searching the automobile spare parts catalog.
- Secure payment gateway integration for smooth transactions.
- RESTful endpoints for user management and data retrieval.

## Technologies Used

- Node.js: A fast and efficient server-side platform.
- Express.js: A flexible and minimalist web application framework for Node.js.
- MongoDB: A NoSQL database for storing and managing application data.
- Axios: A promise-based HTTP client for making API requests.
- Bcrypt: A library for password hashing and encryption.
- JSON Web Token (JWT): A token-based authentication mechanism.
- Cors: A middleware for enabling Cross-Origin Resource Sharing.
- Dotenv: A module for managing environment variables.
- Jest: A testing framework for unit testing.
- Nodemon: A utility for automatically restarting the server during development.
- Supertest: A library for testing HTTP requests and responses.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/joshytheprogrammer/rexapp_api.git
   ```

2. Install dependencies:

   ```bash
   cd rexapp
   npm install
   ```

3. Set up environment variables:

   Create a `.env` file in the root of the project and add the following:

   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/rexapp
   ACCESS_TOKEN_SECRET=mysecrettoken
   ```

## Getting Started

1. Run the server:

   ```bash
   npm start
   ```

2. The API will be available at: `http://localhost:3000`

3. Explore the API endpoints using tools like Postman or a web browser.

## Testing

Run tests using the following command:

```bash
npm test
```

## License

This project is licensed under the [MIT License](LICENSE).
