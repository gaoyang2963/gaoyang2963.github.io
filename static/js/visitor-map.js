// Visitor Map Widget - stores real visitor data via GitHub Gist API
// Token is injected at build time via window.VISITOR_TOKEN

const GIST_DESCRIPTION = 'viga-lab-visitors';
const GIST_FILENAME = 'visitors.json';
const MAX_VISITORS = 500; // keep last N visitors

// Get token from build-time injection
function getToken() {
    return (typeof window.VISITOR_TOKEN !== 'undefined' && window.VISITOR_TOKEN) ? window.VISITOR_TOKEN : null;
}

// Find the Gist by description
async function findOrCreateGist(token) {
    try {
        const resp = await fetch('https://api.github.com/gists', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        const gists = await resp.json();
        const found = gists.find(g => g.description === GIST_DESCRIPTION);
        if (found) return found.id;

        // Create new gist
        const create = await fetch('https://api.github.com/gists', {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: GIST_DESCRIPTION,
                public: false,
                files: {
                    [GIST_FILENAME]: { content: JSON.stringify({ visitors: [] }) }
                }
            })
        });
        const newGist = await create.json();
        return newGist.id;
    } catch (e) {
        console.warn('Gist find/create failed:', e);
        return null;
    }
}

// Read visitor data from Gist
async function readGistData(token, gistId) {
    try {
        const resp = await fetch(`https://api.github.com/gists/${gistId}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        const gist = await resp.json();
        const content = gist.files[GIST_FILENAME]?.content;
        return content ? JSON.parse(content) : { visitors: [] };
    } catch (e) {
        return { visitors: [] };
    }
}

// Write visitor data to Gist
async function writeGistData(token, gistId, data) {
    try {
        await fetch(`https://api.github.com/gists/${gistId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: {
                    [GIST_FILENAME]: { content: JSON.stringify(data) }
                }
            })
        });
    } catch (e) {
        console.warn('Gist write failed:', e);
    }
}

// Get visitor location using free API
async function getVisitorLocation() {
    try {
        const resp = await fetch('https://ipapi.co/json/');
        const data = await resp.json();
        return {
            city: data.city || '',
            country: data.country_name || 'Unknown',
            lat: data.latitude || null,
            lon: data.longitude || null
        };
    } catch (e) {
        return { city: '', country: 'Unknown', lat: null, lon: null };
    }
}

// Initialize Leaflet map
function initMap() {
    if (typeof L === 'undefined') return null;
    const container = document.getElementById('visitor-map');
    if (!container) return null;

    const map = L.map('visitor-map', {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18
    }).addTo(map);

    return map;
}

// Add visitor dot to map
function addDot(map, lat, lon, city, country) {
    if (!map || lat == null || lon == null) return;
    L.circleMarker([lat, lon], {
        radius: 4,
        fillColor: '#4ade80',
        color: '#22c55e',
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.6
    }).addTo(map).bindPopup(`<strong>${city ? city + ', ' : ''}${country}</strong>`);
}

// Fallback: static sample dots when no token
function addSampleDots(map) {
    const samples = [
        { lat: 39.9042, lon: 116.4074, city: 'Beijing', country: 'China' },
        { lat: 31.2304, lon: 121.4737, city: 'Shanghai', country: 'China' },
        { lat: 40.7128, lon: -74.0060, city: 'New York', country: 'USA' },
        { lat: 51.5074, lon: -0.1278,  city: 'London',   country: 'UK' },
        { lat: 48.8566, lon: 2.3522,   city: 'Paris',    country: 'France' },
        { lat: 35.6762, lon: 139.6503, city: 'Tokyo',    country: 'Japan' },
        { lat: -33.8688, lon: 151.2093, city: 'Sydney',  country: 'Australia' },
        { lat: 52.5200, lon: 13.4050,  city: 'Berlin',   country: 'Germany' },
        { lat: 55.7558, lon: 37.6173,  city: 'Moscow',   country: 'Russia' },
        { lat: 1.3521,  lon: 103.8198, city: 'Singapore',country: 'Singapore' }
    ];
    samples.forEach(v => addDot(map, v.lat, v.lon, v.city, v.country));
}

// Main entry
(async function initVisitorMap() {
    const map = initMap();
    const token = getToken();
    const locationEl = document.getElementById('visitor-location-text');

    // Get this visitor's location
    const loc = await getVisitorLocation();

    // Update location text
    if (locationEl) {
        locationEl.textContent = loc.city ? `${loc.city}, ${loc.country}` : loc.country;
    }

    if (!token) {
        // No token: just show sample dots + current visitor
        addSampleDots(map);
        if (loc.lat) addDot(map, loc.lat, loc.lon, loc.city, loc.country);
        return;
    }

    // With token: use real Gist data
    const gistId = await findOrCreateGist(token);
    if (!gistId) {
        addSampleDots(map);
        return;
    }

    const data = await readGistData(token, gistId);
    const visitors = data.visitors || [];

    // Plot all existing visitors
    visitors.forEach(v => addDot(map, v.lat, v.lon, v.city, v.country));

    // Add current visitor if we have coordinates
    if (loc.lat != null) {
        addDot(map, loc.lat, loc.lon, loc.city, loc.country);

        // Avoid duplicate: check if same country+city visited in last 24h
        const now = Date.now();
        const isDuplicate = visitors.some(v =>
            v.country === loc.country && v.city === loc.city &&
            now - (v.ts || 0) < 86400000
        );

        if (!isDuplicate) {
            visitors.push({
                lat: loc.lat,
                lon: loc.lon,
                city: loc.city,
                country: loc.country,
                ts: now
            });
            // Keep last MAX_VISITORS entries
            const trimmed = visitors.slice(-MAX_VISITORS);
            writeGistData(token, gistId, { visitors: trimmed });
        }
    }
})();
