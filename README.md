# ⚙️ CivicSocialPlus — Backend API

### Powering Community Connections Through Secure APIs.

CivicSocialPlus Server is the backend application of CivicSocialPlus, a social development events platform where people can create community initiatives, discover upcoming events, and participate in activities that contribute to positive social change.

Built with **Node.js, Express.js, and MongoDB**, this backend provides RESTful APIs for event management, user participation, database operations, and secure authentication.

It also integrates **JWT verification using JOSE and Better Auth JWKS** to protect private API operations and ensure that authenticated users can perform authorized actions.

---

## 🌐 Project Links

| Resource | Link |
|---|---|
| 🌍 Live Frontend | [CivicSocialPlus](https://civicsocialpluse.vercel.app/) |
| ⚙️ Live Backend | [Backend API](https://civicsocialpluseserver.vercel.app/) |
| 💻 Server Repository | [GitHub Repository](https://github.com/Rumi-Parvez/civicsocialpluse-server) |
| 🎨 Client Repository | [Frontend Repository](https://github.com/Rumi-Parvez/CivicSocialPluse) |

---

## ✨ Key Features

- **RESTful API:** Provides structured API endpoints for frontend communication.
- **Event Management:** Create, retrieve, update, and delete community events.
- **Upcoming Events:** Retrieve upcoming events dynamically from MongoDB.
- **Event Details:** Fetch individual event information using its ID.
- **User Event Management:** Retrieve events created by authenticated users.
- **Event Participation:** Allow users to join community events.
- **Joined Events:** Retrieve participation information for users and events.
- **Leave Events:** Remove a user's participation from an event.
- **JWT Authentication:** Verify access tokens using JOSE.
- **JWKS Integration:** Retrieve public signing keys from Better Auth.
- **Authorization:** Protect sensitive operations and validate event ownership.
- **MongoDB Integration:** Store and manage application data.
- **CORS Configuration:** Allow communication between frontend and backend.
- **Environment Configuration:** Keep database credentials and authentication settings outside the source code.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js 5 | Backend framework |
| MongoDB | NoSQL database |
| MongoDB Native Driver | Database connection and queries |
| JOSE | JWT verification |
| Better Auth | Authentication provider |
| JWKS | Public key retrieval |
| CORS | Cross-origin request handling |
| dotenv | Environment variable management |

---

## 🏗️ Backend Architecture

The backend follows a REST API architecture and communicates with the Next.js frontend.

```text
             CivicSocialPlus Frontend
                    Next.js
                       |
                       |
                  HTTP Requests
                       |
                       v
             Express.js Backend
                       |
          +------------+------------+
          |                         |
          v                         v
      API Routes               JWT Middleware
          |                         |
          |                    JOSE Verification
          |                         |
          |                    Better Auth JWKS
          |                         |
          +------------+------------+
                       |
                       v
                    MongoDB
                       |
          +------------+------------+
          |                         |
          v                         v
      Event Data              Join Data
```

### Request Flow

1. The frontend sends an HTTP request to the backend.
2. Express.js receives and processes the request.
3. Protected routes check the authentication token.
4. JOSE verifies the JWT using the Better Auth JWKS endpoint.
5. Authorized requests continue to the relevant API operation.
6. MongoDB performs the required database operation.
7. The backend returns a JSON response to the frontend.

---

## 🔐 Authentication & Authorization

CivicSocialPlus uses Better Auth for authentication and JWT for backend API verification.

The backend uses the `jose` package to verify JWTs and retrieve public keys from the Better Auth JWKS endpoint.

### Authentication Flow

- Users authenticate through the frontend.
- Better Auth generates an authentication token.
- The frontend sends the token in the Authorization header.
- The Express backend extracts the bearer token.
- JOSE verifies the token using the JWKS public key.
- Verified user information becomes available to protected routes.

### Authorization Header

Protected requests should include:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Security Implementations

- JWT signature verification.
- Token issuer and audience validation.
- Protected API endpoints.
- Authenticated user identification.
- Event ownership validation.
- Backend-side authorization checks.
- Environment-based authentication configuration.

---

## 🗄️ Database

CivicSocialPlus uses MongoDB to store application data.

The backend connects to the MongoDB database using the official MongoDB Node.js driver.

### Main Collections

| Collection | Purpose |
|---|---|
| `events` | Stores community event information |
| `join` | Stores event participation information |

The database name used by the project is:

```text
CivicSocialPluse-DB
```

### Event Data

Event documents contain information such as:

- Event title
- Event description
- Event category
- Event image
- Event location
- Event date
- Creator information

### Participation Data

Participation documents connect users with the events they join.

They contain the relevant event and user information needed to manage participation.

---

# 🔗 API Documentation

**Production Base URL**

```text
https://civicsocialpluseserver.vercel.app
```

**Local Base URL**

```text
http://localhost:5000
```

### Event Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/events` | Retrieve events |
| GET | `/events/recent-upcoming` | Retrieve recent upcoming events |
| GET | `/events/completed` | Retrieve completed events |
| GET | `/events/:id` | Retrieve a specific event |
| POST | `/events` | Create a new event |
| GET | `/events/my-events` | Retrieve authenticated user's events |
| PATCH | `/events/:id` | Update an event |
| DELETE | `/events/:id` | Delete an event |

### Event Participation Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/join` | Join an event |
| GET | `/join/event/:eventId` | Retrieve participation records for an event |
| GET | `/join/:identifier` | Retrieve join information |
| DELETE | `/join/:eventId` | Leave an event |

### Health Check

```http
GET /
```

Use this endpoint to check whether the backend server is responding.

**Note:** Protected endpoints require a valid JWT. The exact request body and response structure depend on the implementation of each route.

---

# ⚙️ Installation & Setup

Follow these steps to run the CivicSocialPlus backend locally.

## 📋 Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm
- [Git](https://git-scm.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account or a local MongoDB instance

You should also have the CivicSocialPlus frontend running if you want to test authentication and frontend-to-backend communication.

## 1. Clone the Repository

```bash
git clone https://github.com/Rumi-Parvez/civicsocialpluse-server.git
```

Navigate into the project:

```bash
cd civicsocialpluse-server
```

## 2. Install Dependencies

Run:

```bash
npm install
```

This installs the packages defined in `package.json`.

### Installed Dependencies

| Package | Purpose |
|---|---|
| `express` | Creates the backend server and API routes |
| `mongodb` | Connects to MongoDB |
| `jose` | Verifies JWTs |
| `cors` | Configures cross-origin requests |
| `dotenv` | Loads environment variables |

You do not need to install these packages individually.

## 3. Configure Environment Variables

Create a `.env` file in the root directory of the backend project.

```env
PORT=5000

MONGODB_URL=your_mongodb_connection_string

BETTER_AUTH_URL=http://localhost:3000

```

### Environment Variable Explanation

| Variable | Description |
|---|---|
| `PORT` | Port on which the backend runs |
| `MONGODB_URL` | MongoDB connection string |
| `BETTER_AUTH_URL` | Frontend Better Auth server URL used for JWT verification |
| `CLIENT_URL` | Frontend origin allowed to access the backend |

Replace the placeholder values with your own configuration.

## 4. Start the Backend

The current `package.json` does not define a development or start script.

You can start the application using:

```bash
node index.js
```

For automatic restarting during development, install nodemon:

```bash
npm install -D nodemon
```

Then add the following scripts to your `package.json`:

```json
"scripts": {
  "dev": "nodemon index.js",
  "start": "node index.js"
}
```

Now you can start the development server with:

```bash
npm run dev
```

Or start the production server with:

```bash
npm start
```

## 5. Test the Backend

Once the server is running, visit:

```text
http://localhost:5000/
```

If your health-check route is configured, it should return a response confirming that the backend is running.

---

## 🌍 Local & Production Configuration

The backend supports different environment configurations for local development and production deployment.

### Local Development

```env
PORT=5000
MONGODB_URL=your_local_or_atlas_mongodb_connection
BETTER_AUTH_URL=http://localhost:3000
```

### Production Deployment

Configure these variables in the backend hosting provider:

```env
PORT=5000
MONGODB_URL=your_production_mongodb_connection
BETTER_AUTH_URL=https://civicsocialpluse.vercel.app
CLIENT_URL=https://civicsocialpluse.vercel.app
```

The hosting provider may assign the server port automatically. If so, the application should use the provided `PORT` environment variable.

**Important:** `BETTER_AUTH_URL` must match the frontend Better Auth server origin that issued the JWT. Otherwise, JWKS retrieval or token verification may fail.

---

## 🔑 JWT & JWKS Configuration

The backend retrieves public keys from the Better Auth JWKS endpoint.

### Local JWKS URL

```text
http://localhost:3000/api/auth/jwks
```

### Production JWKS URL

```text
https://civicsocialpluse.vercel.app/api/auth/jwks
```

The backend uses this endpoint to retrieve the public signing key required for JWT verification.

Keep the Better Auth configuration consistent between frontend and backend.

Never share access tokens, database credentials, or authentication secrets publicly.

---

## 📁 Project Structure

```text
civicsocialpluse-server/
│
├── index.js
├── package.json
├── package-lock.json
├── .env
├── .gitignore
└── README.md
```

Additional files or folders may be present depending on the backend implementation.

---

## 🚀 Deployment

The CivicSocialPlus backend is deployed on Vercel.

**Live Backend:**

https://civicsocialpluseserver.vercel.app/

### Production Deployment Checklist

Before deploying:

- Configure the production MongoDB connection string.
- Set the production `BETTER_AUTH_URL`.
- Set the frontend `CLIENT_URL`.
- Configure CORS for the production frontend origin.
- Ensure JWT verification points to the production JWKS endpoint.
- Keep secrets in the hosting provider's environment settings.
- Test public and protected API endpoints after deployment.

For production, make sure the Express application is exported in the format expected by the hosting provider. A conventional long-running Node.js server and a serverless Vercel deployment may require different startup/export configurations.

---

## 🧠 Learning Outcomes

Building the CivicSocialPlus backend helped me strengthen my practical understanding of backend development.

Some important concepts I practiced:

- Creating RESTful APIs using Express.js.
- Connecting Node.js applications with MongoDB.
- Performing CRUD operations.
- Managing event and participation data.
- Implementing JWT authentication.
- Understanding JWT verification using JOSE.
- Working with JWKS public keys.
- Protecting private API routes.
- Implementing user authorization and ownership checks.
- Configuring CORS.
- Managing environment variables.
- Connecting a Next.js frontend with an Express backend.
- Deploying backend applications to Vercel.

This project helped me understand how authentication, authorization, APIs, and database operations work together in a full-stack application.

---

## 🔮 Future Improvements

Possible future improvements include:

- Better API documentation with Swagger/OpenAPI.
- Centralized error-handling middleware.
- Request validation middleware.
- API rate limiting.
- Pagination and advanced filtering.
- More comprehensive automated testing.
- Structured logging and monitoring.

---

## 👨‍💻 Developer

**Rumi Parvez**

Full-Stack Web Developer

I enjoy learning modern web technologies and building practical applications that solve real-world problems.

- **GitHub:** [Rumi-Parvez](https://github.com/Rumi-Parvez)
- **Frontend Repository:** [CivicSocialPlus](https://github.com/Rumi-Parvez/CivicSocialPluse)
- **Backend Repository:** [CivicSocialPlus Server](https://github.com/Rumi-Parvez/civicsocialpluse-server)
- **Live Application:** [CivicSocialPlus](https://civicsocialpluse.vercel.app/)

---

<div align="center">

### CivicSocialPlus Backend

**Building the technology behind stronger communities.**

Developed with ❤️ by Rumi Parvez

</div>