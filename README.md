# Online Quiz Application

A full-stack online quiz application built with vanilla JavaScript, Tailwind CSS, and Firebase/Firestore.

## Features

- User authentication via Firebase Anonymous Auth
- Quiz questions stored in Firestore
- Multiple-choice questions with score tracking
- Real-time score updates
- Responsive design for mobile and desktop
- User-friendly interface with modern styling

## Project Structure

- `index.html` - Main HTML file
- `styles.css` - Custom styles (uses Tailwind CSS classes)
- `app.js` - Main frontend logic (Firebase, quiz logic, rendering)
- `server.js` - Node.js server (optional, for serving static files)
- `serve.py` - Python server (optional, for serving static files)
- `start_quiz_app.sh` / `start_quiz_app.bat` - Helper scripts for starting the app
- `.gitignore` - Files and folders to ignore in git
- `package.json` - Node.js project metadata and scripts
- `requirements.txt` - Python dependencies (none required by default)

## Setup Instructions

### Prerequisites

- A Firebase account and project
- Node.js (for Node server) or Python 3 (for Python server)
- Basic knowledge of HTML, JavaScript, and Firebase

### Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Firestore database in your project
3. Enable Anonymous Authentication in the Authentication section
4. Get your Firebase configuration from Project Settings > General > Your apps > Firebase SDK snippet > Config

### Application Setup

1. Clone or download this repository
2. Open `app.js` and replace the Firebase configuration object with your own:

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

### Running the Application

#### Using Node.js

1. Install Node.js (if not already installed)
2. Run the server:
   ```
   npm install
   npm start
   ```
3. Open your browser and go to [http://localhost:3000](http://localhost:3000) (or the port specified in `server.js`)

#### Using Python

1. Make sure Python 3 is installed
2. Run the server:
   ```
   python serve.py
   ```
3. Open your browser and go to [http://localhost:8000](http://localhost:8000)

#### Using VS Code Live Server extension

1. Install the Live Server extension
2. Open the project folder in VS Code
3. Click "Go Live" in the status bar

## How It Works

- When the application loads, it authenticates the user anonymously
- If the Firestore database doesn't have quiz questions, it populates it with sample questions
- Users can start the quiz, answer questions, and see their final score
- Scores are saved to Firestore with the user's ID

## Customization

### Adding More Questions

To add more questions, modify the `sampleQuestions` array in `app.js`:

```javascript
const sampleQuestions = [
  {
    question: "Your question here?",
    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
    correctAnswerIndex: 0 // Index of the correct answer (0-based)
  },
  // Add more questions...
];
```

### Styling

The application uses Tailwind CSS for styling. You can customize the appearance by:

1. Modifying the classes in the HTML elements in the `renderApp()` function
2. Adding custom styles to the `styles.css` file

## License

This project is open source and available under the MIT License.

## Author

- [Your Name Here]

## Contributors

- Contributions are welcome! Please open issues or submit pull requests.