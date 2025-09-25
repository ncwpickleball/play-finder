// Play Finder V2 - Configuration
// Replace these with your actual Supabase project credentials

const CONFIG = {
    // Supabase Configuration
    supabase: {
        url: 'https://obheutzptzbdrtnamezx.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iaGV1dHpwdHpiZHJ0bmFtZXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NzY0NDYsImV4cCI6MjA3MzU1MjQ0Nn0.ga_DKiG7j6u7rSiQQ_j_VvvPsxOb56rfs1m_Zs4numE'
    },
    
    // App Configuration
    app: {
        name: 'Play Finder',
        version: '2.0.0',
        environment: 'development' // 'development' or 'production'
    },
    
    // Feature Flags
    features: {
        realTimeUpdates: true,
        pushNotifications: true,
        offlineMode: true,
        socialLogin: true
    },
    
    // Default Settings
    defaults: {
        location: {
            latitude: 40.7128,
            longitude: -74.0060,
            city: 'New York',
            state: 'NY',
            country: 'US'
        },
        sports: [
            'pickleball',
            'tennis',
            'basketball',
            'volleyball',
            'soccer',
            'football',
            'baseball',
            'hockey'
        ],
        activityTypes: [
            'game',
            'tournament',
            'practice',
            'casual'
        ],
        skillLevels: [
            'beginner',
            'intermediate',
            'advanced',
            'all'
        ]
    }
};

// Initialize Supabase client
let supabaseClient = null;

// Function to initialize Supabase client
function initializeSupabase() {
    console.log('🔍 Attempting to initialize Supabase...');
    console.log('🔍 Supabase library available:', typeof supabase !== 'undefined');
    
    if (typeof supabase !== 'undefined') {
        try {
            supabaseClient = supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);
            console.log('✅ Supabase client initialized successfully');
            window.supabaseClient = supabaseClient; // Update global reference
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Supabase client:', error);
            return false;
        }
    } else {
        console.warn('⚠️ Supabase library not loaded. Make sure to include the Supabase CDN script.');
        return false;
    }
}

// Wait for Supabase library to load
function waitForSupabase() {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait
    
    const checkSupabase = () => {
        attempts++;
        console.log(`🔍 Checking for Supabase library (attempt ${attempts}/${maxAttempts})`);
        
        if (typeof supabase !== 'undefined') {
            console.log('✅ Supabase library found, initializing...');
            initializeSupabase();
        } else if (attempts < maxAttempts) {
            setTimeout(checkSupabase, 100); // Check every 100ms
        } else {
            console.error('❌ Supabase library failed to load after 5 seconds');
        }
    };
    
    checkSupabase();
}

// Start checking for Supabase library
waitForSupabase();

// Export configuration
window.CONFIG = CONFIG;
window.supabaseClient = supabaseClient;
window.initializeSupabase = initializeSupabase;
