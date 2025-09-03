const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

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

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    app: 'NTS Radio DeskThing App',
    distExists: fs.existsSync(distPath)
  });
});

// Test endpoint for DeskThing integration
app.get('/api/test', (req, res) => {
  res.json({
    message: 'DeskThing integration test successful!',
    features: [
      'Basic API endpoints',
      'Static file serving',
      'CORS enabled',
      'Ready for DeskThing integration',
      'Audio routing support'
    ],
    distExists: fs.existsSync(distPath)
  });
});

// NTS Radio API proxy endpoint (with CORS handling)
app.get('/api/nts/live', async (req, res) => {
  try {
    console.log('🔄 Proxying NTS API request...');
    
    const response = await fetch('https://www.nts.live/api/v2/live', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NTS-Radio-DeskThing/1.0)',
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ NTS API data received successfully');
      res.json(data);
    } else {
      console.error('❌ NTS API error:', response.status, response.statusText);
      res.status(response.status).json({ 
        error: 'Failed to fetch NTS data',
        status: response.status,
        statusText: response.statusText
      });
    }
  } catch (error) {
    console.error('❌ NTS API proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to proxy NTS API request',
      message: error.message
    });
  }
});

// DeskThing audio control endpoint
app.post('/api/audio', (req, res) => {
  try {
    const { action, url, title, artist, source } = req.body;
    
    console.log(`🎵 Audio command received: ${action} - ${title} by ${artist}`);
    
    // Here you would integrate with DeskThing's audio system
    // For now, we'll log the command and return success
    
    switch (action) {
      case 'play':
        console.log(`▶️  Playing: ${url}`);
        console.log(`📻 Show: ${title} by ${artist}`);
        console.log(`🎚️  Source: ${source}`);
        break;
        
      case 'pause':
        console.log(`⏸️  Pausing audio`);
        break;
        
      case 'stop':
        console.log(`⏹️  Stopping audio`);
        break;
        
      case 'seek':
        const offset = req.body.offset;
        console.log(`⏪⏩ Seeking: ${offset > 0 ? 'forward' : 'backward'} ${Math.abs(offset)}s`);
        break;
        
      default:
        console.log(`❓ Unknown audio action: ${action}`);
    }
    
    res.json({
      success: true,
      message: `Audio command '${action}' processed`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Audio command error:', error);
    res.status(500).json({
      error: 'Failed to process audio command',
      message: error.message
    });
  }
});

// NTS stream information endpoint
app.get('/api/nts/streams', (req, res) => {
  const streams = {
    channels: {
      nts1: {
        name: 'NTS 1',
        url: 'http://stream-relay-geo.ntslive.net/stream',
        description: 'Main NTS Radio channel'
      },
      nts2: {
        name: 'NTS 2',
        url: 'http://stream-relay-geo.ntslive.net/stream2',
        description: 'Alternative NTS Radio channel'
      }
    },
    mixtapes: {
      slowFocus: {
        name: 'Slow Focus',
        url: 'http://stream-mixtape-geo.ntslive.net/mixtape',
        description: 'Ambient, experimental, drone'
      },
      fieldRecordings: {
        name: 'Field Recordings',
        url: 'http://stream-mixtape-geo.ntslive.net/mixtape23',
        description: 'Natural sounds, environmental audio'
      },
      fourToTheFloor: {
        name: '4 to the Floor',
        url: 'http://stream-mixtape-geo.ntslive.net/mixtape5',
        description: 'House, techno, electronic dance'
      },
      poolside: {
        name: 'Poolside',
        url: 'http://stream-mixtape-geo.ntslive.net/mixtape2',
        description: 'Balearic, boogie, sophisti-pop'
      },
      lowkey: {
        name: 'Low Key',
        url: 'http://stream-mixtape-geo.ntslive.net/mixtape3',
        description: 'Lo-fi hip-hop, smooth R&B'
      },
      houseTechno: {
        name: 'House & Techno',
        url: 'http://stream-mixtape-geo.ntslive.net/mixtape4',
        description: 'Electronic dance music'
      }
    }
  };
  
  res.json(streams);
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
        'GET /api/test - Test endpoint',
        'GET /api/nts/live - NTS live data',
        'GET /api/nts/streams - Available streams',
        'POST /api/audio - Audio control commands'
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
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🎵 Audio control: http://localhost:${PORT}/api/audio`);
  console.log(`📻 NTS streams: http://localhost:${PORT}/api/nts/streams`);
  console.log(`📁 Dist directory: ${fs.existsSync(distPath) ? 'Found' : 'Not found'}`);
}); 