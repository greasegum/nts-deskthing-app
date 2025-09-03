# NTS Radio DeskThing App - Development Documentation

## Project Overview

### Vision
Create a DeskThing app that brings NTS Radio's live streams and infinite mixtapes to Spotify Car Thing devices, providing an elegant interface for music discovery and radio listening.

### Target Platform
- **Primary**: Spotify Car Thing (via DeskThing OS)
- **Secondary**: Any device running DeskThing Client

---

## Technical Research Summary

### NTS Radio Infrastructure

#### Available Streams
- **Live Channels**: NTS 1 & NTS 2 (24/7 broadcasting)
- **Infinite Mixtapes**: 16+ themed continuous streams
  - Poolside (Balearic, boogie, sophisti-pop)
  - Low Key (lo-fi hip-hop, smooth R&B)
  - House & Techno
  - Jazz variations
  - Ambient/drone
  - And 10+ more themed channels

#### API Access
- **Status**: Undocumented public API (reverse-engineered by community)
- **Base Endpoint**: `https://www.nts.live/api/v2/`
- **Live Data**: `/api/v2/live` (returns stream info and metadata)
- **Stream Format**: Direct HTTP audio streams accessible by any client

#### Limitations
- Archive shows stored on Mixcloud/SoundCloud (no direct API streaming)
- No official documentation
- Rate limiting unknown

### DeskThing Platform

#### App Structure
```
project-root/
├── src/                    # React frontend (the webpage)
│   ├── components/
│   ├── hooks/
│   └── App.jsx
├── server/                 # Node.js backend
│   └── index.ts
├── public/
│   └── manifest.json       # App configuration
└── package.json
```

#### Key Dependencies
- `deskthing-client`: Frontend communication layer
- `@deskthing/server`: Backend server utilities
- Standard React/Node.js ecosystem

#### Development Workflow
1. `npm create deskthing@latest` - Initialize project
2. `npm run dev` - Development server
3. `npm run build` - Create distributable app
4. Upload ZIP to DeskThing server interface

---

## Development Strategy

### Phase 1: Foundation (Week 1)
**Goal**: Basic streaming functionality

#### Tasks
1. **Project Setup**
   - Initialize DeskThing app template
   - Configure development environment
   - Set up basic project structure

2. **API Research**
   - Reverse-engineer NTS API endpoints
   - Map stream URL patterns
   - Document metadata structure

3. **Basic Audio Streaming**
   - Implement HTML5 audio in React
   - Test direct stream URL playback
   - Handle stream connection errors

#### Deliverables
- Working DeskThing app template
- Documented NTS API endpoints
- Basic audio player (Channel 1 only)

### Phase 2: Core Features (Week 2)
**Goal**: Full streaming interface

#### Tasks
1. **Stream Management**
   - Channel switching (NTS 1, NTS 2)
   - Infinite mixtape integration
   - Stream URL resolution service

2. **UI Components**
   - Car Thing optimized layout
   - Play/pause controls
   - Channel/mixtape selector
   - Volume integration with DeskThing

3. **Metadata Display**
   - Current show information
   - Show artwork (when available)
   - Basic now-playing display

#### Deliverables
- Multi-channel streaming
- Car Thing optimized interface
- Show metadata integration

### Phase 3: Enhancement (Week 3)
**Goal**: Polish and advanced features

#### Tasks
1. **Advanced UI**
   - Show schedule integration
   - Improved artwork handling
   - Loading states and error handling

2. **DeskThing Integration**
   - Physical button mapping
   - System audio integration
   - Notification/overlay support

3. **Performance Optimization**
   - Stream caching/buffering
   - Memory usage optimization
   - Error recovery mechanisms

#### Deliverables
- Production-ready app
- Full DeskThing integration
- Comprehensive error handling

---

## Technical Architecture

### Frontend (React)

#### Core Components
```jsx
// Main App Component
<App>
  <Header />                 // NTS branding, current time
  <StreamPlayer />           // Audio controls, artwork
  <ChannelSelector />        // Channel/mixtape switching
  <NowPlaying />            // Current show/track info
  <Controls />              // Play/pause, volume
</App>
```

#### State Management
```javascript
// Global app state
{
  currentStream: {
    type: 'live' | 'infinite',
    channel: 1 | 2,
    mixtape: 'poolside' | 'jazz' | null,
    url: 'stream-url',
    isPlaying: boolean
  },
  showData: {
    title: string,
    host: string,
    artwork: string,
    startTime: Date,
    endTime: Date
  },
  uiState: {
    loading: boolean,
    error: string | null,
    volume: number
  }
}
```

#### Key Hooks
- `useStreamPlayer()` - Audio playback management
- `useNTSApi()` - API data fetching
- `useDeskThing()` - Platform integration

### Backend (Node.js)

#### Core Services
```javascript
// NTS API Service
class NTSApiService {
  async getLiveStreams()     // Get current live stream info
  async getInfiniteMixtapes() // Get available mixtapes
  async getCurrentShow()      // Get current show metadata
  async getStreamUrl()        // Resolve stream URLs
}

// DeskThing Integration
class DeskThingService {
  handleButtonPress()         // Physical button handling
  updateSystemAudio()         // Volume/audio routing
  sendNotifications()         // Show change alerts
}
```

#### API Endpoints (Internal)
- `GET /streams` - Available streams
- `GET /current` - Current show data
- `POST /play` - Start stream playback
- `POST /stop` - Stop stream playback

---

## Testing Strategy

### Development Testing

#### Local Development with DeskThing Client Testing
DeskThing is a Chromium-based website that communicates with a Desktop APP on your computer, which means we can test our app through the DeskThing client interface before deploying to the physical Car Thing.

1. **DeskThing Development Server**
   ```bash
   npm run dev
   # Serves React app + Node backend
   # Hot reload enabled
   # Accessible through DeskThing client interface
   ```

2. **DeskThing Client Testing (Recommended)**
   - **Install DeskThing Server**: Download from [deskthing.app](https://deskthing.app)
   - **Connect Client**: DeskThing Client can run on any computing device - computer, phone, or tablet
   - **Load Development App**: Upload your development build to test in real DeskThing environment
   - **Real-time Testing**: Test all DeskThing APIs, button mappings, and system integration

3. **Browser Development Testing**
   - Test in Chrome/Firefox at Car Thing dimensions (480x800)
   - Use browser dev tools to simulate device constraints
   - Test audio playback across different browsers
   - Simulate DeskThing client communication

4. **API Testing**
   ```bash
   # Test stream URLs directly
   curl -I "https://stream-url"
   
   # Test NTS API endpoints
   curl "https://www.nts.live/api/v2/live"
   ```

#### DeskThing Client Testing Workflow
```bash
# 1. Build your development version
npm run build

# 2. Create deployment package
zip -r nts-radio-dev.zip dist/

# 3. Upload to DeskThing Server
# - Open DeskThing Server app
# - Go to Apps > Upload App
# - Select your ZIP file
# - Test on any connected DeskThing client

# 4. Iterate and test
# - Make changes to your code
# - Rebuild and re-upload
# - Test immediately in DeskThing client
```

#### Mock DeskThing Environment (For Browser Testing)
```javascript
// Create mock DeskThing client for browser testing
const mockDeskThing = {
  on: (event, callback) => {
    // Mock event handling
    if (event === 'button') {
      // Simulate button presses with keyboard
      document.addEventListener('keydown', (e) => {
        const buttonMap = {
          'Space': 'play',
          'ArrowLeft': 'prev',
          'ArrowRight': 'next',
          'ArrowUp': 'up',
          'ArrowDown': 'down'
        };
        if (buttonMap[e.code]) {
          callback({ button: buttonMap[e.code] });
        }
      });
    }
  },
  send: (data) => {
    console.log('Mock DeskThing send:', data);
  }
};
```

### Device Testing

#### DeskThing Client Testing (Primary Method)
The DeskThing is a Chromium-based website that can communicate with a Desktop APP on your computer and can run on Car Thing, phone, or any other computing device.

**Testing Workflow:**
1. **Development Build Testing**
   ```bash
   npm run build
   zip -r nts-radio-app.zip dist/
   # Upload to DeskThing Server via web interface
   ```

2. **Multi-Client Testing**
   - Test on computer (browser-based DeskThing client)
   - Test on phone/tablet (DeskThing client app)
   - Test on Car Thing (physical device)
   - The system ensures that state changes are properly synchronized across multiple clients

3. **Real DeskThing Integration Testing**
   - Stream quality and buffering
   - Button responsiveness and physical controls
   - Display clarity and readability  
   - Audio output routing
   - App backend has access to user-configurable settings, triggerable actions, and system APIs

#### Physical Car Thing Testing (Final Validation)
1. **Upload Production Build**
   ```bash
   npm run build
   # Creates /dist folder
   # ZIP contents and upload to DeskThing server
   ```

2. **Physical Device Validation**
   - Stream quality and buffering on hardware
   - Button responsiveness on physical controls
   - Display clarity and readability on Car Thing screen
   - Audio output routing to car/external speakers

3. **Performance Testing**
   - Memory usage monitoring
   - CPU utilization on limited hardware
   - Stream connection stability
   - App startup time on device

#### Testing Checklist
- [ ] All streams play without interruption
- [ ] Channel switching works smoothly
- [ ] Physical buttons control playback
- [ ] Artwork displays correctly
- [ ] Show metadata updates accurately
- [ ] Error states handled gracefully
- [ ] App survives network disconnections
- [ ] Volume integration works
- [ ] App loads quickly on startup

### Quality Assurance

#### Stream Reliability Testing
```javascript
// Automated stream testing
const streams = ['nts1', 'nts2', 'poolside', 'jazz'];

streams.forEach(async (stream) => {
  const response = await fetch(streamUrl);
  console.log(`${stream}: ${response.status}`);
  
  // Test 30-second playback
  const audio = new Audio(streamUrl);
  audio.play();
  setTimeout(() => audio.pause(), 30000);
});
```

#### Error Scenario Testing
- Network disconnection during playback
- Invalid stream URLs
- API rate limiting
- Corrupted metadata responses
- Car Thing hardware disconnection

---

## Development Tools & Environment

### Required Software
- **Node.js** (v14+)
- **npm** (v6+)
- **DeskThing Server** (latest version)
- **Car Thing device** (for final testing)

### Recommended IDE Setup
```json
// VS Code extensions
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Development Scripts
```json
{
  "scripts": {
    "dev": "Start development server",
    "build": "Build production app",
    "test": "Run test suite",
    "lint": "Code quality checks",
    "deploy": "Build and create deployment ZIP"
  }
}
```

---

## Risk Assessment & Mitigation

### Technical Risks

#### High Risk
1. **NTS API Changes**: Undocumented API could change
   - *Mitigation*: Abstract API calls, implement fallbacks
   
2. **Stream Reliability**: Audio streams could be unstable
   - *Mitigation*: Connection retry logic, multiple stream sources

#### Medium Risk
1. **Car Thing Performance**: Limited hardware resources
   - *Mitigation*: Optimize bundle size, minimize memory usage
   
2. **DeskThing API Changes**: Platform still in development
   - *Mitigation*: Stay updated with DeskThing releases

#### Low Risk
1. **Legal/Copyright Issues**: Streaming concerns
   - *Mitigation*: Only use publicly available streams, no downloading

### Timeline Risks
- **Week 1 Delay**: API research takes longer than expected
- **Week 2 Delay**: Car Thing UI optimization challenges
- **Week 3 Delay**: DeskThing integration complexity

---

## Success Metrics

### Technical Metrics
- Stream uptime > 95%
- App startup time < 3 seconds
- Memory usage < 100MB
- Zero critical bugs in production

### User Experience Metrics
- Intuitive channel switching
- Responsive physical controls
- Clear visual feedback
- Stable audio playback

### Feature Completeness
- [x] Live stream playback (NTS 1 & 2)
- [x] Infinite mixtape support
- [x] Show metadata display
- [x] Car Thing button integration
- [x] Volume control integration
- [ ] Schedule information (stretch goal)
- [ ] Favorites/bookmarking (stretch goal)

---

## Post-Launch Considerations

### Maintenance
- Monitor NTS API for changes
- Update for new DeskThing platform features
- Community feedback integration

### Potential Enhancements
- Show archive browsing (if API allows)
- Track identification integration
- Social sharing features
- Custom mixtape creation

### Community Contribution
- Open source the project
- Accept community contributions
- Maintain documentation
- Provide user support

---

## Conclusion

This development plan provides a structured approach to creating a high-quality NTS Radio app for DeskThing. The three-phase strategy balances rapid prototyping with thorough testing, ensuring both technical excellence and user satisfaction.

The key to success will be:
1. **Thorough API research** in Phase 1
2. **Car Thing optimization** in Phase 2  
3. **Comprehensive testing** throughout all phases

With NTS Radio's excellent stream infrastructure and DeskThing's growing ecosystem, this app has strong potential to become a popular addition to the platform.