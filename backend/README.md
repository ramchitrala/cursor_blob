# RoomSpot Backend

Express.js API server for RoomSpot's student housing platform.

## 🚀 Features

- **RESTful API**: Clean REST endpoints
- **User Management**: Authentication and authorization
- **Email Services**: Waitlist and notification system
- **Rate Limiting**: API protection
- **Validation**: Request validation middleware
- **Database**: MongoDB with Mongoose

## 📁 Structure

```
backend/
├── src/
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   ├── config/            # Configuration files
│   └── server.js          # Main server file
├── package.json           # Dependencies
└── README.md              # This file
```

## 🛠️ Getting Started

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev

# Start production server
npm start
```

## 🔧 Environment Variables

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/roomspot
JWT_SECRET=your-secret-key
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## 📚 API Endpoints

### Waitlist
- `POST /api/waitlist` - Add user to waitlist
- `GET /api/waitlist/stats` - Get waitlist statistics

### Users
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile

### Jobs
- `GET /api/jobs` - Get job listings
- `POST /api/jobs/apply` - Submit job application
- `POST /api/jobs/notify` - Subscribe to job notifications

## 🚀 Deployment

Ready for deployment to Heroku, Railway, or any Node.js hosting platform. 