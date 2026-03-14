const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const MONGODB_URI = process.env.MONGODB_URI || '';

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '.')));

// In-memory fallback storage when MongoDB is not available
let fallbackStorage = {
  locations: [],
  searchHistory: [],
  weatherSnapshots: []
};

// Use in-memory storage flag
let useFallback = false;

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    country: { type: String, default: '' },
    state: { type: String, default: 'Unknown State' },
    district: { type: String, default: 'Unknown District' },
    subdistrict: { type: String, default: 'Unknown Subdistrict' },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    isFavorite: { type: Boolean, default: false },
    lastViewed: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

locationSchema.index({ name: 1, country: 1 }, { unique: true });

const weatherSnapshotSchema = new mongoose.Schema(
  {
    locationName: { type: String, required: true },
    lat: Number,
    lon: Number,
    tempC: Number,
    humidity: Number,
    windKmh: Number,
    uv: Number,
    condition: String,
    source: { type: String, default: 'open-meteo' },
    capturedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const searchHistorySchema = new mongoose.Schema(
  {
    query: { type: String, required: true },
    selectedName: { type: String, default: '' },
    state: { type: String, default: '' },
    district: { type: String, default: '' },
    subdistrict: { type: String, default: '' },
    searchedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Location = mongoose.model('Location', locationSchema);
const WeatherSnapshot = mongoose.model('WeatherSnapshot', weatherSnapshotSchema);
const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

async function connectMongo() {
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI is not set. Running with in-memory fallback storage.');
    useFallback = true;
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 7000
    });
    useFallback = false;
    console.log('MongoDB connected');
  } catch (error) {
    console.warn('MongoDB connection failed, using in-memory fallback:', error.message);
    useFallback = true;
  }
}

function requireDb(req, res, next) {
  if (useFallback) {
    // Allow access in fallback mode but track it
    req.useFallback = true;
    return next();
  }
  if (!mongoose.connection.readyState) {
    return res.status(503).json({
      ok: false,
      message: 'Database unavailable. Set MONGODB_URI and restart server.'
    });
  }
  return next();
}

// Fallback in-memory handlers
function handleFallbackLocations(req, res, method) {
  if (method === 'get') {
    const favorite = req.query.favorite;
    let data = [...fallbackStorage.locations];
    if (favorite === 'true') {
      data = data.filter(l => l.isFavorite);
    }
    data.sort((a, b) => new Date(b.lastViewed) - new Date(a.lastViewed));
    data = data.slice(0, 50);
    return res.json({ ok: true, data, fallback: true });
  }
  return res.status(501).json({ ok: false, message: 'Operation not supported in fallback mode' });
}

function handleFallbackUpsert(req, res) {
  const payload = req.body || {};
  if (!payload.name || typeof payload.lat !== 'number' || typeof payload.lon !== 'number') {
    return res.status(400).json({ ok: false, message: 'name, lat and lon are required.' });
  }
  
  const existingIndex = fallbackStorage.locations.findIndex(
    l => l.name === payload.name && l.country === (payload.country || '')
  );
  
  const location = {
    name: payload.name,
    country: payload.country || '',
    state: payload.state || 'Unknown State',
    district: payload.district || 'Unknown District',
    subdistrict: payload.subdistrict || 'Unknown Subdistrict',
    lat: payload.lat,
    lon: payload.lon,
    isFavorite: existingIndex >= 0 ? fallbackStorage.locations[existingIndex].isFavorite : false,
    lastViewed: new Date(),
    createdAt: existingIndex >= 0 ? fallbackStorage.locations[existingIndex].createdAt : new Date(),
    updatedAt: new Date()
  };
  
  if (existingIndex >= 0) {
    fallbackStorage.locations[existingIndex] = location;
  } else {
    fallbackStorage.locations.push(location);
  }
  
  return res.json({ ok: true, data: location, fallback: true });
}

function handleFallbackSearchHistory(req, res, method) {
  if (method === 'post') {
    const payload = req.body || {};
    if (!payload.query) {
      return res.status(400).json({ ok: false, message: 'query is required.' });
    }
    
    const item = {
      _id: 'fallback-' + Date.now(),
      query: payload.query,
      selectedName: payload.selectedName || '',
      state: payload.state || '',
      district: payload.district || '',
      subdistrict: payload.subdistrict || '',
      searchedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    fallbackStorage.searchHistory.unshift(item);
    if (fallbackStorage.searchHistory.length > 100) {
      fallbackStorage.searchHistory = fallbackStorage.searchHistory.slice(0, 100);
    }
    
    return res.json({ ok: true, data: item, fallback: true });
  }
  
  if (method === 'get') {
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const data = fallbackStorage.searchHistory.slice(0, limit);
    return res.json({ ok: true, data, fallback: true });
  }
  
  return res.status(501).json({ ok: false, message: 'Operation not supported in fallback mode' });
}

function handleFallbackWeatherSnapshots(req, res, method) {
  if (method === 'post') {
    const p = req.body || {};
    if (!p.locationName) {
      return res.status(400).json({ ok: false, message: 'locationName is required.' });
    }
    
    const item = {
      _id: 'fallback-' + Date.now(),
      locationName: p.locationName,
      lat: p.lat,
      lon: p.lon,
      tempC: p.tempC,
      humidity: p.humidity,
      windKmh: p.windKmh,
      uv: p.uv,
      condition: p.condition,
      source: p.source || 'open-meteo',
      capturedAt: p.capturedAt ? new Date(p.capturedAt) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    fallbackStorage.weatherSnapshots.unshift(item);
    if (fallbackStorage.weatherSnapshots.length > 200) {
      fallbackStorage.weatherSnapshots = fallbackStorage.weatherSnapshots.slice(0, 200);
    }
    
    return res.json({ ok: true, data: item, fallback: true });
  }
  
  if (method === 'get') {
    const limit = Math.min(Number(req.query.limit || 50), 200);
    const data = fallbackStorage.weatherSnapshots.slice(0, limit);
    return res.json({ ok: true, data, fallback: true });
  }
  
  return res.status(501).json({ ok: false, message: 'Operation not supported in fallback mode' });
}

function handleFallbackDashboard(req, res) {
  const favorites = fallbackStorage.locations.filter(l => l.isFavorite);
  const data = {
    locations: fallbackStorage.locations.length,
    favorites: favorites.length,
    snapshots: fallbackStorage.weatherSnapshots.length,
    searches: fallbackStorage.searchHistory.length,
    recentSearches: fallbackStorage.searchHistory.slice(0, 5),
    latestSnapshots: fallbackStorage.weatherSnapshots.slice(0, 5)
  };
  
  return res.json({ ok: true, data, fallback: true });
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, dbReady: !useFallback, useFallback, time: new Date().toISOString() });
});

// Locations endpoints with fallback support
app.get('/api/data/locations', (req, res) => {
  if (useFallback) return handleFallbackLocations(req, res, 'get');
  
  const favorite = req.query.favorite;
  const query = favorite === 'true' ? { isFavorite: true } : {};
  Location.find(query).sort({ lastViewed: -1 }).limit(50).lean()
    .then(data => res.json({ ok: true, data }))
    .catch(err => res.status(500).json({ ok: false, message: err.message }));
});

app.post('/api/data/locations/upsert', (req, res) => {
  if (useFallback) return handleFallbackUpsert(req, res);
  
  const payload = req.body || {};
  if (!payload.name || typeof payload.lat !== 'number' || typeof payload.lon !== 'number') {
    return res.status(400).json({ ok: false, message: 'name, lat and lon are required.' });
  }

  Location.findOneAndUpdate(
    { name: payload.name, country: payload.country || '' },
    {
      $set: {
        name: payload.name,
        country: payload.country || '',
        state: payload.state || 'Unknown State',
        district: payload.district || 'Unknown District',
        subdistrict: payload.subdistrict || 'Unknown Subdistrict',
        lat: payload.lat,
        lon: payload.lon,
        lastViewed: new Date()
      },
      $setOnInsert: { isFavorite: false }
    },
    { upsert: true, new: true }
  ).lean()
    .then(updated => res.json({ ok: true, data: updated }))
    .catch(err => res.status(500).json({ ok: false, message: err.message }));
});

app.patch('/api/data/locations/favorite', (req, res) => {
  if (useFallback) {
    const { name, country = '', isFavorite } = req.body || {};
    if (!name || typeof isFavorite !== 'boolean') {
      return res.status(400).json({ ok: false, message: 'name and isFavorite are required.' });
    }
    const idx = fallbackStorage.locations.findIndex(l => l.name === name && l.country === country);
    if (idx >= 0) {
      fallbackStorage.locations[idx].isFavorite = isFavorite;
      fallbackStorage.locations[idx].updatedAt = new Date();
      return res.json({ ok: true, data: fallbackStorage.locations[idx], fallback: true });
    }
    return res.status(404).json({ ok: false, message: 'Location not found.' });
  }
  
  const { name, country = '', isFavorite } = req.body || {};
  if (!name || typeof isFavorite !== 'boolean') {
    return res.status(400).json({ ok: false, message: 'name and isFavorite are required.' });
  }

  Location.findOneAndUpdate(
    { name, country },
    { $set: { isFavorite } },
    { new: true }
  ).lean()
    .then(updated => {
      if (!updated) return res.status(404).json({ ok: false, message: 'Location not found.' });
      res.json({ ok: true, data: updated });
    })
    .catch(err => res.status(500).json({ ok: false, message: err.message }));
});

// Search history endpoints with fallback support
app.post('/api/data/search-history', (req, res) => {
  if (useFallback) return handleFallbackSearchHistory(req, res, 'post');
  
  const payload = req.body || {};
  if (!payload.query) {
    return res.status(400).json({ ok: false, message: 'query is required.' });
  }

  SearchHistory.create({
    query: payload.query,
    selectedName: payload.selectedName || '',
    state: payload.state || '',
    district: payload.district || '',
    subdistrict: payload.subdistrict || ''
  })
    .then(item => res.json({ ok: true, data: item }))
    .catch(err => res.status(500).json({ ok: false, message: err.message }));
});

app.get('/api/data/search-history', (req, res) => {
  if (useFallback) return handleFallbackSearchHistory(req, res, 'get');
  
  const limit = Math.min(Number(req.query.limit || 20), 100);
  SearchHistory.find().sort({ searchedAt: -1 }).limit(limit).lean()
    .then(data => res.json({ ok: true, data }))
    .catch(err => res.status(500).json({ ok: false, message: err.message }));
});

// Weather snapshots endpoints with fallback support
app.post('/api/data/weather-snapshots', (req, res) => {
  if (useFallback) return handleFallbackWeatherSnapshots(req, res, 'post');
  
  const p = req.body || {};
  if (!p.locationName) {
    return res.status(400).json({ ok: false, message: 'locationName is required.' });
  }

  WeatherSnapshot.create({
    locationName: p.locationName,
    lat: p.lat,
    lon: p.lon,
    tempC: p.tempC,
    humidity: p.humidity,
    windKmh: p.windKmh,
    uv: p.uv,
    condition: p.condition,
    source: p.source || 'open-meteo',
    capturedAt: p.capturedAt ? new Date(p.capturedAt) : new Date()
  })
    .then(row => res.json({ ok: true, data: row }))
    .catch(err => res.status(500).json({ ok: false, message: err.message }));
});

app.get('/api/data/weather-snapshots', (req, res) => {
  if (useFallback) return handleFallbackWeatherSnapshots(req, res, 'get');
  
  const limit = Math.min(Number(req.query.limit || 50), 200);
  WeatherSnapshot.find().sort({ capturedAt: -1 }).limit(limit).lean()
    .then(data => res.json({ ok: true, data }))
    .catch(err => res.status(500).json({ ok: false, message: err.message }));
});

app.get('/api/data/dashboard', (req, res) => {
  if (useFallback) return handleFallbackDashboard(req, res);
  
  Promise.all([
    Location.countDocuments(),
    Location.countDocuments({ isFavorite: true }),
    WeatherSnapshot.countDocuments(),
    SearchHistory.countDocuments(),
    SearchHistory.find().sort({ searchedAt: -1 }).limit(5).lean(),
    WeatherSnapshot.find().sort({ capturedAt: -1 }).limit(5).lean()
  ])
    .then(([locations, favorites, snapshots, searches, recentSearches, latestSnapshots]) => {
      res.json({
        ok: true,
        data: {
          locations,
          favorites,
          snapshots,
          searches,
          recentSearches,
          latestSnapshots
        }
      });
    })
    .catch(err => res.status(500).json({ ok: false, message: err.message }));
});

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

connectMongo().finally(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
