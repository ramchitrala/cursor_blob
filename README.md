# RoomSpot Waitlist

A modern, animated waitlist page for RoomSpot's student housing platform. Features a beautiful UI with 60fps animations and special handling for student (.edu) email addresses.

## 🚀 Features

- **60fps Animations**: Smooth gradient orbs that follow mouse movement
- **Student Priority**: Special beta access for .edu email addresses
- **Responsive Design**: Works on all device sizes
- **Modern UI**: Glassmorphism effects and micro-interactions
- **Performance Optimized**: Throttled animations and efficient particle system

## 📁 Project Structure

```
roomspot-waitlist/
├── index.html              # Main HTML file
├── styles.css              # All CSS styles
├── main.js                 # JavaScript functionality
├── package.json            # Project configuration
├── vercel.json            # Vercel deployment config
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 14+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd roomspot-waitlist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy
```

### Manual Deployment
Simply upload the files to any static hosting service:
- GitHub Pages
- AWS S3
- Firebase Hosting
- Any static file server

## 🎯 Key Features

### Email Detection
- Automatically detects .edu email addresses
- Shows different UI states for students vs general users
- Provides upgrade path for personal email users

### Animations
- Interactive gradient orbs following mouse movement (60fps)
- Floating particles system
- Confetti animations for success states
- Smooth transitions and micro-interactions

### UI Improvements
- **Professional Tip Design**: Clean, centered tip messages
- **Fixed Input Blocking**: School email input no longer blocks after entering personal email
- **Corporate Standard**: Consistent typography and spacing throughout

## 🌐 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📦 Build & Deploy

This is a static site with no build process required. All files are ready for deployment:

```bash
# Development
npm start

# Production (ready to deploy)
npm run deploy
```

## 🔧 Configuration

### Vercel Configuration
The `vercel.json` file is configured for optimal static site deployment:
- Static file serving
- SPA routing support
- No build process required

### Package Scripts
- `npm start` - Start development server
- `npm run dev` - Development mode
- `npm run build` - No build process (static site)
- `npm run deploy` - Ready for deployment

## 📄 License

MIT License - see LICENSE file for details. 

