// Play Finder V2 - Configuration
// Replace these with your actual Supabase project credentials

const CONFIG = {
    // Supabase Configuration
    supabase: {
        url: 'https://your-project.supabase.co', // Replace with your Supabase URL
        anonKey: 'your-anon-key-here' // Replace with your Supabase anon key
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

// Check if Supabase is available and initialize
if (typeof supabase !== 'undefined') {
    try {
        supabaseClient = supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);
        console.log('✅ Supabase client initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize Supabase client:', error);
    }
} else {
    console.warn('⚠️ Supabase library not loaded. Make sure to include the Supabase CDN script.');
}

// Export configuration
window.CONFIG = CONFIG;
window.supabaseClient = supabaseClient;
