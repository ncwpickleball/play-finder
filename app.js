// Play Finder V2 - Main Application
class PlayFinderApp {
    constructor() {
        this.currentUser = null;
        this.currentLocation = null;
        this.activities = [];
        this.isLoading = false;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing Play Finder V2...');
        
        // Show loading screen
        this.showLoadingScreen();
        
        try {
            // Register service worker for PWA
            await this.registerServiceWorker();
            
            // Initialize app components
            await this.initializeAuth();
            await this.initializeLocation();
            await this.initializeUI();
            await this.loadInitialData();
            
            // Hide loading screen and show app
            this.hideLoadingScreen();
            this.showApp();
            
            console.log('✅ Play Finder V2 initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.showError('Failed to initialize app. Please refresh the page.');
        }
    }
    
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const appContent = document.getElementById('app-content');
        
        if (loadingScreen) loadingScreen.style.display = 'flex';
        if (appContent) appContent.style.display = 'none';
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const appContent = document.getElementById('app-content');
        
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (appContent) appContent.style.display = 'block';
    }
    
    showApp() {
        const authScreens = document.getElementById('auth-screens');
        const appContent = document.getElementById('app-content');
        
        if (authScreens) authScreens.style.display = 'none';
        if (appContent) appContent.style.display = 'block';
    }
    
    showError(message) {
        // Simple error display - can be enhanced later
        alert(message);
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered successfully:', registration);
                
                // Handle updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New content is available, prompt user to refresh
                            if (confirm('New version available! Refresh to update?')) {
                                window.location.reload();
                            }
                        }
                    });
                });
            } catch (error) {
                console.warn('⚠️ Service Worker registration failed:', error);
            }
        } else {
            console.warn('⚠️ Service Worker not supported');
        }
    }
    
    async initializeAuth() {
        if (!window.supabaseClient) {
            console.warn('⚠️ Supabase not available, using mock auth');
            return;
        }
        
        try {
            // Check for existing session
            const { data: { session }, error } = await window.supabaseClient.auth.getSession();
            
            if (error) {
                console.error('Auth session error:', error);
                return;
            }
            
            if (session && session.user) {
                this.currentUser = {
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
                    avatar: session.user.user_metadata?.avatar_url || null
                };
                
                console.log('✅ User authenticated:', this.currentUser.name);
                this.updateAuthUI();
            } else {
                console.log('ℹ️ No active session, user not authenticated');
            }
        } catch (error) {
            console.error('Auth initialization error:', error);
        }
    }
    
    async initializeLocation() {
        try {
            if (navigator.geolocation) {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 300000 // 5 minutes
                    });
                });
                
                this.currentLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                
                // Update location display
                this.updateLocationDisplay();
                console.log('✅ Location initialized:', this.currentLocation);
            } else {
                console.warn('⚠️ Geolocation not supported');
                this.setDefaultLocation();
            }
        } catch (error) {
            console.warn('⚠️ Failed to get location:', error);
            this.setDefaultLocation();
        }
    }
    
    setDefaultLocation() {
        this.currentLocation = {
            latitude: window.CONFIG.defaults.location.latitude,
            longitude: window.CONFIG.defaults.location.longitude
        };
        this.updateLocationDisplay();
    }
    
    updateLocationDisplay() {
        const locationElement = document.getElementById('currentLocation');
        if (locationElement && this.currentLocation) {
            // For now, show coordinates - can be enhanced with reverse geocoding
            locationElement.textContent = `${this.currentLocation.latitude.toFixed(4)}, ${this.currentLocation.longitude.toFixed(4)}`;
        }
    }
    
    initializeUI() {
        // Initialize bottom navigation
        this.initializeBottomNavigation();
        
        // Initialize header buttons
        this.initializeHeaderButtons();
        
        // Initialize post options
        this.initializePostOptions();
        
        // Initialize search functionality
        this.initializeSearch();
        
        // Initialize profile
        this.initializeProfile();
    }
    
    initializeBottomNavigation() {
        const navItems = document.querySelectorAll('.bottom-nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
                
                // Update active state
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }
    
    initializeHeaderButtons() {
        // Notifications button
        const notificationsBtn = document.getElementById('notificationsBtn');
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', () => {
                this.showNotifications();
            });
        }
        
        // Profile button
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                this.showSection('profile');
                // Update bottom nav
                document.querySelectorAll('.bottom-nav-item').forEach(nav => nav.classList.remove('active'));
                document.querySelector('[data-section="profile"]').classList.add('active');
            });
        }
        
        // Refresh feed button
        const refreshBtn = document.getElementById('refreshFeedBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshFeed();
            });
        }
    }
    
    initializePostOptions() {
        const postOptions = document.querySelectorAll('.post-option');
        
        postOptions.forEach(option => {
            option.addEventListener('click', () => {
                const type = option.dataset.type;
                this.handlePostOption(type);
            });
        });
    }
    
    initializeSearch() {
        const searchInputs = ['searchLocation', 'searchSport', 'searchDate'];
        
        searchInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('change', () => {
                    this.performSearch();
                });
            }
        });
    }
    
    initializeProfile() {
        const editProfileBtn = document.getElementById('editProfileBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                this.editProfile();
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }
    
    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.app-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Load section-specific data
        this.loadSectionData(sectionId);
    }
    
    loadSectionData(sectionId) {
        switch (sectionId) {
            case 'feed':
                this.loadFeed();
                break;
            case 'search':
                this.loadSearchResults();
                break;
            case 'profile':
                this.loadProfile();
                break;
        }
    }
    
    async loadInitialData() {
        // Load mock activities for now
        this.activities = this.generateMockActivities();
        await this.loadFeed();
    }
    
    generateMockActivities() {
        const sports = window.CONFIG.defaults.sports;
        const activityTypes = window.CONFIG.defaults.activityTypes;
        const skillLevels = window.CONFIG.defaults.skillLevels;
        
        return Array.from({ length: 10 }, (_, i) => ({
            id: `activity-${i + 1}`,
            title: `${sports[i % sports.length].charAt(0).toUpperCase() + sports[i % sports.length].slice(1)} ${activityTypes[i % activityTypes.length]}`,
            sport: sports[i % sports.length],
            type: activityTypes[i % activityTypes.length],
            location: `Court ${i + 1}, Central Park`,
            startTime: new Date(Date.now() + (i * 2 * 60 * 60 * 1000)), // Every 2 hours
            maxParticipants: 4 + (i % 4),
            currentParticipants: 2 + (i % 3),
            skillLevel: skillLevels[i % skillLevels.length],
            description: `Join us for a fun ${sports[i % sports.length]} game!`,
            createdBy: {
                name: `Player ${i + 1}`,
                avatar: null
            },
            likes: Math.floor(Math.random() * 20),
            comments: Math.floor(Math.random() * 10)
        }));
    }
    
    async loadFeed() {
        const activitiesList = document.getElementById('activitiesList');
        if (!activitiesList) return;
        
        if (this.activities.length === 0) {
            activitiesList.innerHTML = `
                <div class="no-activities">
                    <i class="fas fa-search-location"></i>
                    <h3>No activities found</h3>
                    <p>Be the first to post an activity in your area!</p>
                </div>
            `;
            return;
        }
        
        activitiesList.innerHTML = this.activities.map(activity => `
            <div class="activity-card" data-activity-id="${activity.id}">
                <div class="activity-header">
                    <h3 class="activity-title">${activity.title}</h3>
                    <span class="activity-sport">${activity.sport}</span>
                </div>
                <div class="activity-details">
                    <div class="activity-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${activity.location}</span>
                    </div>
                    <div class="activity-detail">
                        <i class="fas fa-clock"></i>
                        <span>${this.formatDateTime(activity.startTime)}</span>
                    </div>
                    <div class="activity-detail">
                        <i class="fas fa-users"></i>
                        <span>${activity.currentParticipants}/${activity.maxParticipants} players</span>
                    </div>
                    <div class="activity-detail">
                        <i class="fas fa-signal"></i>
                        <span>${activity.skillLevel} level</span>
                    </div>
                </div>
                <div class="activity-actions">
                    <button class="btn btn-primary btn-sm" onclick="app.joinActivity('${activity.id}')">
                        Join Game
                    </button>
                    <div class="activity-stats">
                        <span><i class="fas fa-heart"></i> ${activity.likes}</span>
                        <span><i class="fas fa-comment"></i> ${activity.comments}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    formatDateTime(date) {
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours < 1) {
            return `In ${minutes} minutes`;
        } else if (hours < 24) {
            return `In ${hours} hours`;
        } else {
            return date.toLocaleDateString();
        }
    }
    
    async refreshFeed() {
        const refreshBtn = document.getElementById('refreshFeedBtn');
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
        
        // Simulate refresh delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Regenerate mock activities
        this.activities = this.generateMockActivities();
        await this.loadFeed();
        
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
        }
    }
    
    handlePostOption(type) {
        if (type === 'game') {
            this.showPostGameForm();
        } else if (type === 'partner') {
            this.showFindPartnerForm();
        }
    }
    
    showPostGameForm() {
        // TODO: Implement post game form
        alert('Post Game form coming soon!');
    }
    
    showFindPartnerForm() {
        // TODO: Implement find partner form
        alert('Find Partner form coming soon!');
    }
    
    performSearch() {
        const location = document.getElementById('searchLocation')?.value;
        const sport = document.getElementById('searchSport')?.value;
        const date = document.getElementById('searchDate')?.value;
        
        console.log('Searching with:', { location, sport, date });
        // TODO: Implement search functionality
    }
    
    loadSearchResults() {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>Search for activities</h3>
                    <p>Use the filters above to find games in your area</p>
                </div>
            `;
        }
    }
    
    loadProfile() {
        if (this.currentUser) {
            const profileName = document.getElementById('profileName');
            const profileLocation = document.getElementById('profileLocation');
            
            if (profileName) profileName.textContent = this.currentUser.name;
            if (profileLocation) profileLocation.textContent = 'New York, NY';
        }
    }
    
    updateAuthUI() {
        // Update profile section with user data
        this.loadProfile();
    }
    
    showNotifications() {
        // TODO: Implement notifications
        alert('Notifications coming soon!');
    }
    
    editProfile() {
        // TODO: Implement profile editing
        alert('Profile editing coming soon!');
    }
    
    async logout() {
        if (window.supabaseClient) {
            try {
                await window.supabaseClient.auth.signOut();
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
        
        this.currentUser = null;
        this.showAuthScreen();
    }
    
    showAuthScreen() {
        // TODO: Implement authentication screens
        alert('Authentication screens coming soon!');
    }
    
    joinActivity(activityId) {
        const activity = this.activities.find(a => a.id === activityId);
        if (activity) {
            if (activity.currentParticipants < activity.maxParticipants) {
                activity.currentParticipants++;
                this.loadFeed(); // Refresh the feed
                alert(`Joined ${activity.title}!`);
            } else {
                alert('This activity is full!');
            }
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PlayFinderApp();
});

// Handle viewport height for mobile browsers
function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set initial viewport height
setViewportHeight();

// Update viewport height on resize
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);
