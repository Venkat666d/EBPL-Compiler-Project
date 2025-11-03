// Authentication Service
class AuthService {
    constructor() {
        this.baseURL = 'https://ebpl-compiler-project-y5l1.vercel.app/api'; // Update with your Vercel URL
        this.tokenKey = 'ebpl_token';
        this.userKey = 'ebpl_user';
    }

    // Store token and user data
    setAuth(token, user) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    // Get stored token
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    // Get stored user data
    getUser() {
        const userData = localStorage.getItem(this.userKey);
        return userData ? JSON.parse(userData) : null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        // Check if token is expired (simple check)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }

    // Logout user
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        window.location.href = 'auth.html';
    }

    // Make authenticated API requests
    async apiRequest(endpoint, options = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            throw new Error(error.message || 'Network error');
        }
    }

    // Login user
    async login(email, password) {
        return this.apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    // Register user
    async register(name, email, password) {
        return this.apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
    }

    // Get user profile
    async getProfile() {
        return this.apiRequest('/auth/profile');
    }
}

// Initialize auth service
const authService = new AuthService();

// UI Functions
function switchAuthTab(tab) {
    // Update tabs
    document.querySelectorAll('.auth-tab').forEach(tabEl => {
        tabEl.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(tab + 'Form').classList.add('active');

    // Clear messages
    hideAuthMessage();
}

function showAuthMessage(message, type = 'error') {
    const messageDiv = document.getElementById('authMessage');
    messageDiv.textContent = message;
    messageDiv.className = `auth-message ${type}`;
    messageDiv.style.display = 'block';
}

function hideAuthMessage() {
    document.getElementById('authMessage').style.display = 'none';
}

function setLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Form Event Listeners
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const button = e.target.querySelector('button[type="submit"]');

    if (!email || !password) {
        showAuthMessage('Please fill in all fields');
        return;
    }

    try {
        setLoading(button, true);
        hideAuthMessage();

        const result = await authService.login(email, password);
        
        authService.setAuth(result.token, result.user);
        showAuthMessage('Login successful! Redirecting...', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);

    } catch (error) {
        showAuthMessage(error.message);
    } finally {
        setLoading(button, false);
    }
});

document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const button = e.target.querySelector('button[type="submit"]');

    if (!name || !email || !password || !confirmPassword) {
        showAuthMessage('Please fill in all fields');
        return;
    }

    if (password.length < 6) {
        showAuthMessage('Password must be at least 6 characters long');
        return;
    }

    if (password !== confirmPassword) {
        showAuthMessage('Passwords do not match');
        return;
    }

    try {
        setLoading(button, true);
        hideAuthMessage();

        const result = await authService.register(name, email, password);
        
        authService.setAuth(result.token, result.user);
        showAuthMessage('Account created successfully! Redirecting...', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);

    } catch (error) {
        showAuthMessage(error.message);
    } finally {
        setLoading(button, false);
    }
});

// Check if user is already logged in
if (authService.isAuthenticated()) {
    window.location.href = 'dashboard.html';
}