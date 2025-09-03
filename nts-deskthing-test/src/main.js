// NTS Radio DeskThing App - Main Application Logic with Enhanced Live Metadata Integration

// Import audio service
import NTSAudioService from './audio-service.js';

// Global state
let appState = {
  isInitialized: false,
  deskThingAvailable: false,
  currentStream: null,
  isPlaying: false,
  currentChannel: null,
  currentMixtape: null,
  metadataRefreshInterval: null,
  lastMetadataUpdate: null,
  audioService: null,
  streamData: {
    nts1: { 
      status: 'Loading...', 
      show: 'Live Broadcast', 
      host: 'NTS Radio',
      time: '--:--',
      description: 'Loading show information...',
      lastUpdated: null
    },
    nts2: { 
      status: 'Loading...', 
      show: 'Live Broadcast', 
      host: 'NTS Radio',
      time: '--:--',
      description: 'Loading show information...',
      lastUpdated: null
    }
  }
};

// Initialize the app
async function initializeApp() {
  console.log('🚀 Initializing NTS Radio DeskThing App...');
  
  // DEBUG: Set up console interception first
  setupConsoleInterception();
  
  try {
    console.log('🔍 Step 1: Checking DeskThing environment...');
    // Check if we're running in DeskThing environment
    await checkDeskThingEnvironment();
    console.log('✅ Environment check complete');
    
    console.log('🔍 Step 2: Initializing audio service...');
    // Initialize the enhanced audio service
    appState.audioService = new NTSAudioService();
    
    // Set up audio service event listeners
    setupAudioServiceListeners();
    console.log('✅ Audio service initialized');
    
    console.log('🔍 Step 3: Testing API connectivity...');
    // Test basic API connectivity (only in local development)
    if (!appState.deskThingAvailable) {
      await testAPIConnectivity();
      console.log('✅ API connectivity test complete');
    } else {
      console.log('ℹ️ Skipping local API test on DeskThing');
    }
    
    console.log('🔍 Step 4: Loading initial stream data...');
    // Load initial stream data from NTS API
    await loadStreamData();
    console.log('✅ Initial stream data loaded');
    
    console.log('🔍 Step 5: Setting up metadata refresh...');
    // Set up automatic metadata refresh
    setupMetadataRefresh();
    console.log('✅ Metadata refresh configured');
    
    appState.isInitialized = true;
    showStatus('✅ NTS Radio ready!', 'success');
    updateMetadataStatus('live');
    
    console.log('✅ App initialization complete');
  } catch (error) {
    console.error('❌ App initialization failed at step:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    showStatus('❌ Initialization failed: ' + error.message, 'error');
    updateMetadataStatus('error');
    
    // Try to load fallback data even if initialization fails
    console.log('🔄 Attempting to load fallback data...');
    try {
      await loadStreamData();
    } catch (fallbackError) {
      console.error('❌ Fallback data loading also failed:', fallbackError);
    }
  }
}

// Set up audio service event listeners
function setupAudioServiceListeners() {
  if (!appState.audioService) return;
  
  // Playback events
  appState.audioService.on('playbackStarted', () => {
    console.log('🎵 Audio playback started via service');
    appState.isPlaying = true;
    updatePlayPauseButton();
    showFooterPlayer();
  });
  
  appState.audioService.on('playbackPaused', () => {
    console.log('⏸️ Audio playback paused via service');
    appState.isPlaying = false;
    updatePlayPauseButton();
  });
  
  appState.audioService.on('playbackStopped', () => {
    console.log('⏹️ Audio playback stopped via service');
    appState.isPlaying = false;
    appState.currentStream = null;
    updatePlayPauseButton();
    hideFooterPlayer();
  });
  
  appState.audioService.on('playbackError', (data) => {
    console.error('❌ Audio playback error via service:', data);
    showStatus('❌ Audio playback error: ' + (data.error?.message || 'Unknown error'), 'error');
    appState.isPlaying = false;
    updatePlayPauseButton();
  });
  
  // Loading events
  appState.audioService.on('loadingStarted', () => {
    console.log('🔄 Audio loading started via service');
    showStatus('🔄 Loading audio stream...', 'info');
  });
  
  appState.audioService.on('canPlay', () => {
    console.log('✅ Audio ready to play via service');
    showStatus('✅ Audio stream ready', 'success');
  });
  
  appState.audioService.on('waitingForData', () => {
    console.log('⏳ Audio waiting for data via service');
    showStatus('⏳ Buffering audio...', 'info');
  });
  
  console.log('✅ Audio service event listeners configured');
}

// Set up automatic metadata refresh
function setupMetadataRefresh() {
  // Refresh metadata every 2 minutes
  appState.metadataRefreshInterval = setInterval(async () => {
    console.log('🔄 Auto-refreshing metadata...');
    await loadStreamData();
  }, 2 * 60 * 1000); // 2 minutes
  
  // Update countdown every second
  setInterval(() => {
    updateMetadataInfo();
  }, 1000); // 1 second
  
  console.log('✅ Metadata auto-refresh configured (every 2 minutes)');
  console.log('✅ Metadata countdown timer configured (every 1 second)');
}

// Update metadata status indicator
function updateMetadataStatus(status) {
  const indicator = document.getElementById('status-indicator');
  const statusText = document.getElementById('status-text');
  const refreshBtn = document.getElementById('refresh-btn');
  
  if (!indicator || !statusText || !refreshBtn) return;
  
  // Remove all status classes
  indicator.classList.remove('loading', 'error');
  
  switch (status) {
    case 'live':
      indicator.classList.add('live');
      statusText.textContent = 'Live';
      refreshBtn.disabled = false;
      break;
    case 'loading':
      indicator.classList.add('loading');
      statusText.textContent = 'Updating...';
      refreshBtn.disabled = true;
      break;
    case 'error':
      indicator.classList.add('error');
      statusText.textContent = 'Error';
      refreshBtn.disabled = false;
      break;
    default:
      statusText.textContent = 'Unknown';
      refreshBtn.disabled = false;
  }
}

// Manual metadata refresh
async function refreshMetadata() {
  try {
    console.log('🔄 Manual metadata refresh requested...');
    updateMetadataStatus('loading');
    
    await loadStreamData();
    
    updateMetadataStatus('live');
    showStatus('✅ Metadata refreshed', 'success');
  } catch (error) {
    console.error('❌ Manual metadata refresh failed:', error);
    updateMetadataStatus('error');
    showStatus('❌ Metadata refresh failed', 'error');
  }
}

// Load stream data via DeskThing communication (no direct HTTP requests)
async function loadStreamData() {
  try {
    console.log('🔄 Requesting NTS stream data via DeskThing...');
    updateMetadataStatus('loading');
    
    if (appState.deskThingAvailable) {
      // Use proper DeskThing communication
      console.log('🎯 Using DeskThing communication pattern');
      
      // Request data from backend via DeskThing
      window.deskthing.send({
        type: 'get-live-data',
        payload: { refresh: true }
      });
      
      // Data will be received via DeskThing event listeners
      console.log('✅ Data request sent via DeskThing');
      
    } else {
      // Development fallback: use HTTP endpoint
      console.log('🌐 Using development HTTP fallback');
      
      const response = await fetch('/api/nts/live');
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Development data received:', data);
        
        if (data.channels) {
          // Process the data
          appState.streamData.nts1 = data.channels.nts1 || appState.streamData.nts1;
          appState.streamData.nts2 = data.channels.nts2 || appState.streamData.nts2;
          
          updateChannelDisplays();
          appState.lastMetadataUpdate = new Date();
          console.log('✅ Development data processed');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to load stream data:', error);
    
    // Use fallback placeholder data
    appState.streamData.nts1 = {
      status: 'Live Now',
      show: 'The Breakfast Show',
      host: 'DJ Breakfast',
      time: '09:00',
      description: 'Morning music and conversation',
      artwork: null,
      lastUpdated: new Date()
    };
    
    appState.streamData.nts2 = {
      status: 'Live Now',
      show: 'Late Night Vibes',
      host: 'DJ Night',
      time: '22:00',
      description: 'Late night electronic and ambient',
      artwork: null,
      lastUpdated: new Date()
    };
    
    updateChannelDisplays();
    console.log('🔄 Using fallback placeholder data');
  }
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

// Update channel display information with enhanced metadata
function updateChannelDisplays() {
  console.log('🔄 Updating channel displays...');
  console.log('📊 Current stream data:', appState.streamData);
  
  Object.keys(appState.streamData).forEach(channel => {
    const data = appState.streamData[channel];
    
    // Update status
    const statusElement = document.getElementById(`${channel}-status`);
    if (statusElement) {
      statusElement.textContent = data.status;
      console.log(`✅ Updated ${channel} status to:`, data.status);
    }
    
    // Update show title
    const showElement = document.getElementById(`${channel}-show`);
    if (showElement) {
      showElement.textContent = data.show;
      console.log(`✅ Updated ${channel} show to:`, data.show);
    }
    
    // Update host name
    const nameElement = document.getElementById(`${channel}-name`);
    if (nameElement) {
      nameElement.textContent = data.host;
      console.log(`✅ Updated ${channel} name to:`, data.host);
    }
    
    // Update show time
    const timeElement = document.getElementById(`${channel}-time`);
    if (timeElement) {
      timeElement.textContent = data.time;
      console.log(`✅ Updated ${channel} time to:`, data.time);
    }
    
    // Update description
    const descElement = document.getElementById(`${channel}-description`);
    if (descElement) {
      descElement.textContent = data.description;
      console.log(`✅ Updated ${channel} description to:`, data.description);
    }
    
    // NEW: Update artwork
    updateChannelArtwork(channel, data.artwork);
    
    // Update last updated indicator
    if (data.lastUpdated) {
      const card = document.getElementById(`${channel}-card`);
      if (card) {
        card.setAttribute('data-last-updated', data.lastUpdated.toISOString());
      }
    }
  });
  
  // Update metadata info display
  updateMetadataInfo();
  
  // Update footer player if something is playing
  if (appState.currentChannel) {
    updateFooterPlayer(appState.currentChannel);
  } else if (appState.currentMixtape) {
    updateFooterPlayer(null, appState.currentMixtape);
  }
}

// NEW: Function to update channel artwork
function updateChannelArtwork(channel, artworkUrl) {
  console.log(`🎨 updateChannelArtwork called for ${channel} with URL:`, artworkUrl);
  
  const artworkContainer = document.getElementById(`${channel}-artwork`);
  if (!artworkContainer) {
    console.warn(`⚠️ Artwork container not found for ${channel}`);
    return;
  }
  
  console.log(`✅ Found artwork container for ${channel}:`, artworkContainer);
  
  if (artworkUrl) {
    console.log(`🎨 Loading artwork for ${channel}:`, artworkUrl);
    
    // Show loading state
    artworkContainer.innerHTML = '<div class="artwork-loading">Loading Artwork...</div>';
    console.log(`🔄 Set loading state for ${channel}`);
    
    // Create and load artwork image
    const img = new Image();
    img.className = 'artwork-image';
    img.alt = 'Show Artwork';
    
    img.onload = () => {
      console.log(`✅ Artwork loaded successfully for ${channel}`);
      artworkContainer.innerHTML = '';
      artworkContainer.appendChild(img);
    };
    
    img.onerror = () => {
      console.warn(`⚠️ Failed to load artwork for ${channel}, using placeholder`);
      showArtworkPlaceholder(artworkContainer, channel);
    };
    
    // Start loading the image
    console.log(`🚀 Starting image load for ${channel}:`, artworkUrl);
    img.src = artworkUrl;
    
  } else {
    console.log(`ℹ️ No artwork available for ${channel}, using placeholder`);
    showArtworkPlaceholder(artworkContainer, channel);
  }
}

// NEW: Function to show artwork placeholder
function showArtworkPlaceholder(container, channel) {
  const channelNum = channel.replace('nts', '');
  container.innerHTML = `
    <div class="artwork-placeholder">
      <div class="placeholder-text">NTS ${channelNum}</div>
    </div>
  `;
}

// Update metadata info display
function updateMetadataInfo() {
  const lastUpdatedElement = document.getElementById('last-updated');
  const nextUpdateElement = document.getElementById('next-update');
  
  if (lastUpdatedElement && appState.lastMetadataUpdate) {
    const timeAgo = getTimeAgo(appState.lastMetadataUpdate);
    lastUpdatedElement.textContent = `Last updated: ${timeAgo}`;
  }
  
  if (nextUpdateElement) {
    if (appState.lastMetadataUpdate) {
      const nextUpdate = new Date(appState.lastMetadataUpdate.getTime() + (2 * 60 * 1000)); // 2 minutes
      const timeUntil = getTimeUntil(nextUpdate);
      nextUpdateElement.textContent = `Next update: ${timeUntil}`;
    } else {
      nextUpdateElement.textContent = 'Next update: --:--:--';
    }
  }
}

// Get time ago in human readable format
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins === 1) return '1 minute ago';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

// Get time until in countdown format
function getTimeUntil(date) {
  const now = new Date();
  const diffMs = date - now;
  
  if (diffMs <= 0) return 'Now';
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  return `${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`;
}

// Play a specific channel using DeskThing communication
async function playChannel(channelId) {
  try {
    console.log(`🎵 Attempting to play channel: ${channelId}`);
    
    // Stop any current playback
    stopCurrentStream();
    
    // Set current channel
    appState.currentChannel = channelId;
    appState.currentMixtape = null;
    
    // Update UI
    updateChannelCards();
    
    if (appState.deskThingAvailable) {
      console.log('🎧 Using DeskThing communication pattern');
      
      // Request stream playback via DeskThing
      window.deskthing.send({
        type: 'play-stream',
        payload: { 
          channel: channelId,
          metadata: appState.streamData[channelId]
        }
      });
      
      // Stream ready confirmation will come via DeskThing event
      console.log('✅ Stream playback request sent via DeskThing');
      
    } else if (appState.audioService && appState.audioService.state.isInitialized) {
      console.log('🎧 Using enhanced audio service (development)');
      
      // Get the stream URL for this channel
      const streamUrl = getStreamUrl(channelId);
      if (streamUrl) {
        // Get metadata for this channel
        const metadata = appState.streamData[channelId];
        
        // Play stream via audio service
        const success = await appState.audioService.playStream(streamUrl, channelId, null, metadata);
        
        if (success) {
          // Update footer player
          updateFooterPlayer(channelId);
          showStatus(`🎵 Now playing ${channelId.toUpperCase()}`, 'success');
        } else {
          throw new Error('Audio service failed to start playback');
        }
      } else {
        throw new Error('Stream URL not available');
      }
    } else {
      console.log('🌐 Using browser fallback audio (development)');
      // Fallback for browser testing
      const streamUrl = getStreamUrl(channelId);
      if (streamUrl) {
        playStreamViaBrowser(streamUrl, channelId);
      } else {
        throw new Error('Stream URL not available');
      }
    }
  } catch (error) {
    console.error('❌ Failed to play channel:', error);
    showStatus('❌ Failed to start playback', 'error');
  }
}

// Play a specific mixtape using DeskThing communication
async function playMixtape(mixtapeId) {
  try {
    console.log(`🎵 Attempting to play mixtape: ${mixtapeId}`);
    
    // Stop any current playback
    stopCurrentStream();
    
    // Set current mixtape
    appState.currentMixtape = mixtapeId;
    appState.currentChannel = null;
    
    // Update UI
    updateChannelCards();
    
    if (appState.deskThingAvailable) {
      console.log('🎧 Using DeskThing communication pattern for mixtape');
      
      // Request mixtape playback via DeskThing
      window.deskthing.send({
        type: 'play-mixtape',
        payload: { 
          mixtape: mixtapeId,
          metadata: {
            title: getMixtapeName(mixtapeId),
            artist: 'NTS Radio',
            description: 'Infinite mixtape stream'
          }
        }
      });
      
      // Mixtape ready confirmation will come via DeskThing event
      console.log('✅ Mixtape playback request sent via DeskThing');
      
    } else if (appState.audioService && appState.audioService.state.isInitialized) {
      console.log('🎧 Using enhanced audio service for mixtape (development)');
      
      // Get the mixtape stream URL
      const streamUrl = getMixtapeUrl(mixtapeId);
      if (streamUrl) {
        // Create metadata for mixtape
        const metadata = {
          title: getMixtapeName(mixtapeId),
          artist: 'NTS Radio',
          description: 'Infinite mixtape stream'
        };
        
        // Play stream via audio service
        const success = await appState.audioService.playStream(streamUrl, null, mixtapeId, metadata);
        
        if (success) {
          // Update footer player
          updateFooterPlayer(null, mixtapeId);
          showStatus(`🎵 Now playing ${getMixtapeName(mixtapeId)}`, 'success');
        } else {
          throw new Error('Audio service failed to start mixtape playback');
        }
      } else {
        throw new Error('Mixtape URL not available');
      }
    } else {
      console.log('🌐 Using browser fallback audio for mixtape (development)');
      // Fallback for browser testing
      const streamUrl = getMixtapeUrl(mixtapeId);
      if (streamUrl) {
        playStreamViaBrowser(streamUrl, null, mixtapeId);
      } else {
        throw new Error('Mixtape URL not available');
      }
    }
  } catch (error) {
    console.error('❌ Failed to play mixtape:', error);
    showStatus('❌ Failed to start mixtape playback', 'error');
  }
}

// Play stream via DeskThing audio system (routes to computer speakers)
function playStreamViaDeskThing(streamUrl, channelId = null, mixtapeId = null) {
  try {
    // Send audio command to DeskThing server
    // This routes the audio through your computer's audio system
    window.deskthing.send({
      type: 'audio',
      payload: {
        action: 'play',
        url: streamUrl,
        title: channelId ? appState.streamData[channelId].show : getMixtapeName(mixtapeId),
        artist: channelId ? appState.streamData[channelId].host : 'NTS Radio',
        source: 'nts-radio'
      }
    });
    
    appState.isPlaying = true;
    appState.currentStream = streamUrl;
    updatePlayPauseButton();
    showFooterPlayer();
    
    console.log('✅ Audio command sent to DeskThing');
  } catch (error) {
    console.error('❌ Failed to send audio command to DeskThing:', error);
    throw error;
  }
}

// Fallback: Play stream via browser (for testing)
function playStreamViaBrowser(streamUrl, channelId = null, mixtapeId = null) {
  try {
    console.log('🌐 Setting up browser audio fallback...');
    console.log('🔗 Stream URL:', streamUrl);
    
    // Create audio element for browser testing
    const audio = new Audio(streamUrl);
    audio.preload = 'none';
    
    // Set up event listeners
    audio.addEventListener('play', () => {
      console.log('▶️ Browser audio started playing');
      appState.isPlaying = true;
      updatePlayPauseButton();
      showFooterPlayer();
    });
    
    audio.addEventListener('pause', () => {
      console.log('⏸️ Browser audio paused');
      appState.isPlaying = false;
      updatePlayPauseButton();
    });
    
    audio.addEventListener('error', (e) => {
      console.error('❌ Browser audio error:', e);
      console.error('❌ Audio error details:', audio.error);
      showStatus('❌ Audio playback error: ' + (audio.error?.message || 'Unknown error'), 'error');
    });
    
    audio.addEventListener('loadstart', () => {
      console.log('🔄 Browser audio loading started');
    });
    
    audio.addEventListener('canplay', () => {
      console.log('✅ Browser audio can start playing');
    });
    
    // Store reference and play
    appState.audioElement = audio;
    appState.isPlaying = true;
    appState.currentStream = streamUrl;
    
    console.log('🎵 Attempting to play audio via browser...');
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('✅ Browser audio play promise resolved');
      }).catch(error => {
        console.error('❌ Browser audio play promise rejected:', error);
        showStatus('❌ Audio playback failed: ' + error.message, 'error');
      });
    }
    
    console.log('✅ Audio playing via browser (test mode)');
  } catch (error) {
    console.error('❌ Failed to play via browser:', error);
    throw error;
  }
}

// Get stream URL for a channel
function getStreamUrl(channelId) {
  console.log(`🔍 Getting stream URL for channel: ${channelId}`);
  
  // These are the CONFIRMED working NTS stream URLs from Sonos community
  const streamUrls = {
    nts1: 'http://stream-relay-geo.ntslive.net/stream',
    nts2: 'http://stream-relay-geo.ntslive.net/stream2'
  };
  
  const url = streamUrls[channelId] || null;
  console.log(`🔗 Stream URL found:`, url);
  
  return url;
}

// Get mixtape URL
function getMixtapeUrl(mixtapeId) {
  // These are the CONFIRMED working NTS mixtape stream URLs
  const mixtapeUrls = {
    slowFocus: 'http://stream-mixtape-geo.ntslive.net/mixtape',
    fieldRecordings: 'http://stream-mixtape-geo.ntslive.net/mixtape23',
    fourToTheFloor: 'http://stream-mixtape-geo.ntslive.net/mixtape5',
    // Additional confirmed mixtapes
    poolside: 'http://stream-mixtape-geo.ntslive.net/mixtape2',
    lowkey: 'http://stream-mixtape-geo.ntslive.net/mixtape3',
    houseTechno: 'http://stream-mixtape-geo.ntslive.net/mixtape4'
  };
  
  return mixtapeUrls[mixtapeId] || null;
}

// Get mixtape display name
function getMixtapeName(mixtapeId) {
  const names = {
    slowFocus: 'Slow Focus',
    fieldRecordings: 'Field Recordings',
    fourToTheFloor: '4 to the Floor',
    poolside: 'Poolside',
    lowkey: 'Low Key',
    houseTechno: 'House & Techno'
  };
  
  return names[mixtapeId] || mixtapeId;
}

// Stop current stream
function stopCurrentStream() {
  if (appState.deskThingAvailable) {
    // Send stop command via DeskThing
    window.deskthing.send({
      type: 'audio-control',
      payload: {
        action: 'stop',
        channel: appState.currentChannel,
        mixtape: appState.currentMixtape
      }
    });
    console.log('⏹️ Stop command sent via DeskThing');
  } else if (appState.audioService && appState.audioService.state.isInitialized) {
    // Use enhanced audio service (development)
    appState.audioService.stopStream();
  } else if (appState.audioElement) {
    // Stop browser audio
    appState.audioElement.pause();
    appState.audioElement.src = '';
  }
  
  appState.isPlaying = false;
  appState.currentStream = null;
  updatePlayPauseButton();
}

// Toggle play/pause
function togglePlayPause() {
  if (!appState.currentStream) return;
  
  if (appState.isPlaying) {
    if (appState.deskThingAvailable) {
      // Send pause command via DeskThing
      window.deskthing.send({
        type: 'audio-control',
        payload: {
          action: 'pause',
          channel: appState.currentChannel,
          mixtape: appState.currentMixtape
        }
      });
      console.log('⏸️ Pause command sent via DeskThing');
    } else if (appState.audioService && appState.audioService.state.isInitialized) {
      // Use enhanced audio service (development)
      appState.audioService.pauseStream();
    } else if (appState.audioElement) {
      appState.audioElement.pause();
    }
  } else {
    if (appState.deskThingAvailable) {
      // Send play command via DeskThing
      window.deskthing.send({
        type: 'audio-control',
        payload: {
          action: 'play',
          channel: appState.currentChannel,
          mixtape: appState.currentMixtape
        }
      });
      console.log('▶️ Play command sent via DeskThing');
    } else if (appState.audioService && appState.audioService.state.isInitialized) {
      // Use enhanced audio service (development)
      appState.audioService.resumeStream();
    } else if (appState.audioElement) {
      appState.audioElement.play();
    }
  }
}

// Update play/pause button text
function updatePlayPauseButton() {
  const button = document.getElementById('play-pause-btn');
  if (button) {
    button.textContent = appState.isPlaying ? 'Pause' : 'Play';
  }
}

// Update channel cards to show active state
function updateChannelCards() {
  // Remove active class from all cards
  document.querySelectorAll('.channel-card').forEach(card => {
    card.classList.remove('active');
  });
  
  // Add active class to current channel if playing
  if (appState.currentChannel && appState.isPlaying) {
    const card = document.getElementById(`${appState.currentChannel}-card`);
    if (card) {
      card.classList.add('active');
    }
  }
}

// Update footer player information
function updateFooterPlayer(channelId = null, mixtapeId = null) {
  const showTitle = document.getElementById('show-title');
  const showHost = document.getElementById('show-host');
  
  if (channelId) {
    const data = appState.streamData[channelId];
    if (showTitle) showTitle.textContent = data.show;
    if (showHost) showHost.textContent = data.host;
  } else if (mixtapeId) {
    if (showTitle) showTitle.textContent = getMixtapeName(mixtapeId);
    if (showHost) showHost.textContent = 'Infinite Mixtape';
  }
}

// Show footer player
function showFooterPlayer() {
  const footerPlayer = document.getElementById('footer-player');
  if (footerPlayer) {
    footerPlayer.style.display = 'block';
  }
}

// Hide footer player
function hideFooterPlayer() {
  const footerPlayer = document.getElementById('footer-player');
  if (footerPlayer) {
    footerPlayer.style.display = 'none';
  }
}

// Set volume using audio service
function setVolume(volume) {
  if (appState.audioService && appState.audioService.state.isInitialized) {
    appState.audioService.setVolume(volume);
  }
}

// Get current volume from audio service
function getCurrentVolume() {
  if (appState.audioService && appState.audioService.state.isInitialized) {
    return appState.audioService.getVolume();
  }
  return 1.0;
}

// Skip back 30 seconds
function skipBack() {
  if (appState.deskThingAvailable) {
    window.deskthing.send({
      type: 'audio',
      payload: {
        action: 'seek',
        offset: -30
      }
    });
  }
}

// Skip forward 30 seconds
function skipForward() {
  if (appState.deskThingAvailable) {
    window.deskthing.send({
      type: 'audio',
      payload: {
        action: 'seek',
        offset: 30
      }
    });
  }
}

// Switch between channels
function switchChannel() {
  if (appState.currentChannel === 'nts1') {
    playChannel('nts2');
  } else {
    playChannel('nts1');
  }
}

// Play next mixtape
function playNextMixtape() {
  const mixtapes = ['slowFocus', 'fieldRecordings', 'fourToTheFloor', 'poolside', 'lowkey', 'houseTechno'];
  const currentIndex = mixtapes.indexOf(appState.currentMixtape);
  const nextIndex = (currentIndex + 1) % mixtapes.length;
  playMixtape(mixtapes[nextIndex]);
}

// Play previous mixtape
function playPreviousMixtape() {
  const mixtapes = ['slowFocus', 'fieldRecordings', 'fourToTheFloor', 'poolside', 'lowkey', 'houseTechno'];
  const currentIndex = mixtapes.indexOf(appState.currentMixtape);
  const prevIndex = currentIndex === 0 ? mixtapes.length - 1 : currentIndex - 1;
  playMixtape(mixtapes[prevIndex]);
}

// Show channel information
function showChannelInfo(channelId) {
  const data = appState.streamData[channelId];
  showStatus(`${channelId.toUpperCase()}: ${data.show} with ${data.host}`, 'success');
}

// Show status message
function showStatus(message, type = 'success') {
  const container = document.getElementById('status-container');
  if (!container) return;
  
  // Remove existing status messages
  container.innerHTML = '';
  
  // Create new status message
  const statusDiv = document.createElement('div');
  statusDiv.className = `status-message ${type}`;
  statusDiv.textContent = message;
  
  container.appendChild(statusDiv);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (statusDiv.parentNode) {
      statusDiv.parentNode.removeChild(statusDiv);
    }
  }, 5000);
}

// Test API connectivity
async function testAPIConnectivity() {
  try {
    const response = await fetch('/api/health');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API connectivity test passed:', data);
      return true;
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('❌ API connectivity test failed:', error);
    throw new Error('API connectivity test failed');
  }
}

// Make functions globally available for HTML onclick handlers
window.playChannel = playChannel;
window.playMixtape = playMixtape;
window.showChannelInfo = showChannelInfo;
window.togglePlayPause = togglePlayPause;
window.skipBack = skipBack;
window.skipForward = skipForward;
window.refreshMetadata = refreshMetadata;
window.setVolume = setVolume;
window.getCurrentVolume = getCurrentVolume;

// Check if we're running in DeskThing environment
async function checkDeskThingEnvironment() {
  try {
    // Multiple ways to detect DeskThing
    const isDeskThing = (
      (typeof window !== 'undefined' && window.deskthing) ||
      (typeof window !== 'undefined' && window.location.hostname.includes('deskthing')) ||
      (typeof window !== 'undefined' && window.navigator.userAgent.includes('DeskThing'))
    );
    
    if (isDeskThing) {
      appState.deskThingAvailable = true;
      console.log('✅ DeskThing environment detected');
      console.log('🌐 Will use direct NTS API calls');
      setupDeskThingListeners();
    } else {
      appState.deskThingAvailable = false;
      console.log('ℹ️ Running in standard browser environment');
      console.log('🌐 Will use local API proxy');
    }
    
    // Log environment details for debugging
    console.log('🔍 Environment details:', {
      userAgent: window.navigator?.userAgent || 'Unknown',
      hostname: window.location?.hostname || 'Unknown',
      hasDeskThing: !!window.deskthing,
      deskThingAvailable: appState.deskThingAvailable
    });
    
  } catch (error) {
    console.log('ℹ️ DeskThing environment check failed:', error);
    appState.deskThingAvailable = false;
  }
}

// Set up DeskThing event listeners
function setupDeskThingListeners() {
  if (!appState.deskThingAvailable) return;
  
  try {
    // Listen for DeskThing button presses
    window.deskthing.on('button', (data) => {
      console.log('🔘 DeskThing button pressed:', data);
      handleDeskThingButton(data);
    });
    
    // Listen for volume changes
    window.deskthing.on('volume', (data) => {
      console.log('🔊 DeskThing volume change:', data);
      // DeskThing handles volume routing to computer
    });
    
    // Listen for NTS live data from backend
    window.deskthing.on('nts-live-data', (data) => {
      console.log('📡 Received NTS live data via DeskThing:', data);
      handleNTSLiveData(data);
    });
    
    // Listen for NTS errors from backend
    window.deskthing.on('nts-error', (data) => {
      console.error('❌ Received NTS error via DeskThing:', data);
      handleNTSError(data);
    });
    
    // Listen for stream ready confirmations
    window.deskthing.on('stream-ready', (data) => {
      console.log('🎵 Stream ready confirmation via DeskThing:', data);
      handleStreamReady(data);
    });
    
    // Listen for mixtape ready confirmations
    window.deskthing.on('mixtape-ready', (data) => {
      console.log('🎵 Mixtape ready confirmation via DeskThing:', data);
      handleMixtapeReady(data);
    });
    
    // Listen for stream errors
    window.deskthing.on('stream-error', (data) => {
      console.error('❌ Stream error via DeskThing:', data);
      handleStreamError(data);
    });
    
    // Listen for audio control confirmations
    window.deskthing.on('audio-control-confirmed', (data) => {
      console.log('🎚️ Audio control confirmed via DeskThing:', data);
      handleAudioControlConfirmed(data);
    });
    
    console.log('✅ DeskThing event listeners configured');
  } catch (error) {
    console.error('❌ Failed to set up DeskThing listeners:', error);
  }
}

// Handle DeskThing button presses
function handleDeskThingButton(data) {
  const button = data.button;
  
  switch (button) {
    case 'play':
      togglePlayPause();
      break;
    case 'pause':
      togglePlayPause();
      break;
    case 'next':
      if (appState.currentMixtape) {
        playNextMixtape();
      } else {
        switchChannel();
      }
      break;
    case 'prev':
      if (appState.currentMixtape) {
        playPreviousMixtape();
      } else {
        switchChannel();
      }
      break;
    case 'up':
      // Volume up - DeskThing handles this
      console.log('Volume up pressed');
      break;
    case 'down':
      // Volume down - DeskThing handles this
      console.log('Volume down pressed');
      break;
    default:
      console.log(`DeskThing: Unknown button pressed: ${button}`);
  }
}

// Handle NTS live data received via DeskThing
function handleNTSLiveData(data) {
  try {
    console.log('📊 Processing NTS live data from backend...');
    
    if (data.payload && data.payload.channels) {
      const channels = data.payload.channels;
      
      // Update NTS 1 data
      if (channels.nts1) {
        appState.streamData.nts1 = {
          ...appState.streamData.nts1,
          ...channels.nts1,
          lastUpdated: new Date(data.payload.timestamp)
        };
        console.log('✅ NTS 1 data updated via DeskThing');
      }
      
      // Update NTS 2 data
      if (channels.nts2) {
        appState.streamData.nts2 = {
          ...appState.streamData.nts2,
          ...channels.nts2,
          lastUpdated: new Date(data.payload.timestamp)
        };
        console.log('✅ NTS 2 data updated via DeskThing');
      }
      
      // Update UI and metadata status
      updateChannelDisplays();
      updateMetadataStatus('live');
      appState.lastMetadataUpdate = new Date(data.payload.timestamp);
      
      console.log('✅ NTS live data processed and displayed');
    } else {
      console.warn('⚠️ Invalid NTS live data format:', data);
    }
  } catch (error) {
    console.error('❌ Error processing NTS live data:', error);
    updateMetadataStatus('error');
  }
}

// Handle NTS errors received via DeskThing
function handleNTSError(data) {
  console.error('❌ NTS data error from backend:', data.payload);
  updateMetadataStatus('error');
  showStatus('❌ Failed to load show data: ' + (data.payload.message || 'Unknown error'), 'error');
}

// Handle stream ready confirmation from backend
function handleStreamReady(data) {
  try {
    const { channel, url, metadata } = data.payload;
    console.log(`🎵 Stream ready for ${channel}:`, { url, metadata });
    
    // Update current stream info
    appState.currentStream = url;
    appState.currentChannel = channel;
    appState.currentMixtape = null;
    
    // Update UI
    updateChannelCards();
    updateFooterPlayer(channel);
    
    showStatus(`🎵 Stream ready for ${channel.toUpperCase()}`, 'success');
    
  } catch (error) {
    console.error('❌ Error handling stream ready:', error);
  }
}

// Handle mixtape ready confirmation from backend
function handleMixtapeReady(data) {
  try {
    const { mixtape, url, metadata } = data.payload;
    console.log(`🎵 Mixtape ready for ${mixtape}:`, { url, metadata });
    
    // Update current stream info
    appState.currentStream = url;
    appState.currentMixtape = mixtape;
    appState.currentChannel = null;
    
    // Update UI
    updateChannelCards();
    updateFooterPlayer(null, mixtape);
    
    showStatus(`🎵 Mixtape ready: ${getMixtapeName(mixtape)}`, 'success');
    
  } catch (error) {
    console.error('❌ Error handling mixtape ready:', error);
  }
}

// Handle stream errors from backend
function handleStreamError(data) {
  const { channel, mixtape, message } = data.payload;
  const source = channel || mixtape;
  
  console.error(`❌ Stream error for ${source}:`, message);
  showStatus(`❌ Stream error: ${message}`, 'error');
}

// Handle audio control confirmations from backend
function handleAudioControlConfirmed(data) {
  const { action, channel, mixtape } = data.payload;
  const source = channel || mixtape;
  
  console.log(`🎚️ Audio control confirmed: ${action} for ${source}`);
  
  // Update UI based on action
  switch (action) {
    case 'play':
      appState.isPlaying = true;
      updatePlayPauseButton();
      showFooterPlayer();
      break;
    case 'pause':
      appState.isPlaying = false;
      updatePlayPauseButton();
      break;
    case 'stop':
      appState.isPlaying = false;
      appState.currentStream = null;
      updatePlayPauseButton();
      hideFooterPlayer();
      break;
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🎯 DOM Content Loaded event fired');
  
  // Basic DOM status update (works even if console interception fails)
  const domStatus = document.getElementById('dom-status');
  if (domStatus) {
    domStatus.textContent = 'DOM status: Content loaded';
    domStatus.className = 'debug-entry success';
  }
  
  // Try to initialize the app
  initializeApp();
});

// Also try window.onload as backup
window.addEventListener('load', function() {
  console.log('🎯 Window load event fired');
  
  const pageLoadStatus = document.getElementById('page-load-status');
  if (pageLoadStatus) {
    pageLoadStatus.textContent = 'Page loaded, JavaScript should be running';
    pageLoadStatus.className = 'debug-entry success';
  }
  
  const scriptStatus = document.getElementById('script-status');
  if (scriptStatus) {
    scriptStatus.textContent = 'Script status: Window loaded';
    scriptStatus.className = 'debug-entry info';
  }
});

// DEBUG: Console interception for live debug output
function setupConsoleInterception() {
  console.log('🔍 Setting up console interception...');
  
  // Update debug status immediately
  const scriptStatus = document.getElementById('script-status');
  if (scriptStatus) {
    scriptStatus.textContent = 'Script status: Console interception starting...';
    scriptStatus.className = 'debug-entry info';
  }
  
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info
  };
  
  // Intercept console.log
  console.log = function(...args) {
    originalConsole.log.apply(console, args);
    addDebugEntry('log', args.join(' '));
  };
  
  // Intercept console.error
  console.error = function(...args) {
    originalConsole.error.apply(console, args);
    addDebugEntry('error', args.join(' '));
  };
  
  // Intercept console.warn
  console.warn = function(...args) {
    originalConsole.warn.apply(console, args);
    addDebugEntry('warning', args.join(' '));
  };
  
  // Intercept console.info
  console.info = function(...args) {
    originalConsole.info.apply(console, args);
    addDebugEntry('info', args.join(' '));
  };
  
  console.log('🔍 Console interception set up for live debug output');
  
  // Update status after setup
  if (scriptStatus) {
    scriptStatus.textContent = 'Script status: Console interception active';
    scriptStatus.className = 'debug-entry success';
  }
}

// DEBUG: Add entry to debug console
function addDebugEntry(type, message) {
  const debugContent = document.getElementById('debug-content');
  if (!debugContent) return;
  
  const entry = document.createElement('div');
  entry.className = `debug-entry ${type}`;
  
  const timestamp = new Date().toLocaleTimeString();
  entry.textContent = `[${timestamp}] ${message}`;
  
  debugContent.appendChild(entry);
  
  // Auto-scroll to bottom
  debugContent.scrollTop = debugContent.scrollHeight;
  
  // Limit entries to prevent memory issues
  const entries = debugContent.querySelectorAll('.debug-entry');
  if (entries.length > 100) {
    entries[0].remove();
  }
}

// DEBUG: Clear debug console
function clearDebugConsole() {
  const debugContent = document.getElementById('debug-content');
  if (debugContent) {
    debugContent.innerHTML = '<div class="debug-entry">Console cleared...</div>';
  }
}

// DEBUG: Copy debug console to clipboard
function copyDebugConsole() {
  const debugContent = document.getElementById('debug-content');
  if (!debugContent) return;
  
  const text = Array.from(debugContent.querySelectorAll('.debug-entry'))
    .map(entry => entry.textContent)
    .join('\n');
  
  navigator.clipboard.writeText(text).then(() => {
    addDebugEntry('success', 'Console output copied to clipboard');
  }).catch(() => {
    addDebugEntry('error', 'Failed to copy console output');
  });
}

// Make debug functions globally available
window.clearDebugConsole = clearDebugConsole;
window.copyDebugConsole = copyDebugConsole;

// DEBUG: Manual debug entry for testing
window.addDebugEntry = addDebugEntry;

// DEBUG: Global error handler
window.addEventListener('error', function(event) {
  console.error('🚨 Global JavaScript error:', event.error);
  
  // Update debug status even if console interception fails
  const scriptStatus = document.getElementById('script-status');
  if (scriptStatus) {
    scriptStatus.textContent = 'Script status: JavaScript error occurred';
    scriptStatus.className = 'debug-entry error';
  }
  
  // Add error to debug console
  addDebugEntry('error', `Global error: ${event.error?.message || 'Unknown error'}`);
});

// DEBUG: Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
  console.error('🚨 Unhandled promise rejection:', event.reason);
  
  const scriptStatus = document.getElementById('script-status');
  if (scriptStatus) {
    scriptStatus.textContent = 'Script status: Promise rejection occurred';
    scriptStatus.className = 'debug-entry error';
  }
  
  addDebugEntry('error', `Promise rejection: ${event.reason?.message || 'Unknown rejection'}`);
});

// Export for potential module usage
export { initializeApp, playChannel, playMixtape };

// DEBUG: Immediate status check (runs when script loads)
(function() {
  console.log('🚀 Script loaded, setting up immediate status...');
  
  // Try to update status immediately
  setTimeout(function() {
    const scriptStatus = document.getElementById('script-status');
    if (scriptStatus) {
      scriptStatus.textContent = 'Script status: Script loaded and running';
      scriptStatus.className = 'debug-entry success';
    }
    
    const pageLoadStatus = document.getElementById('page-load-status');
    if (pageLoadStatus) {
      pageLoadStatus.textContent = 'Page loaded, JavaScript is running';
      pageLoadStatus.className = 'debug-entry success';
    }
    
    console.log('✅ Immediate status check complete');
  }, 100);
})(); 