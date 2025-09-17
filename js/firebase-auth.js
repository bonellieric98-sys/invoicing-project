// js/firebase-auth.js
// Firebase Authentication Manager for your invoicing project

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

import { firebaseConfig, baseURL } from './firebase-config.js';

class BillwiseAuth {
    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.auth = getAuth(this.app);
        this.googleProvider = new GoogleAuthProvider();
        this.currentUser = null;
        
        this.setupAuthStateListener();
        this.initializeUI();
    }

    setupAuthStateListener() {
        onAuthStateChanged(this.auth, (user) => {
            this.currentUser = user;
            this.handleAuthStateChange(user);
        });
    }

    handleAuthStateChange(user) {
        if (user) {
            this.showAuthenticatedUI(user);
            this.storeUserData(user);
            
            // Redirect to dashboard if on login page
            if (window.location.pathname.includes('login.html') || 
                window.location.pathname.includes('index.html')) {
                window.location.href = `${baseURL}/dashboard.html`;
            }
        } else {
            this.showUnauthenticatedUI();
            this.clearUserData();
            
            // Redirect to login if on protected page
            const protectedPages = ['dashboard.html', 'create-invoice.html', 'invoices.html'];
            const currentPage = window.location.pathname.split('/').pop();
            
            if (protectedPages.includes(currentPage)) {
                window.location.href = `${baseURL}/login.html`;
            }
        }
    }

    showAuthenticatedUI(user) {
        // Hide login/register elements
        const authHidden = document.querySelectorAll('.auth-hidden');
        authHidden.forEach(el => el.style.display = 'none');

        // Show authenticated elements
        const authRequired = document.querySelectorAll('.auth-required');
        authRequired.forEach(el => el.style.display = 'block');

        // Update user info in UI
        this.updateUserInfo(user);
    }

    showUnauthenticatedUI() {
        // Show login/register elements
        const authHidden = document.querySelectorAll('.auth-hidden');
        authHidden.forEach(el => el.style.display = 'block');

        // Hide authenticated elements
        const authRequired = document.querySelectorAll('.auth-required');
        authRequired.forEach(el => el.style.display = 'none');
    }

    updateUserInfo(user) {
        // Update user name
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => {
            el.textContent = user.displayName || user.email.split('@')[0];
        });

        // Update user email
        const userEmailElements = document.querySelectorAll('.user-email');
        userEmailElements.forEach(el => {
            el.textContent = user.email;
        });

        // Update user avatar
        const userAvatarElements = document.querySelectorAll('.user-avatar');
        userAvatarElements.forEach(el => {
            if (user.photoURL) {
                el.innerHTML = `<img src="${user.photoURL}" alt="User Avatar" style="width: 100%; height: 100%; border-radius: 50%;">`;
            } else {
                const initial = (user.displayName || user.email).charAt(0).toUpperCase();
                el.textContent = initial;
            }
        });
    }

    storeUserData(user) {
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
        };
        localStorage.setItem('billwise_user', JSON.stringify(userData));
    }

    clearUserData() {
        localStorage.removeItem('billwise_user');
    }

    initializeUI() {
        // Initialize login form if it exists
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Initialize register form if it exists
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Initialize Google sign-in buttons
        const googleButtons = document.querySelectorAll('.google-signin');
        googleButtons.forEach(btn => {
            btn.addEventListener('click', () => this.signInWithGoogle());
        });

        // Initialize logout buttons
        const logoutButtons = document.querySelectorAll('.logout-btn');
        logoutButtons.forEach(btn => {
            btn.addEventListener('click', () => this.signOut());
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = e.target.querySelector('#loginEmail').value;
        const password = e.target.querySelector('#loginPassword').value;

        try {
            this.showLoading('Signing in...');
            await signInWithEmailAndPassword(this.auth, email, password);
            this.showMessage('Login successful!', 'success');
        } catch (error) {
            this.showMessage(this.getErrorMessage(error.code), 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const name = e.target.querySelector('#registerName').value;
        const email = e.target.querySelector('#registerEmail').value;
        const password = e.target.querySelector('#registerPassword').value;

        try {
            this.showLoading('Creating account...');
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            
            if (name) {
                await updateProfile(userCredential.user, { displayName: name });
            }
            
            this.showMessage('Account created successfully!', 'success');
        } catch (error) {
            this.showMessage(this.getErrorMessage(error.code), 'error');
        } finally {
            this.hideLoading();
        }
    }

    async signInWithGoogle() {
        try {
            this.showLoading('Signing in with Google...');
            await signInWithPopup(this.auth, this.googleProvider);
            this.showMessage('Google sign-in successful!', 'success');
        } catch (error) {
            this.showMessage(this.getErrorMessage(error.code), 'error');
        } finally {
            this.hideLoading();
        }
    }

    async signOut() {
        try {
            await signOut(this.auth);
            this.showMessage('Signed out successfully!', 'success');
        } catch (error) {
            this.showMessage('Error signing out', 'error');
        }
    }

    showMessage(message, type = 'info') {
        // Create or update message element
        let messageEl = document.querySelector('.auth-message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.className = 'auth-message';
            document.body.insertBefore(messageEl, document.body.firstChild);
        }

        messageEl.textContent = message;
        messageEl.className = `auth-message ${type}`;
        messageEl.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (messageEl) messageEl.style.display = 'none';
        }, 5000);
    }

    showLoading(message = 'Loading...') {
        // Disable all form buttons
        const buttons = document.querySelectorAll('button[type="submit"]');
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.dataset.originalText = btn.textContent;
            btn.textContent = message;
        });
    }

    hideLoading() {
        // Re-enable all form buttons
        const buttons = document.querySelectorAll('button[type="submit"]');
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.textContent = btn.dataset.originalText || btn.textContent;
        });
    }

    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/email-already-in-use': 'Email already registered.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/invalid-email': 'Invalid email address.',
            'auth/too-many-requests': 'Too many attempts. Try again later.',
            'auth/popup-closed-by-user': 'Sign-in cancelled.'
        };
        return errorMessages[errorCode] || 'An error occurred. Please try again.';
    }

    // Public methods for your invoice management
    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    getUserId() {
        return this.currentUser?.uid || null;
    }
}

// Initialize and export
const billwiseAuth = new BillwiseAuth();
window.billwiseAuth = billwiseAuth;
export default billwiseAuth;
