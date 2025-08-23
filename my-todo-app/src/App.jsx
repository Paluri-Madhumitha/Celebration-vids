import { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';

// --- Icon components (for a cleaner look) ---
// We'll use inline SVG to avoid external dependencies.
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

const Trash2Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

// The main App component
const App = () => {
  // State for Firebase services and user data
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // State for the to-do list
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [message, setMessage] = useState('');

  // Use this state to track if we're waiting for a Firestore operation
  const [isLoading, setIsLoading] = useState(false);

  // Use a ref to store a timeout ID for the message box
  const [messageTimeoutId, setMessageTimeoutId] = useState(null);

  // Helper function to show a message and automatically hide it
  const showMessage = useCallback((msg) => {
    // Clear any existing timeout
    if (messageTimeoutId) {
      clearTimeout(messageTimeoutId);
    }
    setMessage(msg);
    // Set a new timeout to clear the message after 3 seconds
    const id = setTimeout(() => setMessage(''), 3000);
    setMessageTimeoutId(id);
  }, [messageTimeoutId]);

  // --- Initialize Firebase and listen for auth state changes ---
  useEffect(() => {
    try {
      // Access the global variables provided by the Canvas environment
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
      const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

      // Check if config is available before proceeding
      if (!firebaseConfig || Object.keys(firebaseConfig).length === 0) {
        showMessage('Error: Firebase configuration is missing.');
        return;
      }

      // Initialize Firebase app and services
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setDb(firestore);
      setAuth(firebaseAuth);

      // Listen for authentication state changes
      const unsubscribeAuth = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          // User is signed in
          setUserId(user.uid);
          setIsAuthReady(true);
          showMessage('Signed in successfully!');
        } else {
          // No user is signed in, sign in anonymously
          console.log("No user found, signing in anonymously...");
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(firebaseAuth, initialAuthToken);
            } else {
              await signInAnonymously(firebaseAuth);
            }
          } catch (error) {
            console.error("Error signing in anonymously:", error);
            showMessage("Error signing in. Check your connection.");
            setIsAuthReady(true); // Still set to ready to allow the app to render
          }
        }
      });

      // Cleanup function to unsubscribe from auth state changes
      return () => unsubscribeAuth();
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      showMessage("Error initializing the app. Please check the code.");
    }
  }, [showMessage]);

  // --- Real-time data listener with onSnapshot ---
  useEffect(() => {
    if (isAuthReady && db && userId) {
      const q = query(
        collection(db, `artifacts/${__app_id}/users/${userId}/todos`),
        orderBy('createdAt', 'desc') // Order by creation time
      );

      // Set up the real-time listener
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const fetchedTodos = [];
          querySnapshot.forEach((doc) => {
            fetchedTodos.push({ id: doc.id, ...doc.data() });
          });
          setTodos(fetchedTodos);
          console.log('Todos updated in real-time');
        },
        (error) => {
          console.error("Error fetching documents:", error);
          showMessage("Failed to load todos. Please try again.");
        }
      );

      // Clean up the listener when the component unmounts
      return () => unsubscribe();
    }
  }, [db, userId, isAuthReady]); // Re-run when db, userId, or auth state changes

  // --- Firestore Functions ---
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim() || !db || isLoading) {
      showMessage("Please enter a to-do item.");
      return;
    }

    setIsLoading(true);
    try {
      const todosCollectionRef = collection(db, `artifacts/${__app_id}/users/${userId}/todos`);
      await addDoc(todosCollectionRef, {
        text: newTodo,
        createdAt: serverTimestamp(), // Use Firestore's server timestamp
      });
      setNewTodo('');
      showMessage("To-do added successfully!");
    } catch (error) {
      console.error("Error adding document: ", error);
      showMessage("Failed to add to-do. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTodo = async (id) => {
    if (!db || isLoading) return;

    setIsLoading(true);
    try {
      const docRef = doc(db, `artifacts/${__app_id}/users/${userId}/todos`, id);
      await deleteDoc(docRef);
      showMessage("To-do deleted successfully!");
    } catch (error) {
      console.error("Error removing document: ", error);
      showMessage("Failed to delete to-do. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Component rendering ---
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-sans antialiased">
      <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Your To-Do List</h1>
        {/* User ID display for collaborative context */}
        {userId && (
          <p className="text-sm text-gray-500 text-center mb-4 truncate">
            User ID: <span className="font-mono bg-gray-100 p-1 rounded-md">{userId}</span>
          </p>
        )}
        {/* Message Box */}
        {message && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-xl mb-4 text-sm" role="alert">
            <p>{message}</p>
          </div>
        )}

        {/* Form for adding new to-dos */}
        <form onSubmit={handleAddTodo} className="flex items-stretch gap-2 mb-6">
          <input
            type="text"
            className="flex-grow p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new to-do..."
          />
          <button
            type="submit"
            className={`p-3 rounded-xl text-white font-medium shadow-md transition-all duration-300 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
            disabled={isLoading}
          >
            <PlusIcon />
          </button>
        </form>

        {/* To-do list display */}
        <div className="space-y-3">
          {todos.length > 0 ? (
            todos.map((todo) => (
              <div key={todo.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
                <span className="text-gray-700 text-lg flex-grow break-all pr-4">{todo.text}</span>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className={`p-2 rounded-lg transition-all duration-300 ${isLoading ? 'text-gray-400 cursor-not-allowed' : 'text-red-500 hover:bg-red-100 active:scale-90'}`}
                  disabled={isLoading}
                >
                  <Trash2Icon />
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 italic mt-8">No to-dos yet. Add one above!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
