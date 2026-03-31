// Visitor Map Widget - GitHub Issues as Database
// Pushes visitor location to GitHub Issue #1, renders Leaflet map

// Token should be injected at build time from GitHub Actions secret
const GITHUB_TOKEN = '__VISITOR_TOKEN_PLACEHOLDER__';

const VISITOR_DATA_ISSUE = 1;
const GITHUB_REPO = 'gaoyang2963/gaoyang2963.github.io';
const STORAGE_KEY = 'visitor_submitted_at';

// Get visitor location
async function getVisitorLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return {
            city: data.city || 'Unknown',
            country: data.country_name || 'Unknown',
            lat: data.latitude,
            lon: data.longitude,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Failed to get location:', error);
        return null;
    }
}

// Push visitor data to GitHub Issue
async function pushVisitorToIssue(location) {
    if (!location || !location.lat || !location.lon) return false;
    if (!GITHUB_TOKEN) {
        console.warn('GitHub token not configured, skipping push');
        return false;
    }

    // Check if already submitted in last 24h
    const lastSubmitted = localStorage.getItem(STORAGE_KEY);
    if (lastSubmitted) {
        const diff = Date.now() - parseInt(lastSubmitted);
        if (diff < 24 * 60 * 60 * 1000) {
            console.log('Already submitted in last 24h, skipping');
            return false;
        }
    }

    try {
        // Get current issue data
        const issueUrl = `https://api.github.com/repos/${GITHUB_REPO}/issues/${VISITOR_DATA_ISSUE}`;
        const getResp = await fetch(issueUrl, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        const issueData = await getResp.json();

        // Parse existing data
        let visitors = [];
        try {
            visitors = JSON.parse(issueData.body);
            if (!Array.isArray(visitors)) visitors = [];
        } catch (e) {
            visitors = [];
        }

        // Add new visitor
        visitors.push(location);

        // Update issue
        const patchResp = await fetch(issueUrl, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ body: JSON.stringify(visitors) })
        });

        if (patchResp.ok) {
            localStorage.setItem(STORAGE_KEY, Date.now().toString());
            return true;
        }
        return false;
    } catch (error) {
        console.error('Failed to push to GitHub:', error);
        return false;
    }
}

// Fetch all visitor data
async function fetchVisitorData() {
    if (!GITHUB_TOKEN) {
        console.warn('GitHub token not configured, returning empty data');
        return [];
    }

    try {
        const issueUrl = `https://api.github.com/repos/${GITHUB_REPO}/issues/${VISITOR_DATA_ISSUE}`;
        const response = await fetch(issueUrl, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        const data = await response.json();
        const visitors = JSON.parse(data.body);
        return Array.isArray(visitors) ? visitors : [];
    } catch (error) {
        console.error('Failed to fetch visitor data:', error);
        return [];
    }
}

// Initialize map
function initMap() {
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet not loaded');
        return;
    }

    const mapContainer = document.getElementById('visitor-map');
    if (!mapContainer) return;

    // Create map with dark theme
    const map = L.map('visitor-map', {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false
    });

    // Dark tile layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18
    }).addTo(map);

    return map;
}

// Render visitor dots on map
async function renderVisitorDots(map) {
    if (!map) return;

    const visitors = await fetchVisitorData();
    const mapContainer = document.getElementById('visitor-map');

    if (visitors.length === 0) {
        mapContainer.innerHTML += '<p class="map-loading">No visitor data yet</p>';
        return;
    }

    // Count unique locations for cluster effect
    const locationCounts = {};
    visitors.forEach(v => {
        const key = `${v.lat.toFixed(2)},${v.lon.toFixed(2)}`;
        locationCounts[key] = (locationCounts[key] || 0) + 1;
    });

    // Add dots
    visitors.forEach((v, index) => {
        if (!v.lat || !v.lon) return;

        const key = `${v.lat.toFixed(2)},${v.lon.toFixed(2)}`;
        const count = locationCounts[key];

        // Dot size based on visit count
        const radius = 3 + Math.min(count * 0.5, 6);

        L.circleMarker([v.lat, v.lon], {
            radius: radius,
            fillColor: '#4ade80',
            color: '#22c55e',
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.6
        }).addTo(map).bindPopup(`
            <div class="visitor-popup">
                <strong>${v.city}, ${v.country}</strong><br>
                Visited: ${new Date(v.timestamp).toLocaleDateString()}
            </div>
        `);
    });

    // Update visitor count
    const countEl = document.getElementById('visitor-count-number');
    if (countEl) {
        countEl.textContent = visitors.length;
    }
}

// Main initialization
(async function initVisitorMap() {
    // Get and push current visitor location
    const location = await getVisitorLocation();
    if (location) {
        pushVisitorToIssue(location);
    }

    // Initialize map
    const map = initMap();

    // Wait a bit for map to be ready, then render dots
    if (map) {
        setTimeout(() => {
            renderVisitorDots(map);
        }, 500);
    }

    // Update location text
    const locationEl = document.getElementById('visitor-location-text');
    if (location && location.city && location.country) {
        locationEl.textContent = `${location.city}, ${location.country}`;
    }
})();
