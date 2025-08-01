# RoomSpot Frontend

Modern, animated frontend for RoomSpot's student housing platform with careers page.

## 🚀 Features

- **60fps Animations**: Smooth gradient orbs and particle systems
- **Student Priority**: Special beta access for .edu email addresses
- **Careers Page**: Job application system with beautiful modals
- **Responsive Design**: Works on all device sizes
- **Modern UI**: Glassmorphism effects and micro-interactions

## 📁 Structure

```
frontend/
├── public/
│   ├── index.html          # Main waitlist page
│   └── careers.html        # Careers page
├── src/
│   ├── styles/
│   │   └── styles.css      # All CSS styles
│   ├── assets/
│   │   └── logo.png        # Logo and images
│   ├── components/         # Future React components
│   ├── pages/              # Future page components
│   ├── utils/              # Utility functions
│   ├── main.js             # Main page JavaScript
│   └── careers.js          # Careers page JavaScript
├── package.json            # Project configuration
├── vercel.json             # Deployment config
└── README.md               # This file
```

## 🛠️ Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Deploy
npm run deploy
```

## 🎯 Pages

### Waitlist Page (`/`)
- Email collection with .edu detection
- Interactive animations
- Modal selection flow

### Careers Page (`/careers.html`)
- Job listings
- Application forms
- Notification system

## 🚀 Deployment

Ready for deployment to Vercel, Netlify, or any static hosting platform. 