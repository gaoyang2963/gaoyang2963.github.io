// Simple Visitor Map Widget
// Uses public visitor counter and free IP geolocation API

const VISITOR_API_URL = 'https://api.ipify.org?format=json';

// Get visitor location using free API
async function getVisitorLocation() {
    try {
        // Use free IP geolocation API
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return {
            city: data.city || 'Unknown',
            country: data.country_name || 'Unknown',
            lat: data.latitude || 0,
            lon: data.longitude || 0
        };
    } catch (error) {
        console.error('Failed to get location:', error);
        return {
            city: 'Unknown',
            country: 'Unknown',
            lat: 0,
            lon: 0
        };
    }
}

// Initialize map with sample data
function initMap() {
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet not loaded');
        return null;
    }

    const mapContainer = document.getElementById('visitor-map');
    if (!mapContainer) {
        console.error('Map container not found');
        return null;
    }

    // Create map
    const map = L.map('visitor-map', {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false
    });

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18
    }).addTo(map);

    // Add some sample visitor dots (from major cities)
    const sampleVisitors = [
        { lat: 39.9042, lon: 116.4074, city: 'Beijing', country: 'China' },
        { lat: 31.2304, lon: 121.4737, city: 'Shanghai', country: 'China' },
        { lat: 40.7128, lon: -74.0060, city: 'New York', country: 'USA' },
        { lat: 51.5074, lon: -0.1278, city: 'London', country: 'UK' },
        { lat: 48.8566, lon: 2.3522, city: 'Paris', country: 'France' },
        { lat: 35.6762, lon: 139.6503, city: 'Tokyo', country: 'Japan' },
        { lat: -33.8688, lon: 151.2093, city: 'Sydney', country: 'Australia' },
        { lat: 52.5200, lon: 13.4050, city: 'Berlin', country: 'Germany' },
        { lat: 55.7558, lon: 37.6173, city: 'Moscow', country: 'Russia' },
        { lat: 1.3521, lon: 103.8198, city: 'Singapore', country: 'Singapore' }
    ];

    // Add sample dots
    sampleVisitors.forEach(v => {
        L.circleMarker([v.lat, v.lon], {
            radius: 4,
            fillColor: '#4ade80',
            color: '#22c55e',
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.6
        }).addTo(map).bindPopup(`
            <div class="visitor-popup">
                <strong>${v.city}, ${v.country}</strong>
            </div>
        `);
    });

    return map;
}

// Main initialization
(function initVisitorMap() {
    // Get visitor location
    getVisitorLocation().then(location => {
        const locationEl = document.getElementById('visitor-location-text');
        if (locationEl) {
            locationEl.textContent = `${location.city}, ${location.country}`;
        }
    });

    // Initialize map
    const map = initMap();
    if (!map) {
        console.error('Failed to initialize map');
    }
})();
