# Virtual Assistant

An AI-powered, full-stack virtual assistant that combines personalized assistant profiles, voice interaction, and conversational intelligence in a modern web application.

Users can create an account, select or upload an assistant avatar, give the assistant a custom name, and interact with it through typed or spoken commands. The backend builds a personalized prompt and uses the Google Gemini API to generate responses.

## Project highlights

- Personalized assistant name and avatar
- User registration, login, logout, and authenticated sessions
- Voice-enabled interaction using browser speech capabilities
- Gemini-powered conversational responses
- MongoDB persistence for user profiles and assistant configuration
- Cloudinary support for assistant image uploads
- Responsive React interface with a guided setup experience
- Express API with protected user routes

## Screenshots

### Account creation

![Virtual Assistant account creation screen](docs/images/account-creation.png)

### Assistant image selection

![Assistant image selection screen](docs/images/assistant-image-selection.png)

### Assistant name setup

![Assistant name setup screen](docs/images/assistant-name-setup.png)

### Configured assistant

![Configured virtual assistant screen](docs/images/configured-assistant.png)

## Application flow

![Virtual Assistant application flow](virtual-assistant-flowchart.svg)

The main flow is:

1. The user opens the React application.
2. The frontend checks whether an authenticated session exists.
3. A new user creates an account, while an existing user signs in.
4. The user selects an assistant image and enters a custom assistant name.
5. Assistant configuration is saved to the backend and MongoDB.
6. The user submits a typed or spoken command.
7. The frontend sends the command to the authenticated Express API.
8. The backend retrieves the user profile and creates a personalized Gemini prompt.
9. Google Gemini generates the response.
10. The response is returned to the frontend, displayed to the user, and read aloud when voice output is enabled.

## Architecture

```text
┌───────────────┐       HTTP/JSON        ┌──────────────────┐
│ React + Vite  │ ─────────────────────> │ Express API      │
│ Frontend      │ <───────────────────── │ Authentication   │
└───────┬───────┘                         └───────┬──────────┘
        │                                         │
        │ Browser Speech APIs                     │ Mongoose
        │                                         │
        ▼                                         ▼
  Voice input/output                         MongoDB
                                                  │
                    ┌─────────────────────────────┼─────────────────┐
                    │                             │                 │
                    ▼                             ▼                 ▼
              Google Gemini                  Cloudinary       JWT cookies
              AI responses                  Assistant images  Authenticated sessions
```

## Technology stack

### Frontend

- React 19
- Vite
- React Router
- Axios
- Tailwind CSS
- React Icons
- Web Speech API for voice input and output

### Backend

- Node.js
- Express 5
- MongoDB with Mongoose
- JSON Web Tokens
- bcryptjs password hashing
- Cloudinary image storage
- Multer file uploads
- Axios for external API communication

## Repository structure

```text
virtualAssistant/
├── backend/
│   ├── config/              # Database, Cloudinary, and token configuration
│   ├── controllers/         # Authentication and assistant business logic
│   ├── middlewares/         # Authentication and upload middleware
│   ├── models/              # Mongoose data models
│   ├── routes/              # Authentication and user API routes
│   ├── gemini.js            # Gemini response integration
│   └── index.js             # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Shared user and API state
│   │   ├── pages/           # Sign in, sign up, setup, and home screens
│   │   └── assets/          # Frontend assets
│   └── package.json
├── docs/
│   └── images/              # Project screenshots
├── virtual-assistant-flowchart.svg
└── README.md
```

## API overview

### Authentication routes

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Create a user account |
| `POST` | `/api/auth/signin` | Authenticate a user |
| `GET` | `/api/auth/logout` | End the authenticated session |

### User routes

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/user/current` | Return the current authenticated user |
| `POST` | `/api/user/update` | Save assistant name and image |
| `POST` | `/api/user/asktoassistant` | Send a command to the AI assistant |

### Health check

```text
GET /api/health
```

Returns the current API status and timestamp.

## Getting started

### Prerequisites

- Node.js 18 or later
- npm
- MongoDB database
- Google Gemini API access
- Cloudinary account for image uploads

### 1. Clone the repository

```bash
git clone https://github.com/Gyananjay600/virtualAssistant.git
cd virtualAssistant
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure backend environment variables

Create `backend/.env`:

```env
PORT=8000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_long_random_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

GEMINI_API_KEY=your_gemini_api_key
```

Never commit `.env` files or API keys to source control.

### 4. Install frontend dependencies

Open a second terminal:

```bash
cd frontend
npm install
```

### 5. Start the application

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

Open the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

The frontend expects the backend API at `http://localhost:8000`.

## Available scripts

### Frontend

```bash
npm run dev       # Start the Vite development server
npm run build     # Build the production bundle
npm run preview   # Preview the production build
npm run lint      # Run ESLint
```

### Backend

```bash
npm run dev       # Start the API with nodemon
```

## Security notes

- Store secrets in environment variables.
- Use a strong, unique `JWT_SECRET`.
- Do not expose Gemini, MongoDB, or Cloudinary credentials in frontend code.
- Configure production CORS origins explicitly instead of allowing arbitrary origins.
- Use HTTPS and secure cookie settings in production.
- Validate and restrict uploaded image types and sizes before production deployment.

## Future improvements

- Add persistent conversation history to the assistant interface.
- Add streaming Gemini responses for faster perceived performance.
- Introduce automated frontend and backend tests.
- Add rate limiting and request validation.
- Add a production deployment configuration.
- Support multiple assistant personas and configurable response styles.

## Contributing

1. Create a feature branch.
2. Make focused changes.
3. Run the relevant lint and build commands.
4. Open a pull request with a clear description of the change.

## License

This project currently does not declare a public open-source license. Contact the repository owner before redistributing or using it commercially.

## Project link

[View the Virtual Assistant project on GitHub](https://github.com/Gyananjay600/virtualAssistant/tree/main)
