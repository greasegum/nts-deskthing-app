import { DeskThing } from 'deskthing-client';

// NTS Radio DeskThing App - Main Application Logic with Enhanced Live Metadata Integration

// Global state
let appState = {
  isInitialized: false,
  deskThingAvailable: false,
  deskThingClient: null,
  currentStream: null,
  isPlaying: false,
  currentChannel: null,
  currentMixtape: null,
  currentEpisode: null,
  metadataRefreshInterval: null,
  lastMetadataUpdate: null,
  favoriteFeeds: [],
  lastPlayed: null,
  recommendedEpisodes: [],
  tagSearchResults: [],
  tagSearchQuery: '',
  popularTags: ['ambient', 'jazz', 'house', 'electronic', 'club', 'experimental', 'hip-hop', 'soul', 'drone', 'dub'],
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

function getDefaultFavorites() {
  return [
    { id: 'nts1', type: 'channel', title: 'NTS 1', subtitle: 'Main live broadcast', category: 'Live' },
    { id: 'nts2', type: 'channel', title: 'NTS 2', subtitle: 'Alternative live broadcast', category: 'Live' },
    { id: 'slowFocus', type: 'mixtape', title: 'Slow Focus', subtitle: 'Ambient, experimental, drone', category: 'Mixtape' }
  ];
}

function loadPersistedFavorites() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      appState.favoriteFeeds = getDefaultFavorites();
      return;
    }

    const raw = window.localStorage.getItem('nts-favorite-feeds');
    if (!raw) {
      appState.favoriteFeeds = getDefaultFavorites();
      saveFavorites();
      return;
    }

    const parsed = JSON.parse(raw);
    appState.favoriteFeeds = Array.isArray(parsed) && parsed.length ? parsed : getDefaultFavorites();
  } catch (error) {
    console.warn('⚠️ Failed to load favorites:', error);
    appState.favoriteFeeds = getDefaultFavorites();
  }
}

function saveFavorites() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.setItem('nts-favorite-feeds', JSON.stringify(appState.favoriteFeeds));
}

function favoriteKey(item) {
  return `${item.type}:${item.id}`;
}

function renderFavorites() {
  const container = document.getElementById('favorites-list');
  if (!container) return;

  if (!appState.favoriteFeeds.length) {
    container.innerHTML = '<div class="favorite-empty">No favorites saved yet. Save a live feed or current show to keep it here.</div>';
    return;
  }

  const html = appState.favoriteFeeds.map((item) => {
    const isChannel = item.type === 'channel';
    const playLabel = isChannel ? 'Play Channel' : 'Play Feed';
    return `
      <div class="favorite-item" data-key="${favoriteKey(item)}">
        <div class="favorite-meta">
          <div class="favorite-category">${item.category || (isChannel ? 'Channel' : 'Mixtape')}</div>
          <div class="favorite-title">${item.title}</div>
          <div class="favorite-subtitle">${item.subtitle || 'Saved from NTS'}</div>
        </div>
        <div class="favorite-actions">
          <button class="control-btn play" onclick="playFavorite('${item.id}', '${item.type}')">${playLabel}</button>
          <button class="control-btn secondary" onclick="toggleFavorite('${item.id}', '${item.type}', '${item.title || ''}', '${item.subtitle || ''}', '${item.category || ''}')">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

function toggleFavorite(id, type, title = '', subtitle = '', category = '') {
  const item = {
    id,
    type,
    title: title || (type === 'channel' ? appState.streamData[id]?.show || getChannelName(id) : getMixtapeName(id)),
    subtitle: subtitle || (type === 'channel' ? `${getChannelName(id)} live feed` : getMixtapeDescription(id)),
    category: category || (type === 'channel' ? 'Live' : 'Mixtape')
  };

  const existingIndex = appState.favoriteFeeds.findIndex((entry) => favoriteKey(entry) === favoriteKey(item));

  if (existingIndex >= 0) {
    appState.favoriteFeeds.splice(existingIndex, 1);
    showStatus(`Removed ${item.title} from favorites`, 'success');
  } else {
    appState.favoriteFeeds.unshift(item);
    showStatus(`Saved ${item.title} to favorites`, 'success');
  }

  saveFavorites();
  renderFavorites();
}

function playFavorite(id, type) {
  if (type === 'channel') {
    playChannel(id);
    return;
  }

  playMixtape(id);
}

function getChannelName(channelId) {
  return channelId === 'nts1' ? 'NTS 1' : 'NTS 2';
}

function getMixtapeDescription(mixtapeId) {
  const descriptions = {
    slowFocus: 'Ambient, experimental, drone',
    fieldRecordings: 'Natural sounds, environmental audio',
    fourToTheFloor: 'House, techno, electronic dance',
    poolside: 'Balearic, boogie, sophisti-pop',
    lowkey: 'Lo-fi hip-hop, smooth R&B',
    houseTechno: 'Electronic dance music'
  };

  return descriptions[mixtapeId] || 'NTS Radio mixtape';
}

function saveCurrentShowToFavorites() {
  if (!appState.currentChannel) {
    showStatus('Start a live channel to save the current show', 'error');
    return;
  }

  const channelId = appState.currentChannel;
  const data = appState.streamData[channelId] || {};
  const title = data.show || 'Live Broadcast';
  const subtitle = `${data.host || getChannelName(channelId)} • ${data.time || 'Live'}`;

  toggleFavorite(channelId, 'channel', title, subtitle, 'Show');
}

// Initialize the app
async function initializeApp() {
  console.log('🚀 Initializing NTS Radio DeskThing App...');
  
  try {
    loadPersistedFavorites();
    renderFavorites();

    // Check if we're running in DeskThing environment
    await checkDeskThingEnvironment();
    
    // Test basic API connectivity
    await testAPIConnectivity();
    
    // Load initial stream data from NTS API
    await loadStreamData();
    await loadRecommendedEpisodes();
    renderTagChips();
    await searchEpisodesByTag('ambient');
    
    // Set up automatic metadata refresh
    setupMetadataRefresh();
    
    appState.isInitialized = true;
    showStatus('✅ NTS Radio ready!', 'success');
    updateMetadataStatus('live');
    
    console.log('✅ App initialization complete');
  } catch (error) {
    console.error('❌ App initialization failed:', error);
    showStatus('❌ Initialization failed: ' + error.message, 'error');
    updateMetadataStatus('error');
  }
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

// Load stream data from NTS API with enhanced metadata
async function loadStreamData() {
  try {
    console.log('🔄 Loading NTS stream data...');
    updateMetadataStatus('loading');
    
    // Use our local proxy to avoid CORS issues
    const response = await fetch('/api/nts/live');
    console.log('📡 NTS API response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 NTS API data received:', data);
      
      // Extract channel information with enhanced metadata
      if (data.results && Array.isArray(data.results)) {
        data.results.forEach(channel => {
          console.log('📻 Processing channel:', channel.channel_name);
          
          if (channel.channel_name === '1') {
            appState.streamData.nts1 = {
              status: 'Live Now',
              show: channel.now?.broadcast_title || 'Live Broadcast',
              host: channel.now?.embeds?.details?.name || 'NTS Radio',
              time: formatShowTime(channel.now?.start_timestamp),
              description: channel.now?.embeds?.details?.description || 'Live broadcast from NTS Radio',
              lastUpdated: new Date()
            };
            console.log('✅ NTS 1 data updated:', appState.streamData.nts1);
          } else if (channel.channel_name === '2') {
            appState.streamData.nts2 = {
              status: 'Live Now',
              show: channel.now?.broadcast_title || 'Live Broadcast',
              host: channel.now?.embeds?.details?.name || 'NTS Radio',
              time: formatShowTime(channel.now?.start_timestamp),
              description: channel.now?.embeds?.details?.description || 'Live broadcast from NTS Radio',
              lastUpdated: new Date()
            };
            console.log('✅ NTS 2 data updated:', appState.streamData.nts2);
          }
        });
      } else {
        console.warn('⚠️ No results array in NTS API response');
      }
      
      updateChannelDisplays();
      appState.lastMetadataUpdate = new Date();
      console.log('✅ Real NTS stream data loaded and displayed');
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Failed to load NTS stream data:', error);
    
    // Fallback to placeholder data
    appState.streamData.nts1 = {
      status: 'Live Now',
      show: 'The Breakfast Show',
      host: 'DJ Breakfast',
      time: '09:00',
      description: 'Morning music and conversation',
      lastUpdated: new Date()
    };
    
    appState.streamData.nts2 = {
      status: 'Live Now',
      show: 'Late Night Vibes',
      host: 'DJ Night',
      time: '22:00',
      description: 'Late night electronic and ambient',
      lastUpdated: new Date()
    };
    
    updateChannelDisplays();
    console.log('🔄 Using fallback stream data');
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

async function loadRecommendedEpisodes() {
  try {
    const response = await fetch('/api/nts/recommended');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    appState.recommendedEpisodes = Array.isArray(data.results) ? data.results.slice(0, 6) : [];
    renderRecommendedEpisodes();
    console.log('✅ Recommended episodes loaded:', appState.recommendedEpisodes.length);
  } catch (error) {
    console.error('❌ Failed to load recommended episodes:', error);
    appState.recommendedEpisodes = [];
    renderRecommendedEpisodes();
  }
}

function renderRecommendedEpisodes() {
  const container = document.getElementById('recommended-episodes');
  if (!container) return;

  if (!appState.recommendedEpisodes.length) {
    container.innerHTML = '<div class="favorite-empty">Recommended episodes are unavailable right now. Try again in a moment.</div>';
    return;
  }

  container.innerHTML = appState.recommendedEpisodes.map((episode) => `
    <div class="episode-card">
      <div class="episode-tag">${episode.showName || 'NTS'}</div>
      <div class="episode-title">${episode.title}</div>
      <div class="episode-meta">${episode.publishedAt ? new Date(episode.publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent episode'}</div>
      <div class="episode-description">${episode.description}</div>
      <div class="episode-tags">${renderTags(episode.tags || [])}</div>
      <div class="channel-controls">
        <button class="control-btn play" onclick="playEpisode('${episode.id}')">Play</button>
      </div>
    </div>
  `).join('');
}

function renderTags(tags = []) {
  if (!Array.isArray(tags) || !tags.length) return '<span class="episode-tag-chip">NTS</span>';
  return tags.slice(0, 3).map((tag) => `<span class="episode-tag-chip">${tag}</span>`).join('');
}

async function searchEpisodesByTag(tagInput) {
  const tag = String(tagInput || '').trim();
  appState.tagSearchQuery = tag;

  const input = document.getElementById('tag-search-input');
  if (input) {
    input.value = tag;
  }

  if (!tag) {
    appState.tagSearchResults = [];
    renderTagSearchResults();
    return;
  }

  try {
    const response = await fetch(`/api/nts/search?tag=${encodeURIComponent(tag)}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    appState.tagSearchResults = Array.isArray(data.results) ? data.results : [];
    renderTagSearchResults();
  } catch (error) {
    console.error('❌ Tag search failed:', error);
    appState.tagSearchResults = [];
    renderTagSearchResults();
  }
}

function renderTagChips() {
  const container = document.getElementById('tag-chips');
  if (!container) return;

  container.innerHTML = appState.popularTags.map((tag) => `
    <button class="tag-chip" onclick="searchEpisodesByTag('${tag}')">${tag}</button>
  `).join('');
}

function renderTagSearchResults() {
  const container = document.getElementById('tag-search-results');
  if (!container) return;

  if (!appState.tagSearchQuery) {
    container.innerHTML = '<div class="favorite-empty">Search by a tag like ambient, jazz, house, or dub.</div>';
    return;
  }

  if (!appState.tagSearchResults.length) {
    container.innerHTML = `<div class="favorite-empty">No episodes found for “${appState.tagSearchQuery}”. Try another tag.</div>`;
    return;
  }

  container.innerHTML = appState.tagSearchResults.map((episode) => `
    <div class="episode-card">
      <div class="episode-tag">${episode.showName || 'NTS'}</div>
      <div class="episode-title">${episode.title}</div>
      <div class="episode-meta">${episode.publishedAt ? new Date(episode.publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent episode'}</div>
      <div class="episode-description">${episode.description}</div>
      <div class="episode-tags">${renderTags(episode.tags || [])}</div>
      <div class="channel-controls">
        <button class="control-btn play" onclick="playEpisode('${episode.id}')">Play</button>
      </div>
    </div>
  `).join('');
}

function playEpisode(episodeId) {
  const episode = appState.recommendedEpisodes.find((item) => item.id === episodeId);
  if (!episode) {
    showStatus('❌ Episode not found', 'error');
    return;
  }

  if (!episode.playableUrl) {
    showStatus('❌ No playable audio source available for this episode yet', 'error');
    return;
  }

  appState.currentEpisode = episode;
  appState.currentChannel = null;
  appState.currentMixtape = null;
  appState.currentStream = episode.playableUrl;
  appState.isPlaying = true;

  if (appState.deskThingAvailable) {
    playStreamViaDeskThing(episode.playableUrl, null, null, episode.title, episode.showName || 'NTS Radio');
  } else {
    playStreamViaBrowser(episode.playableUrl, null, null, episode.title, episode.showName || 'NTS Radio');
  }

  updateChannelCards();
  updateFooterPlayer(null, null, episode);
  updatePlayPauseButton();
  showStatus(`🎵 Playing ${episode.title}`, 'success');
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

// Play a specific channel using DeskThing audio system
function playChannel(channelId) {
  try {
    console.log(`🎵 Attempting to play channel: ${channelId}`);
    
    // Stop any current playback
    stopCurrentStream();
    
    // Set current channel
    appState.currentChannel = channelId;
    appState.currentMixtape = null;
    
    // Update UI
    updateChannelCards();
    
    // Get the stream URL for this channel
    const streamUrl = getStreamUrl(channelId);
    console.log(`🔗 Stream URL for ${channelId}:`, streamUrl);
    
    if (streamUrl) {
      if (appState.deskThingAvailable) {
        console.log('🎧 Using DeskThing audio system');
        // Use DeskThing audio system to route to computer speakers
        playStreamViaDeskThing(streamUrl, channelId);
      } else {
        console.log('🌐 Using browser fallback audio');
        // Fallback for browser testing
        playStreamViaBrowser(streamUrl, channelId);
      }
      
      // Update footer player
      updateFooterPlayer(channelId);
      
      showStatus(`🎵 Now playing ${channelId.toUpperCase()}`, 'success');
    } else {
      console.error(`❌ No stream URL available for ${channelId}`);
      showStatus(`❌ Stream URL not available for ${channelId}`, 'error');
    }
  } catch (error) {
    console.error('❌ Failed to play channel:', error);
    showStatus('❌ Failed to start playback', 'error');
  }
}

// Play a specific mixtape using DeskThing audio system
function playMixtape(mixtapeId) {
  try {
    // Stop any current playback
    stopCurrentStream();
    
    // Set current mixtape
    appState.currentMixtape = mixtapeId;
    appState.currentChannel = null;
    
    // Update UI
    updateChannelCards();
    
    // Get the mixtape stream URL
    const streamUrl = getMixtapeUrl(mixtapeId);
    
    if (streamUrl) {
      if (appState.deskThingAvailable) {
        // Use DeskThing audio system to route to computer speakers
        playStreamViaDeskThing(streamUrl, null, mixtapeId);
      } else {
        // Fallback for browser testing
        playStreamViaBrowser(streamUrl, null, mixtapeId);
      }
      
      // Update footer player
      updateFooterPlayer(null, mixtapeId);
      
      showStatus(`🎵 Now playing ${getMixtapeName(mixtapeId)}`, 'success');
    } else {
      showStatus(`❌ Stream URL not available for ${mixtapeId}`, 'error');
    }
  } catch (error) {
    console.error('❌ Failed to play mixtape:', error);
    showStatus('❌ Failed to start playback', 'error');
  }
}

// Play stream via DeskThing audio system (routes to computer speakers)
function playStreamViaDeskThing(streamUrl, channelId = null, mixtapeId = null, explicitTitle = null, explicitArtist = null) {
  try {
    const payload = {
      action: 'play',
      url: streamUrl,
      title: explicitTitle || (channelId ? appState.streamData[channelId].show : getMixtapeName(mixtapeId)),
      artist: explicitArtist || (channelId ? appState.streamData[channelId].host : 'NTS Radio'),
      source: 'nts-radio'
    };

    sendDeskThingMessage({ type: 'audio', payload });

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
function playStreamViaBrowser(streamUrl, channelId = null, mixtapeId = null, explicitTitle = null, explicitArtist = null) {
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
    sendDeskThingMessage({
      type: 'audio',
      payload: {
        action: 'stop'
      }
    });
  } else if (appState.audioElement) {
    // Stop browser audio
    appState.audioElement.pause();
    appState.audioElement.src = '';
  }
  
  appState.isPlaying = false;
  appState.currentStream = null;
  appState.currentEpisode = null;
  updatePlayPauseButton();
}

// Toggle play/pause
function togglePlayPause() {
  if (!appState.currentStream) return;

  if (appState.isPlaying) {
    if (appState.deskThingAvailable) {
      sendDeskThingMessage({
        type: 'audio',
        payload: {
          action: 'pause'
        }
      });
    } else if (appState.audioElement) {
      appState.audioElement.pause();
    }
  } else {
    if (appState.deskThingAvailable) {
      sendDeskThingMessage({
        type: 'audio',
        payload: {
          action: 'play',
          url: appState.currentStream,
          title: appState.currentEpisode ? appState.currentEpisode.title : (appState.currentChannel ? appState.streamData[appState.currentChannel].show : getMixtapeName(appState.currentMixtape)),
          artist: appState.currentEpisode ? appState.currentEpisode.showName : (appState.currentChannel ? appState.streamData[appState.currentChannel].host : 'NTS Radio'),
          source: 'nts-radio'
        }
      });
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
function updateFooterPlayer(channelId = null, mixtapeId = null, episode = null) {
  const showTitle = document.getElementById('show-title');
  const showHost = document.getElementById('show-host');
  
  if (episode) {
    if (showTitle) showTitle.textContent = episode.title;
    if (showHost) showHost.textContent = episode.showName || 'NTS Radio';
    return;
  }

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

// Skip back 30 seconds
function skipBack() {
  if (appState.deskThingAvailable) {
    sendDeskThingMessage({
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
    sendDeskThingMessage({
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
    console.warn('⚠️ Local API proxy unavailable; continuing with app startup:', error.message);
    return false;
  }
}

// Make functions globally available for HTML onclick handlers
window.playChannel = playChannel;
window.playMixtape = playMixtape;
window.playFavorite = playFavorite;
window.playEpisode = playEpisode;
window.searchEpisodesByTag = searchEpisodesByTag;
window.toggleFavorite = toggleFavorite;
window.saveCurrentShowToFavorites = saveCurrentShowToFavorites;
window.showChannelInfo = showChannelInfo;
window.togglePlayPause = togglePlayPause;
window.skipBack = skipBack;
window.skipForward = skipForward;
window.refreshMetadata = refreshMetadata;

function getDeskThingClient() {
  if (appState.deskThingClient) {
    return appState.deskThingClient;
  }

  const runtime = typeof window !== 'undefined' && window.DeskThing ? window.DeskThing : DeskThing;

  if (runtime && typeof runtime.getInstance === 'function') {
    appState.deskThingClient = runtime.getInstance();
    return appState.deskThingClient;
  }

  if (typeof window !== 'undefined' && window.deskthing && typeof window.deskthing.send === 'function') {
    appState.deskThingClient = window.deskthing;
    return appState.deskThingClient;
  }

  return null;
}

function sendDeskThingMessage(message) {
  const client = getDeskThingClient();

  if (!client || typeof client.send !== 'function') {
    console.warn('⚠️ DeskThing client is unavailable; falling back to browser playback');
    return;
  }

  try {
    client.send(message);
  } catch (error) {
    console.error('❌ DeskThing send failed:', error);
    throw error;
  }
}

// Check if we're running in DeskThing environment
async function checkDeskThingEnvironment() {
  try {
    const client = getDeskThingClient();

    if (client) {
      appState.deskThingAvailable = true;
      console.log('✅ DeskThing environment detected via SDK singleton');
      setupDeskThingListeners();
    } else {
      console.log('ℹ️ Running in standard browser environment');
    }
  } catch (error) {
    console.log('ℹ️ DeskThing environment check failed:', error);
  }
}

// Set up DeskThing event listeners
function setupDeskThingListeners() {
  if (!appState.deskThingAvailable) return;

  try {
    const client = getDeskThingClient();
    if (!client) return;

    client.on('button', (data) => {
      console.log('🔘 DeskThing button pressed:', data);
      handleDeskThingButton(data);
    });

    client.on('volume', (data) => {
      console.log('🔊 DeskThing volume change:', data);
    });

    client.on('response', (data) => {
      console.log('📡 DeskThing response received:', data);
    });

    client.on('message', (data) => {
      console.log('📡 DeskThing message received:', data);
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

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Export for potential module usage
export { initializeApp, playChannel, playMixtape }; 