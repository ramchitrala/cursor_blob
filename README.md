# RoomSpot Waitlist

A modern, animated waitlist page for RoomSpot's student housing platform. Features a beautiful UI with 60fps animations and special handling for student (.edu) email addresses.

## Features

- **60fps Animations**: Smooth gradient orbs that follow mouse movement
- **Student Priority**: Special beta access for .edu email addresses
- **Responsive Design**: Works on all device sizes
- **Modern UI**: Glassmorphism effects and micro-interactions
- **Performance Optimized**: Throttled animations and efficient particle system

## Project Structure

```
cursor_blob/
├── index.html              # Main HTML file
├── src/
│   ├── css/
│   │   └── styles.css      # All CSS styles
│   ├── js/
│   │   └── main.js         # JavaScript functionality
│   └── assets/             # Images and other assets
├── dist/                   # Build output (if needed)
├── package.json            # Project configuration
└── README.md              # This file
```

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cursor_blob
   ```

2. **Start the development server**
   ```bash
   npm start
   # or
   python -m http.server 8000
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000`

## Key Features

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
- **Fixed Pro Tip**: Simplified to "Tip: Use school email to join early access beta"
- **Fixed Input Blocking**: School email input no longer blocks after entering personal email
- **Corporate Standard**: Consistent typography and spacing throughout

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT License - see LICENSE file for details. 

