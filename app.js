// Import the functions you need from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDm-Hf0S5K7F7CZ6eDfYOsod52Bivqjphc",
    authDomain: "buzztalk23.firebaseapp.com",
    projectId: "buzztalk23",
    storageBucket: "buzztalk23.appspot.com",
    messagingSenderId: "520080580326",
    appId: "1:520080580326:web:1ca9013545e2cea397e527",
    measurementId: "G-LX3SJDVGSX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Function to set up event listeners
function setupEventListeners() {
    // Sign In with Google
    const signInButton = document.getElementById('signIn');
    if (signInButton) {
        signInButton.addEventListener('click', () => {
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider)
                .then((result) => {
                    // User signed in successfully
                    const user = result.user;
                    console.log("User signed in:", user);

                    // Redirect to chat page after sign in
                    window.location.href = 'chat.html';
                })
                .catch((error) => {
                    console.error("Error during sign in:", error);
                });
        });
    }

    // Chat functionality (only for chat.html)
    const messageInput = document.getElementById('messageInput');
    const sendMessageButton = document.getElementById('sendMessage');
    const messagesDiv = document.getElementById('messages');

    if (messageInput && sendMessageButton && messagesDiv) {
        // Function to send a message
        sendMessageButton.addEventListener('click', () => {
            const message = messageInput.value;
            const user = auth.currentUser; // Get current user

            if (user && message) {
                const timestamp = new Date().toLocaleString(); // Get current timestamp
                set(ref(db, 'messages/' + Date.now()), { // Use timestamp as the key
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    message: message,
                    time: timestamp
                }).then(() => {
                    messageInput.value = ''; // Clear input field
                }).catch((error) => {
                    console.error("Error sending message:", error);
                });
            }
        });

        // Listening for messages
        onValue(ref(db, 'messages/'), (snapshot) => {
            const messages = snapshot.val();
            messagesDiv.innerHTML = ''; // Clear messages div

            // Create an array of message keys and sort them in reverse order
            const messageKeys = Object.keys(messages).reverse();

            messageKeys.forEach(key => {
                const msg = messages[key];
                const msgElement = document.createElement('div');

                // Create message content with name as a clickable element
                msgElement.innerHTML = `
                    <p>
                        <strong class="copy-email" data-email="${msg.email}">${msg.displayName}</strong>: ${msg.message} 
                        <span style="font-size: 0.8em; color: gray;">(${msg.time})</span>
                    </p>
                `;

                messagesDiv.appendChild(msgElement);
            });

            // Add event listeners for copying email on name click
            const nameElements = document.querySelectorAll('.copy-email');
            nameElements.forEach(element => {
                element.addEventListener('click', () => {
                    const email = element.getAttribute('data-email');
                    navigator.clipboard.writeText(email).then(() => {
                        alert('Email copied: ' + email);
                    }).catch(err => {
                        console.error('Error copying email: ', err);
                    });
                });
            });
        });
    }
}

// Initialize event listeners
setupEventListeners();
