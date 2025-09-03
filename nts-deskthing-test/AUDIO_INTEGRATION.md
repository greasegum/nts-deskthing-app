# NTS Radio Audio Integration Guide

This document explains how to use the enhanced audio streaming functionality integrated into the NTS Radio DeskThing app.

## Overview

The app now includes a robust audio service based on the `betterLocalAudioThing` approach, which provides:

- **Enhanced Audio Streaming**: Professional-grade audio streaming with Web Audio API
- **Cross-Platform Compatibility**: Works in browsers and DeskThing environments
- **Real-time Visualization**: Audio frequency analysis and visualization
- **Robust Error Handling**: Graceful fallbacks and error recovery
- **Volume Control**: Precise volume management with mute/unmute support

## Audio Service Features

### Core Capabilities
- **Stream Management**: Play, pause, resume, and stop audio streams
- **Audio Context**: Web Audio API integration for high-quality audio processing
- **Event System**: Comprehensive event handling for playback states
- **Visualization**: Real-time frequency analysis for audio visualization
- **Volume Control**: Precise volume control (0.0 to 1.0) with mute support

### Supported Stream Types
- **NTS Radio Channels**: Live streams from NTS 1 and NTS 2
- **NTS Mixtapes**: Infinite mixtape streams (Slow Focus, Field Recordings, etc.)
- **HTTP/HTTPS Streams**: Any compatible audio stream URL
- **Local Files**: Audio files accessible via URL

## Usage Examples

### Basic Stream Playback

```javascript
// Play NTS 1 channel
await appState.audioService.playStream(
  'http://stream-relay-geo.ntslive.net/stream',
  'nts1',
  null,
  {
    title: 'NTS 1 Live',
    artist: 'NTS Radio',
    description: 'Live broadcast'
  }
);

// Play a mixtape
await appState.audioService.playStream(
  'http://stream-mixtape-geo.ntslive.net/mixtape',
  null,
  'slowFocus',
  {
    title: 'Slow Focus Mixtape',
    artist: 'NTS Radio',
    description: 'Ambient, experimental, drone'
  }
);
```

### Playback Control

```javascript
// Pause current stream
appState.audioService.pauseStream();

// Resume current stream
appState.audioService.resumeStream();

// Stop current stream
appState.audioService.stopStream();

// Toggle play/pause
if (appState.audioService.isPlaying) {
  appState.audioService.pauseStream();
} else {
  appState.audioService.resumeStream();
}
```

### Volume Control

```javascript
// Set volume (0.0 to 1.0)
appState.audioService.setVolume(0.75); // 75%

// Get current volume
const currentVolume = appState.audioService.getVolume();

// Mute/unmute
appState.audioService.setMuted(true);  // Mute
appState.audioService.setMuted(false); // Unmute
```

### Event Handling

```javascript
// Listen for playback events
appState.audioService.on('playbackStarted', () => {
  console.log('Audio playback started');
});

appState.audioService.on('playbackPaused', () => {
  console.log('Audio playback paused');
});

appState.audioService.on('playbackStopped', () => {
  console.log('Audio playback stopped');
});

appState.audioService.on('playbackError', (data) => {
  console.error('Playback error:', data.error);
});

// Loading events
appState.audioService.on('loadingStarted', () => {
  console.log('Audio loading started');
});

appState.audioService.on('canPlay', () => {
  console.log('Audio ready to play');
});

appState.audioService.on('waitingForData', () => {
  console.log('Audio buffering...');
});
```

### Audio Visualization

```javascript
// Get visualization data
const vizData = appState.audioService.getVisualizationData();

if (vizData) {
  const { frequencies, bufferLength, sampleRate } = vizData;
  
  // frequencies: Array of frequency values (0-255)
  // bufferLength: Number of frequency bins
  // sampleRate: Audio sample rate in Hz
  
  // Use this data for real-time visualization
  drawFrequencyBars(frequencies);
}
```

### Stream Information

```javascript
// Get current stream info
const streamInfo = appState.audioService.getCurrentStreamInfo();

console.log('Current stream:', {
  channel: streamInfo.currentChannel,
  mixtape: streamInfo.currentMixtape,
  url: streamInfo.streamUrl,
  metadata: streamInfo.metadata,
  isPlaying: streamInfo.isPlaying,
  volume: streamInfo.volume
});

// Get playback state
const playbackState = appState.audioService.getPlaybackState();

if (playbackState) {
  console.log('Playback state:', {
    currentTime: playbackState.currentTime,
    duration: playbackState.duration,
    paused: playbackState.paused,
    readyState: playbackState.readyState
  });
}
```

## Testing

### Audio Test Page
Use the `audio-test.html` file to test audio functionality:

1. Open `audio-test.html` in your browser
2. Click "Play NTS 1" to test live stream playback
3. Use volume controls and visualization
4. Check the debug console for detailed information

### Development Testing
```bash
# Start the development server
npm run dev:server

# Build for production
npm run build

# Start production server
npm start
```

## Integration with DeskThing

The audio service automatically detects DeskThing environments and provides fallbacks:

1. **Primary**: Enhanced audio service with Web Audio API
2. **Fallback**: DeskThing native audio system
3. **Browser**: Standard HTML5 audio fallback

## Troubleshooting

### Common Issues

**Audio Context Not Initialized**
- Ensure user has interacted with the page (browser requirement)
- Check browser console for Web Audio API support

**Stream Loading Failures**
- Verify stream URLs are accessible
- Check CORS policies for external streams
- Ensure network connectivity

**Playback Errors**
- Check audio format compatibility
- Verify stream is active and accessible
- Review browser console for detailed error messages

### Debug Information

The audio service provides comprehensive logging:
- All audio operations are logged to console
- Event system provides real-time status updates
- Error details include specific failure reasons
- Debug console shows detailed operation history

## Performance Considerations

- **Memory Management**: Audio contexts are properly cleaned up
- **Resource Cleanup**: Streams are disconnected when stopped
- **Efficient Visualization**: Frequency analysis uses optimized algorithms
- **Event Optimization**: Event listeners are managed efficiently

## Browser Compatibility

- **Modern Browsers**: Full Web Audio API support
- **Legacy Browsers**: Graceful fallback to HTML5 audio
- **Mobile Devices**: Touch-friendly controls and responsive design
- **Progressive Enhancement**: Core functionality works without advanced features

## Future Enhancements

- **Audio Effects**: Reverb, equalizer, and other audio processing
- **Stream Recording**: Capture and save audio streams
- **Advanced Visualization**: 3D audio spectrum analysis
- **Multi-Stream Support**: Simultaneous playback of multiple streams
- **Audio Metadata**: Enhanced track information and artwork display 