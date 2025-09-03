const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import fetch for Node.js compatibility
let fetch;
if (typeof globalThis.fetch === 'undefined') {
  fetch = require('node-fetch');
} else {
  fetch = globalThis.fetch;
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Check if dist directory exists before serving static files
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  console.log('📁 Serving static files from dist directory');
  app.use(express.static(distPath));
} else {
  console.log('⚠️  Dist directory not found - static files disabled');
}

// DeskThing communication state
let deskThingClient = null;
let ntsDataCache = null;
let metadataUpdateInterval = null;

// Initialize DeskThing communication
function initializeDeskThingCommunication() {
  console.log('🔌 Initializing DeskThing communication...');
  
  // Simulate DeskThing server instance (replace with actual DeskThing import)
  deskThingClient = {
    // Send data to client
    sendDataToClient: (data) => {
      console.log('📤 DeskThing → Client:', data);
      // In real DeskThing, this would send to the Car Thing
      // For now, we'll use WebSocket or Server-Sent Events
      broadcastToClient(data);
    },
    
    // Handle client requests
    on: (eventType, handler) => {
      console.log(`🎯 DeskThing listening for: ${eventType}`);
      // Store handler for later use
      if (!deskThingClient.handlers) deskThingClient.handlers = {};
      deskThingClient.handlers[eventType] = handler;
    }
  };
  
  // Set up NTS data fetching and auto-update
  setupNTSDataManagement();
  
  console.log('✅ DeskThing communication initialized');
}

// Set up NTS data management
function setupNTSDataManagement() {
  // Initial data fetch
  fetchNTSLiveData();
  
  // Auto-update every 2 minutes
  metadataUpdateInterval = setInterval(fetchNTSLiveData, 2 * 60 * 1000);
  
  console.log('✅ NTS data management configured (2-minute updates)');
}

// Fetch NTS live data (backend handles all external requests)
async function fetchNTSLiveData() {
  try {
    console.log('🔄 Fetching NTS live data...');
    
    const response = await fetch('https://www.nts.live/api/v2/live', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NTS-Radio-DeskThing/1.0)',
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ NTS API data received successfully');
      
      // Process and cache the data
      ntsDataCache = processNTSData(data);
      
      // Send processed data to client via DeskThing
      deskThingClient.sendDataToClient({
        type: 'nts-live-data',
        payload: {
          channels: ntsDataCache,
          timestamp: new Date().toISOString()
        }
      });
      
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
  } catch (error) {
    console.error('❌ Failed to fetch NTS data:', error);
    
    // Send error to client via DeskThing
    deskThingClient.sendDataToClient({
      type: 'nts-error',
      payload: { 
        message: 'Failed to load show data',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Process NTS API data into usable format
function processNTSData(ntsData) {
  const processed = {
    nts1: {
      status: 'Loading...',
      show: 'Live Broadcast',
      host: 'NTS Radio',
      time: '--:--',
      description: 'Loading show information...',
      artwork: null,
      lastUpdated: null
    },
    nts2: {
      status: 'Loading...',
      show: 'Live Broadcast',
      host: 'NTS Radio',
      time: '--:--',
      description: 'Loading show information...',
      artwork: null,
      lastUpdated: null
    }
  };
  
  if (ntsData.results && Array.isArray(ntsData.results)) {
    ntsData.results.forEach(channel => {
      console.log('📻 Processing channel:', channel.channel_name);
      
      if (channel.channel_name === '1') {
        const artworkUrl = channel.now?.embeds?.details?.media?.picture_medium;
        
        processed.nts1 = {
          status: 'Live Now',
          show: channel.now?.broadcast_title || 'Live Broadcast',
          host: channel.now?.embeds?.details?.name || 'NTS Radio',
          time: formatShowTime(channel.now?.start_timestamp),
          description: channel.now?.embeds?.details?.description || 'Live broadcast from NTS Radio',
          artwork: artworkUrl,
          lastUpdated: new Date()
        };
        
        console.log('✅ NTS 1 data processed:', processed.nts1);
      } else if (channel.channel_name === '2') {
        const artworkUrl = channel.now?.embeds?.details?.media?.picture_medium;
        
        processed.nts2 = {
          status: 'Live Now',
          show: channel.now?.broadcast_title || 'Live Broadcast',
          host: channel.now?.embeds?.details?.name || 'NTS Radio',
          time: formatShowTime(channel.now?.start_timestamp),
          description: channel.now?.embeds?.details?.description || 'Live broadcast from NTS Radio',
          artwork: artworkUrl,
          lastUpdated: new Date()
        };
        
        console.log('✅ NTS 2 data processed:', processed.nts2);
      }
    });
  }
  
  return processed;
}

// Format show time from timestamp
function formatShowTime(timestamp) {
  if (!timestamp) return '--:--';
  
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } catch (error) {
    console.error('❌ Error formatting time:', error);
    return '--:--';
  }
}

// Handle client requests for data
function handleClientRequest(eventType, payload) {
  console.log(`📥 Client request: ${eventType}`, payload);
  
  if (deskThingClient.handlers && deskThingClient.handlers[eventType]) {
    deskThingClient.handlers[eventType](payload);
  } else {
    console.log(`⚠️ No handler for event: ${eventType}`);
  }
}

// Handle stream playback requests
function handleStreamPlayback(payload) {
  const { channel, metadata } = payload;
  console.log(`🎵 Stream playback request: ${channel}`, metadata);
  
  const streamUrl = getStreamUrl(channel);
  
  if (streamUrl) {
    // Send stream ready confirmation to client
    deskThingClient.sendDataToClient({
      type: 'stream-ready',
      payload: { 
        channel: channel,
        url: streamUrl,
        metadata: metadata,
        timestamp: new Date().toISOString()
      }
    });
    
    console.log(`✅ Stream ready for ${channel}: ${streamUrl}`);
  } else {
    deskThingClient.sendDataToClient({
      type: 'stream-error',
      payload: { 
        channel: channel,
        message: 'Stream URL not available',
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Handle mixtape playback requests
function handleMixtapePlayback(payload) {
  const { mixtape, metadata } = payload;
  console.log(`🎵 Mixtape playback request: ${mixtape}`, metadata);
  
  const streamUrl = getMixtapeUrl(mixtape);
  
  if (streamUrl) {
    deskThingClient.sendDataToClient({
      type: 'mixtape-ready',
      payload: { 
        mixtape: mixtape,
        url: streamUrl,
        metadata: metadata,
        timestamp: new Date().toISOString()
      }
    });
    
    console.log(`✅ Mixtape ready for ${mixtape}: ${streamUrl}`);
  } else {
    deskThingClient.sendDataToClient({
      type: 'stream-error',
      payload: { 
        mixtape: mixtape,
        message: 'Mixtape URL not available',
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Get stream URL for a channel
function getStreamUrl(channelId) {
  const streamUrls = {
    nts1: 'http://stream-relay-geo.ntslive.net/stream',
    nts2: 'http://stream-relay-geo.ntslive.net/stream2'
  };
  
  return streamUrls[channelId] || null;
}

// Get mixtape URL
function getMixtapeUrl(mixtapeId) {
  const mixtapeUrls = {
    slowFocus: 'http://stream-mixtape-geo.ntslive.net/mixtape',
    fieldRecordings: 'http://stream-mixtape-geo.ntslive.net/mixtape23',
    fourToTheFloor: 'http://stream-mixtape-geo.ntslive.net/mixtape5',
    poolside: 'http://stream-mixtape-geo.ntslive.net/mixtape2',
    lowkey: 'http://stream-mixtape-geo.ntslive.net/mixtape3',
    houseTechno: 'http://stream-mixtape-geo.ntslive.net/mixtape4'
  };
  
  return mixtapeUrls[mixtapeId] || null;
}

// Set up DeskThing event handlers
function setupDeskThingHandlers() {
  // Handle client requests for live data
  deskThingClient.on('get-live-data', async (payload) => {
    console.log('📡 Client requested live data refresh');
    await fetchNTSLiveData();
  });
  
  // Handle stream playback requests
  deskThingClient.on('play-stream', handleStreamPlayback);
  
  // Handle mixtape playback requests
  deskThingClient.on('play-mixtape', handleMixtapePlayback);
  
  // Handle audio control requests
  deskThingClient.on('audio-control', (payload) => {
    const { action, channel, mixtape } = payload;
    console.log(`🎚️ Audio control: ${action}`, { channel, mixtape });
    
    // Send control confirmation to client
    deskThingClient.sendDataToClient({
      type: 'audio-control-confirmed',
      payload: { 
        action: action,
        channel: channel,
        mixtape: mixtape,
        timestamp: new Date().toISOString()
      }
    });
  });
  
  console.log('✅ DeskThing event handlers configured');
}

// Broadcast data to connected clients (WebSocket/SSE implementation)
function broadcastToClient(data) {
  // In a real DeskThing implementation, this would use DeskThing's communication layer
  // For development, we'll use a simple broadcast mechanism
  console.log('📡 Broadcasting to client:', data.type);
  
  // Store last broadcast for client polling (development fallback)
  global.lastBroadcast = {
    data: data,
    timestamp: new Date().toISOString()
  };
}

// Development fallback: HTTP endpoint for client to poll DeskThing data
app.get('/api/deskthing/last-broadcast', (req, res) => {
  if (global.lastBroadcast) {
    res.json(global.lastBroadcast);
  } else {
    res.json({ message: 'No broadcasts yet' });
  }
});

// Development fallback: HTTP endpoint for client to send requests
app.post('/api/deskthing/request', (req, res) => {
  const { eventType, payload } = req.body;
  
  if (eventType && payload) {
    handleClientRequest(eventType, payload);
    res.json({ success: true, message: 'Request processed' });
  } else {
    res.status(400).json({ error: 'Invalid request format' });
  }
});

// Development fallback: HTTP endpoint for NTS data (for testing)
app.get('/api/nts/live', async (req, res) => {
  if (ntsDataCache) {
    res.json({
      channels: ntsDataCache,
      timestamp: new Date().toISOString(),
      source: 'DeskThing cache'
    });
  } else {
    res.json({ message: 'No cached data available' });
  }
});

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    app: 'NTS Radio DeskThing App',
    deskThingReady: !!deskThingClient,
    ntsDataAvailable: !!ntsDataCache,
    distExists: fs.existsSync(distPath)
  });
});

// Serve the main app for all other routes (only if dist exists)
app.get('*', (req, res) => {
  if (fs.existsSync(distPath)) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    res.json({
      message: 'Development mode - dist directory not built yet',
      instructions: 'Run "npm run build" to create the dist directory',
      endpoints: [
        'GET /api/health - Health check',
        'GET /api/deskthing/last-broadcast - Last DeskThing broadcast',
        'POST /api/deskthing/request - Send DeskThing request',
        'GET /api/nts/live - Cached NTS data (development)'
      ]
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NTS Radio DeskThing App server running on port ${PORT}`);
  console.log(`📱 App ready for DeskThing integration`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📡 DeskThing broadcast: http://localhost:${PORT}/api/deskthing/last-broadcast`);
  console.log(`📤 DeskThing request: http://localhost:${PORT}/api/deskthing/request`);
  console.log(`📁 Dist directory: ${fs.existsSync(distPath) ? 'Found' : 'Not found'}`);
  
  // Initialize DeskThing communication after server starts
  initializeDeskThingCommunication();
  setupDeskThingHandlers();
}); 