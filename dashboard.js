// Dashboard functionality
const authService = new AuthService();

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!authService.isAuthenticated()) {
        window.location.href = 'auth.html';
        return;
    }

    loadUserData();
    loadUserStats();
});

function loadUserData() {
    const user = authService.getUser();
    if (user) {
        document.getElementById('userName').textContent = user.name;
        document.getElementById('memberSince').textContent = 
            new Date(user.createdAt || Date.now()).toLocaleDateString();
    }
}

function loadUserStats() {
    // Simulate loading user stats
    const programsCount = localStorage.getItem('ebpl_programs_count') || 0;
    document.getElementById('programsCount').textContent = programsCount;

    // Load recent activity
    const recentActivity = JSON.parse(localStorage.getItem('ebpl_recent_activity') || '[]');
    const activityList = document.getElementById('recentActivity');
    
    if (recentActivity.length > 0) {
        activityList.innerHTML = recentActivity
            .slice(-5)
            .map(activity => `<div class="activity-item">${activity}</div>`)
            .join('');
    }
}

function viewProfile() {
    alert('Profile feature coming soon!');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        authService.logout();
    }
}

function goToCompiler() {
    window.location.href = 'index.html';
}