# Task Reminder App

A simple, mobile-friendly task management application with reminder notifications. Built with vanilla JavaScript and Firebase.

## 🌟 Features

- 📝 Add tasks with descriptions
- ⏰ Set due dates and times
- 🔔 In-app notifications with sound
- 📱 Mobile-responsive design
- 🔄 Real-time task updates
- 🚀 Progressive Web App (PWA) support

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase account (for backend services)

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/Lint2016/Task_ReminderBy_LouisKapend.git]
   cd Tasks_Reminder_App
   ```

2. Set up Firebase:
   - Create a new Firebase project
   - Enable Firestore Database
   - Update Firebase configuration in `index.js`
   - Set up security rules for Firestore

3. Open `index.html` in a web browser or deploy to a web server

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase Firestore
- **UI Libraries**: SweetAlert2, Animate.css
- **Build Tools**: None (vanilla JS)

## 📱 PWA Support

The app can be installed as a Progressive Web App on supported devices:
- On Android: Use "Add to Home Screen" in Chrome
- On iOS: Use "Add to Home Screen" in Safari

## 🔔 Notifications

The app supports in-app notifications with sound. For push notifications (when app is closed), additional server-side setup is required.

## 📂 Project Structure

```
Tasks_Reminder_App/
├── index.html          # Main HTML file
├── index.js            # Main JavaScript file
├── mobile-init.js      # Mobile initialization and service worker
├── sw.js              # Service worker
├── styles.css         # Main styles
└── manifest.json      # Web app manifest
```

## 🔧 Configuration

1. Update Firebase configuration in `index.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

## 📝 Usage

1. Enter your task in the text area
2. Add your email address
3. Set the reminder date and time
4. Click "Add Task"
5. View your tasks by clicking "View Tasks"

## 📱 Mobile Support

The app is fully responsive and works on mobile devices. For best experience:
- Use Chrome or Safari on iOS
- Use Chrome on Android
- Enable notifications when prompted

## 🔒 Security

- All data is stored securely in Firebase
- Email validation is performed on the client side
- Service worker is used for offline capabilities

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for backend services
- SweetAlert2 for beautiful alerts
- Google Fonts for typography