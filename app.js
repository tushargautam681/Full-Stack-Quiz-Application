// Firebase Configuration
const firebaseConfig = {
  // Firebase config will be provided by the user
  // For now, we'll use placeholder values
  apiKey: "AIzaSyCzyjf1nbg7NiJ0-1wj-FFF_e5rJ4_unyk",
  authDomain: "full-stack-quiz-applicat-bf1b9.firebaseapp.com",
  projectId: "full-stack-quiz-applicat-bf1b9",
  storageBucket: "full-stack-quiz-applicat-bf1b9.firebasestorage.app",
  messagingSenderId: "302200115464",
  appId: "1:302200115464:web:fc7d3d00177de5a4b29cbd"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Sample quiz questions to populate Firestore if empty
const sampleQuestions = [
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswerIndex: 2
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswerIndex: 1
  },
  {
    question: "What is the largest mammal in the world?",
    options: ["Elephant", "Giraffe", "Blue Whale", "Polar Bear"],
    correctAnswerIndex: 2
  },
  {
    question: "Which language runs in a web browser?",
    options: ["Java", "C", "Python", "JavaScript"],
    correctAnswerIndex: 3
  },
  {
    question: "What does HTML stand for?",
    options: ["Hypertext Markup Language", "Hypertext Markdown Language", "Hyperloop Machine Language", "Helicopters Terminals Motorboats Lamborginis"],
    correctAnswerIndex: 0
  }
];

// Main application state
let state = {
  userId: null,
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  selectedAnswerIndex: null,
  quizStarted: false,
  quizFinished: false,
  loading: true,
  error: null
};

// DOM elements
const appElement = document.getElementById('app');

// Initialize the application
async function initApp() {
  try {
    // Set up anonymous authentication
    await auth.signInAnonymously();
    
    // Listen for auth state changes
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        state.userId = user.uid;
        renderApp();
        await loadQuestions();
      } else {
        state.userId = null;
        state.error = "Authentication failed. Please refresh the page.";
        renderApp();
      }
    });
  } catch (error) {
    console.error("Error initializing app:", error);
    state.error = `Error initializing app: ${error.message}`;
    state.loading = false;
    renderApp();
  }
}

// Load questions from Firestore or populate if empty
async function loadQuestions() {
  try {
    // Check if questions collection exists and has documents
    const questionsSnapshot = await db.collection('quizzes').get();
    
    if (questionsSnapshot.empty) {
      // Collection is empty, populate with sample questions
      const batch = db.batch();
      
      sampleQuestions.forEach((question, index) => {
        const docRef = db.collection('quizzes').doc(`question_${index + 1}`);
        batch.set(docRef, question);
      });
      
      await batch.commit();
      console.log("Sample questions added to Firestore");
      
      // Fetch the questions again
      const newQuestionsSnapshot = await db.collection('quizzes').get();
      state.questions = newQuestionsSnapshot.docs.map(doc => doc.data());
    } else {
      // Collection exists, get the questions
      state.questions = questionsSnapshot.docs.map(doc => doc.data());
    }
    
    state.loading = false;
    renderApp();
  } catch (error) {
    console.error("Error loading questions:", error);
    state.error = `Error loading questions: ${error.message}`;
    state.loading = false;
    renderApp();
  }
}

// Start the quiz
function startQuiz() {
  state.quizStarted = true;
  state.quizFinished = false;
  state.currentQuestionIndex = 0;
  state.score = 0;
  state.selectedAnswerIndex = null;
  renderApp();
}

// Handle answer selection
function selectAnswer(index) {
  state.selectedAnswerIndex = index;
  renderApp();
}

// Move to the next question or finish the quiz
async function nextQuestion() {
  // Check if the selected answer is correct
  const currentQuestion = state.questions[state.currentQuestionIndex];
  if (state.selectedAnswerIndex === currentQuestion.correctAnswerIndex) {
    state.score++;
  }
  
  // Move to the next question or finish the quiz
  if (state.currentQuestionIndex < state.questions.length - 1) {
    state.currentQuestionIndex++;
    state.selectedAnswerIndex = null;
  } else {
    state.quizFinished = true;
    // Save the score to Firestore
    await saveScore();
  }
  
  renderApp();
}

// Go back to the previous question
function previousQuestion() {
  if (state.currentQuestionIndex > 0) {
    state.currentQuestionIndex--;
    // Reset the selected answer for this question
    state.selectedAnswerIndex = null;
    renderApp();
  }
}

// Show answers modal
function showAnswers() {
  // Create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay fade-in';
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  // Create modal header
  const modalHeader = document.createElement('div');
  modalHeader.className = 'flex justify-between items-center mb-4';
  modalHeader.innerHTML = `
    <h3 class="text-xl font-semibold">Quiz Answers</h3>
    <button id="close-modal" class="text-gray-500 hover:text-gray-700">
      <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  `;
  
  // Create answers list
  const answersList = document.createElement('div');
  answersList.className = 'space-y-4 max-h-96 overflow-y-auto';
  
  // Add each question and its correct answer
  state.questions.forEach((question, index) => {
    const questionElement = document.createElement('div');
    questionElement.className = 'border-b border-gray-200 pb-4';
    questionElement.innerHTML = `
      <p class="font-medium mb-2">Question ${index + 1}: ${question.question}</p>
      <p class="text-green-600">Correct answer: ${question.options[question.correctAnswerIndex]}</p>
    `;
    answersList.appendChild(questionElement);
  });
  
  // Assemble modal
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(answersList);
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
  
  // Add event listener to close button
  document.getElementById('close-modal').addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
  });
  
  // Close modal when clicking outside
  modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) {
      document.body.removeChild(modalOverlay);
    }
  });
}

// Save the user's score to Firestore
async function saveScore() {
  try {
    await db.collection('userScores').add({
      userId: state.userId,
      score: state.score,
      totalQuestions: state.questions.length,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log("Score saved to Firestore");
  } catch (error) {
    console.error("Error saving score:", error);
    state.error = `Error saving score: ${error.message}`;
    renderApp();
  }
}

// Render the application UI based on the current state
function renderApp() {
  // Clear the app container
  appElement.innerHTML = '';
  
  // Create the header
  const header = document.createElement('header');
  header.className = 'text-center mb-8';
  header.innerHTML = `
    <h1 class="text-3xl font-bold text-blue-600 mb-2">Online Quiz Application</h1>
    ${state.userId ? `<p class="text-sm text-gray-600">User ID: ${state.userId}</p>` : ''}
  `;
  appElement.appendChild(header);
  
  // Show loading state
  if (state.loading) {
    const loadingElement = document.createElement('div');
    loadingElement.className = 'flex justify-center items-center h-64';
    loadingElement.innerHTML = `
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p class="ml-3 text-lg text-blue-500">Loading...</p>
    `;
    appElement.appendChild(loadingElement);
    return;
  }
  
  // Show error state
  if (state.error) {
    const errorElement = document.createElement('div');
    errorElement.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6';
    errorElement.innerHTML = `
      <p>${state.error}</p>
      <button id="dismiss-error" class="absolute top-0 right-0 p-2 text-red-700">
        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </button>
    `;
    appElement.appendChild(errorElement);
    
    // Add event listener to dismiss error
    document.getElementById('dismiss-error').addEventListener('click', () => {
      state.error = null;
      renderApp();
    });
  }
  
  // Main content container
  const mainContent = document.createElement('div');
  mainContent.className = 'bg-white rounded-lg shadow-lg p-6 fade-in';
  
  // Quiz not started yet
  if (!state.quizStarted && !state.quizFinished) {
    mainContent.innerHTML = `
      <div class="text-center">
        <div class="mb-6">
          <svg class="w-24 h-24 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-semibold mb-4">Welcome to the Quiz!</h2>
        <p class="mb-6 text-gray-600">Test your knowledge with our quiz. There are ${state.questions.length} questions to answer.</p>
        <button id="start-quiz" class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-8 rounded-lg transition duration-200 transform hover:scale-105">
          <span class="flex items-center justify-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Start Quiz
          </span>
        </button>
      </div>
    `;
  }
  // Quiz in progress
  else if (state.quizStarted && !state.quizFinished) {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    
    // Calculate progress percentage
    const progressPercentage = ((state.currentQuestionIndex) / state.questions.length) * 100;
    
    mainContent.innerHTML = `
      <div>
        <div class="mb-6">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-gray-600">Question ${state.currentQuestionIndex + 1} of ${state.questions.length}</span>
            <span class="text-sm font-medium text-blue-600">Score: ${state.score}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div class="bg-blue-500 h-2.5 rounded-full progress-animation" style="width: ${progressPercentage}%"></div>
          </div>
        </div>
        
        <h2 class="text-xl font-semibold mb-4">${currentQuestion.question}</h2>
        
        <div class="space-y-3 mb-6" id="options-container">
          ${currentQuestion.options.map((option, index) => `
            <div class="option ${state.selectedAnswerIndex === index ? 'bg-blue-100 border-blue-500 selected' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition duration-200" data-index="${index}">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-5 w-5 mr-2">
                  ${state.selectedAnswerIndex === index ? `
                    <svg class="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                  ` : `
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
                    </svg>
                  `}
                </div>
                <span class="font-medium">${option}</span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="flex justify-between mt-8">
          ${state.currentQuestionIndex > 0 ? `
            <button id="prev-button" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition duration-200">
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Previous
              </span>
            </button>
          ` : `<div></div>`}
          
          <button id="next-button" class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition duration-200 ${state.selectedAnswerIndex === null ? 'opacity-50 cursor-not-allowed' : ''}" ${state.selectedAnswerIndex === null ? 'disabled' : ''}>
            <span class="flex items-center">
              ${state.currentQuestionIndex === state.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </span>
          </button>
        </div>
      </div>
    `;
  }
  // Quiz finished
  else if (state.quizFinished) {
    const percentage = Math.round((state.score / state.questions.length) * 100);
    let message = '';
    let emoji = '';
    
    if (percentage >= 80) {
      message = 'Excellent job! You\'re a quiz master!';
      emoji = '🏆';
    } else if (percentage >= 60) {
      message = 'Good job! You know your stuff!';
      emoji = '👍';
    } else if (percentage >= 40) {
      message = 'Not bad! Keep learning!';
      emoji = '📚';
    } else {
      message = 'Keep practicing! You\'ll get better!';
      emoji = '💪';
    }
    
    mainContent.innerHTML = `
      <div class="text-center">
        <div class="text-6xl mb-4">${emoji}</div>
        <h2 class="text-2xl font-semibold mb-4">Quiz Completed!</h2>
        
        <div class="mb-8">
          <div class="inline-block rounded-full bg-blue-100 p-4 mb-4">
            <div class="text-5xl font-bold text-blue-600">${state.score} / ${state.questions.length}</div>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-4 mb-4 max-w-xs mx-auto">
            <div class="bg-blue-500 h-4 rounded-full progress-animation" style="width: ${percentage}%"></div>
          </div>
          <div class="text-lg text-gray-600 mb-2">${percentage}%</div>
          <p class="mt-4 text-gray-700">${message}</p>
        </div>
        
        <div class="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button id="view-answers" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition duration-200">
            <span class="flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              View Answers
            </span>
          </button>
          <button id="restart-quiz" class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition duration-200">
            <span class="flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Restart Quiz
            </span>
          </button>
        </div>
      </div>
    `;
  }
  
  appElement.appendChild(mainContent);
  
  // Add event listeners
  if (!state.quizStarted && !state.quizFinished) {
    document.getElementById('start-quiz').addEventListener('click', startQuiz);
  } else if (state.quizStarted && !state.quizFinished) {
    // Add event listeners to options
    const optionsContainer = document.getElementById('options-container');
    if (optionsContainer) {
      const options = optionsContainer.querySelectorAll('.option');
      options.forEach(option => {
        option.addEventListener('click', () => {
          const index = parseInt(option.getAttribute('data-index'));
          selectAnswer(index);
        });
      });
    }
    
    // Add event listener to next button
    const nextButton = document.getElementById('next-button');
    if (nextButton && state.selectedAnswerIndex !== null) {
      nextButton.addEventListener('click', nextQuestion);
    }
    
    // Add event listener to previous button if it exists
    const prevButton = document.getElementById('prev-button');
    if (prevButton) {
      prevButton.addEventListener('click', previousQuestion);
    }
  } else if (state.quizFinished) {
    document.getElementById('restart-quiz').addEventListener('click', startQuiz);
    document.getElementById('view-answers').addEventListener('click', showAnswers);
  }
}

// Initialize the application
initApp();