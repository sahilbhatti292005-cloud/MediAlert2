
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../firebase';

/**
 * Handles Firebase Authentication errors and converts them to user-friendly messages.
 */
const handleAuthError = (error: any): string => {
  const errorCode = error.code;
  console.error("Firebase Auth Error:", errorCode, error.message);

  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'User already exists, please login';
    case 'auth/user-not-found':
      return 'User not found, please register';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid credentials';
    case 'auth/invalid-email':
      return 'Invalid email address format';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Registers a new user with email, password, and full name.
 */
export const registerUser = async (name: string, email: string, pass: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    // Update the user's profile with their full name
    await updateProfile(userCredential.user, {
      displayName: name
    });
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: handleAuthError(error) };
  }
};

/**
 * Logs in an existing user with email and password.
 */
export const loginUser = async (email: string, pass: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: handleAuthError(error) };
  }
};

/**
 * Logs out the current user.
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: handleAuthError(error) };
  }
};

/**
 * Listens for authentication state changes.
 */
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
