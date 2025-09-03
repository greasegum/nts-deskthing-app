// NTS Radio Audio Service - Enhanced Audio Streaming with betterLocalAudioThing-style functionality

class NTSAudioService {
  constructor() {
    this.audioContext = null;
    this.audioElement = null;
    this.currentStream = null;
    this.isPlaying = false;
    this.volume = 1.0;
    this.streamSource = null;
    this.analyser = null;
    this.gainNode = null;
    
    // Audio state
    this.state = {
      currentChannel: null,
      currentMixtape: null,
      streamUrl: null,
      metadata: null,
      isInitialized: false
    };
    
    // Initialize audio context
    this.initAudioContext();
  }
  
  // Initialize Web Audio API context
  async initAudioContext() {
    try {
      // Create audio context with fallback for older browsers
      if (typeof AudioContext !== 'undefined') {
        this.audioContext = new AudioContext();
      } else if (typeof webkitAudioContext !== 'undefined') {
        this.audioContext = new webkitAudioContext();
      } else {
        throw new Error('Web Audio API not supported');
      }
      
      // Resume context if suspended (required by modern browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Create audio nodes
      this.gainNode = this.audioContext.createGain();
      this.analyser = this.audioContext.createAnalyser();
      
      // Configure analyser for visualization
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      
      // Connect nodes
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      this.state.isInitialized = true;
      console.log('✅ Audio context initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize audio context:', error);
      this.state.isInitialized = false;
    }
  }
  
  // Play NTS radio stream
  async playStream(streamUrl, channelId = null, mixtapeId = null, metadata = null) {
    try {
      if (!this.state.isInitialized) {
        await this.initAudioContext();
      }
      
      // Stop any current playback
      this.stopStream();
      
      console.log(`🎵 Starting stream: ${streamUrl}`);
      
      // Create new audio element
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';
      this.audioElement.preload = 'none';
      
      // Set up event listeners
      this.setupAudioEventListeners();
      
      // Set stream URL and start loading
      this.audioElement.src = streamUrl;
      
      // Store current state
      this.state.currentChannel = channelId;
      this.state.currentMixtape = mixtapeId;
      this.state.streamUrl = streamUrl;
      this.state.metadata = metadata;
      
      // Create media source and connect to audio context
      await this.connectToAudioContext();
      
      // Start playback
      await this.audioElement.play();
      
      this.isPlaying = true;
      this.currentStream = streamUrl;
      
      console.log('✅ Stream started successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to start stream:', error);
      this.isPlaying = false;
      this.currentStream = null;
      throw error;
    }
  }
  
  // Connect audio element to Web Audio API context
  async connectToAudioContext() {
    try {
      // Wait for audio to be ready
      await new Promise((resolve, reject) => {
        this.audioElement.addEventListener('canplay', resolve, { once: true });
        this.audioElement.addEventListener('error', reject, { once: true });
        
        // Timeout after 10 seconds
        setTimeout(() => reject(new Error('Audio loading timeout')), 10000);
      });
      
      // Create media source from audio element
      this.streamSource = this.audioContext.createMediaElementSource(this.audioElement);
      
      // Connect the source to our audio processing chain
      this.streamSource.connect(this.gainNode);
      
      console.log('✅ Audio connected to Web Audio API context');
      
    } catch (error) {
      console.error('❌ Failed to connect to audio context:', error);
      throw error;
    }
  }
  
  // Set up audio event listeners
  setupAudioEventListeners() {
    if (!this.audioElement) return;
    
    // Play event
    this.audioElement.addEventListener('play', () => {
      console.log('▶️ Audio playback started');
      this.isPlaying = true;
      this.dispatchEvent('playbackStarted');
    });
    
    // Pause event
    this.audioElement.addEventListener('pause', () => {
      console.log('⏸️ Audio playback paused');
      this.isPlaying = false;
      this.dispatchEvent('playbackPaused');
    });
    
    // Ended event
    this.audioElement.addEventListener('ended', () => {
      console.log('⏹️ Audio playback ended');
      this.isPlaying = false;
      this.currentStream = null;
      this.dispatchEvent('playbackEnded');
    });
    
    // Error event
    this.audioElement.addEventListener('error', (e) => {
      console.error('❌ Audio playback error:', e);
      console.error('❌ Audio error details:', this.audioElement.error);
      this.isPlaying = false;
      this.currentStream = null;
      this.dispatchEvent('playbackError', { error: this.audioElement.error });
    });
    
    // Load events
    this.audioElement.addEventListener('loadstart', () => {
      console.log('🔄 Audio loading started');
      this.dispatchEvent('loadingStarted');
    });
    
    this.audioElement.addEventListener('canplay', () => {
      console.log('✅ Audio can start playing');
      this.dispatchEvent('canPlay');
    });
    
    this.audioElement.addEventListener('loadedmetadata', () => {
      console.log('📊 Audio metadata loaded');
      this.dispatchEvent('metadataLoaded');
    });
    
    // Progress events
    this.audioElement.addEventListener('progress', () => {
      this.dispatchEvent('loadingProgress');
    });
    
    this.audioElement.addEventListener('stalled', () => {
      console.log('⚠️ Audio loading stalled');
      this.dispatchEvent('loadingStalled');
    });
    
    this.audioElement.addEventListener('waiting', () => {
      console.log('⏳ Audio waiting for data');
      this.dispatchEvent('waitingForData');
    });
  }
  
  // Pause current stream
  pauseStream() {
    if (this.audioElement && this.isPlaying) {
      this.audioElement.pause();
      this.isPlaying = false;
      console.log('⏸️ Stream paused');
      return true;
    }
    return false;
  }
  
  // Resume current stream
  resumeStream() {
    if (this.audioElement && !this.isPlaying && this.currentStream) {
      this.audioElement.play();
      this.isPlaying = true;
      console.log('▶️ Stream resumed');
      return true;
    }
    return false;
  }
  
  // Stop current stream
  stopStream() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement.load();
      
      // Disconnect from audio context
      if (this.streamSource) {
        this.streamSource.disconnect();
        this.streamSource = null;
      }
      
      this.isPlaying = false;
      this.currentStream = null;
      this.state.currentChannel = null;
      this.state.currentMixtape = null;
      this.state.streamUrl = null;
      this.state.metadata = null;
      
      console.log('⏹️ Stream stopped');
      this.dispatchEvent('playbackStopped');
      return true;
    }
    return false;
  }
  
  // Set volume (0.0 to 1.0)
  setVolume(volume) {
    const clampedVolume = Math.max(0.0, Math.min(1.0, volume));
    this.volume = clampedVolume;
    
    if (this.gainNode) {
      this.gainNode.gain.value = clampedVolume;
    }
    
    console.log(`🔊 Volume set to: ${Math.round(clampedVolume * 100)}%`);
    this.dispatchEvent('volumeChanged', { volume: clampedVolume });
  }
  
  // Get current volume
  getVolume() {
    return this.volume;
  }
  
  // Mute/unmute
  setMuted(muted) {
    if (this.gainNode) {
      this.gainNode.gain.value = muted ? 0 : this.volume;
    }
    
    console.log(`🔇 Audio ${muted ? 'muted' : 'unmuted'}`);
    this.dispatchEvent('muteChanged', { muted });
  }
  
  // Get audio visualization data
  getVisualizationData() {
    if (!this.analyser) return null;
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    this.analyser.getByteFrequencyData(dataArray);
    
    return {
      frequencies: Array.from(dataArray),
      bufferLength,
      sampleRate: this.audioContext?.sampleRate || 44100
    };
  }
  
  // Get current playback state
  getPlaybackState() {
    if (!this.audioElement) return null;
    
    return {
      currentTime: this.audioElement.currentTime,
      duration: this.audioElement.duration,
      paused: this.audioElement.paused,
      ended: this.audioElement.ended,
      readyState: this.audioElement.readyState,
      networkState: this.audioElement.networkState,
      buffered: this.audioElement.buffered
    };
  }
  
  // Get current stream info
  getCurrentStreamInfo() {
    return {
      ...this.state,
      isPlaying: this.isPlaying,
      currentStream: this.currentStream,
      volume: this.volume
    };
  }
  
  // Event system for external listeners
  // (Event system is initialized in the main constructor)
  
  // Add event listener
  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }
  
  // Remove event listener
  off(event, callback) {
    if (this.eventListeners[event]) {
      const index = this.eventListeners[event].indexOf(callback);
      if (index > -1) {
        this.eventListeners[event].splice(index, 1);
      }
    }
  }
  
  // Dispatch event to listeners
  dispatchEvent(event, data = null) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in event listener for ${event}:`, error);
        }
      });
    }
  }
  
  // Clean up resources
  destroy() {
    this.stopStream();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.eventListeners = {};
    console.log('🧹 Audio service destroyed');
  }
}

// Export the audio service
export default NTSAudioService; 