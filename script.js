/**
 * FRAP Global Scripts
 * Contains Auth logic, routing, and shared utilities.
 */

// Generic fetch wrapper for API calls
async function apiCall(endpoint, method = 'POST', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(endpoint, options);
        return await response.json();
    } catch (error) {
        console.error(`API Error on ${endpoint}:`, error);
        throw error;
    }
}

// Authentication Service
const AuthService = {
    login: async (email, password) => {
        try {
            const res = await apiCall('/login', 'POST', { email, password });
            if (res.success) {
                localStorage.setItem('frap_token', res.token);
                localStorage.setItem('frap_user', JSON.stringify(res.user));
                return true;
            }
            return false;
        } catch (e) {
            alert('Login failed. Ensure server is running.');
            return false;
        }
    },

    signup: (email, password, name) => {
        // Mock signup
        localStorage.setItem('frap_token', 'mock_token_' + Date.now());
        localStorage.setItem('frap_user', JSON.stringify({ email, name }));
        return true;
    },

    logout: () => {
        localStorage.removeItem('frap_token');
        localStorage.removeItem('frap_user');
        window.location.href = 'index.html';
    },

    isAuthenticated: () => {
        return true; // Auth disabled per user request
    },

    requireAuth: () => {
        // Disabled auth validation
        return true;
    }
};

// Image utility for soil analysis
function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
