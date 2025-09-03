# 🎵 NTS Radio DeskThing App

A native DeskThing application that streams NTS Radio live channels and infinite mixtapes through your computer's audio system, controlled by your Car Thing device.

## 🌟 Features

- **Live NTS Radio Channels**: Stream NTS 1 & NTS 2 in real-time
- **Infinite Mixtapes**: 6 themed streams (Slow Focus, Field Recordings, 4 to the Floor, etc.)
- **Real-time Metadata**: Live show information from NTS Radio API
- **DeskThing Integration**: Native audio control through DeskThing system
- **Computer Audio Routing**: Audio plays through your computer speakers
- **Car Thing Control**: Physical buttons control computer audio playback

## 🏗️ Technical Architecture

### **System Overview**
```
Car Thing → DeskThing Server → NTS Radio App → Computer Audio System
```

### **Key Components**

#### **1. Frontend (React-like Vanilla JS)**
- **Location**: `src/index.html` & `src/main.js`
- **Purpose**: User interface and audio control logic
- **Features**: Channel selection, mixtape browsing, playback controls

#### **2. Backend (Node.js/Express)**
- **Location**: `server/index.js`
- **Purpose**: API proxy and static file serving
- **Features**: NTS API proxy, audio command handling, CORS management

#### **3. Audio System**
- **Primary**: DeskThing audio API (routes to computer speakers)
- **Fallback**: HTML5 Audio API (for browser testing)
- **Streams**: Direct HTTP streams from NTS Radio servers

#### **4. Build System**
- **Bundler**: Vite
- **Output**: Flat file structure for DeskThing compatibility
- **Icons**: Multiple PNG sizes (48x48 to 512x512)

## 🔧 How It Works

### **Audio Flow**
1. **User presses button** on Car Thing
2. **DeskThing detects** button press
3. **App sends audio command** to DeskThing server
4. **DeskThing routes audio** to connected computer
5. **Computer speakers play** NTS Radio stream

### **Data Flow**
1. **App loads** and initializes
2. **Fetches live data** from NTS Radio API (via proxy)
3. **Updates UI** with current show information
4. **User selects** channel or mixtape
5. **App sends stream URL** to DeskThing audio system

### **Stream URLs**
The app uses **confirmed working** NTS Radio stream endpoints:

#### **Live Channels**
- **NTS 1**: `http://stream-relay-geo.ntslive.net/stream`
- **NTS 2**: `http://stream-relay-geo.ntslive.net/stream2`

#### **Infinite Mixtapes**
- **Slow Focus**: `http://stream-mixtape-geo.ntslive.net/mixtape`
- **Field Recordings**: `http://stream-mixtape-geo.ntslive.net/mixtape23`
- **4 to the Floor**: `http://stream-mixtape-geo.ntslive.net/mixtape5`
- **Poolside**: `http://stream-mixtape-geo.ntslive.net/mixtape2`
- **Low Key**: `http://stream-mixtape-geo.ntslive.net/mixtape3`
- **House & Techno**: `http://stream-mixtape-geo.ntslive.net/mixtape4`

## 🚀 Quick Start

### **Prerequisites**
- Node.js 16+ installed
- DeskThing Server running
- Car Thing device connected

### **1. Clone & Install**
```bash
git clone <repository-url>
cd nts-deskthing-test
npm install
```

### **2. Development Mode**
```bash
# Terminal 1: Backend server
npm run dev:server

# Terminal 2: Frontend build
npm run dev:client
```

### **3. Production Build**
```bash
# Build the app
npm run build

# Deploy to DeskThing
./deploy.sh
```

### **4. Install on DeskThing**
1. Open DeskThing Server app
2. Go to **Apps > Upload App**
3. Select `nts-deskthing-test.zip`
4. Install on your DeskThing client

## 📁 Project Structure

```
nts-deskthing-test/
├── src/                    # Frontend source
│   ├── index.html         # Main app interface
│   └── main.js            # App logic & audio control
├── server/                 # Backend server
│   └── index.js           # Express server & API endpoints
├── public/                 # Static assets
│   ├── manifest.json      # DeskThing app manifest
│   ├── nts-icon.svg       # NTS logo source
│   └── nts-icon-*.png     # App icons (multiple sizes)
├── dist/                   # Build output (generated)
├── package.json            # Dependencies & scripts
├── vite.config.js          # Build configuration
├── deploy.sh               # Deployment script
├── generate-icons.js       # Icon generation utility
└── README.md               # This file
```

## 🎮 DeskThing Button Mapping

### **Playback Controls**
- **Play/Pause**: Toggle audio playback
- **Next**: Switch to next channel/mixtape
- **Previous**: Switch to previous channel/mixtape

### **Volume Controls**
- **Up**: Volume increase (handled by DeskThing)
- **Down**: Volume decrease (handled by DeskThing)

### **Audio Routing**
- **Car Thing**: Remote control only (no speakers)
- **Computer**: Audio playback destination
- **DeskThing**: Audio routing system

## 🔍 API Endpoints

### **Backend Endpoints**
- `GET /api/health` - Health check
- `GET /api/test` - Integration test
- `GET /api/nts/live` - NTS Radio live data (proxy)
- `GET /api/nts/streams` - Available stream information
- `POST /api/audio` - Audio control commands

### **External APIs**
- `https://www.nts.live/api/v2/live` - NTS Radio live show data
- Stream URLs: Direct HTTP audio streams from NTS servers

## 🛠️ Development

### **Available Scripts**
```bash
npm run dev              # Full development mode (concurrent)
npm run dev:server       # Backend server only
npm run dev:client       # Frontend development server
npm run build            # Production build
npm run preview          # Preview production build
npm start                # Production server
```

### **Building for DeskThing**
```bash
# Standard build
npm run build

# Deploy package
./deploy.sh
```

### **Icon Generation**
```bash
# Generate PNG icons from SVG
node generate-icons.js
```

## 🐛 Troubleshooting

### **Common Issues**

#### **1. Stream Metadata Not Loading**
- **Check**: Browser console for API errors
- **Verify**: Backend server is running on port 3000
- **Test**: `curl http://localhost:3000/api/nts/live`

#### **2. Audio Not Playing**
- **Check**: Browser console for audio errors
- **Verify**: Stream URLs are accessible
- **Test**: Direct stream URL in browser

#### **3. DeskThing Integration Issues**
- **Check**: `window.deskthing` availability
- **Verify**: App is installed in DeskThing Server
- **Test**: Physical Car Thing buttons

#### **4. CORS Issues**
- **Check**: Browser network tab for blocked requests
- **Verify**: Using local proxy endpoints (`/api/nts/live`)
- **Test**: Backend proxy is working

### **Debug Mode**
The app includes comprehensive logging:

```javascript
// Check browser console for:
🔄 Loading NTS stream data...
📡 NTS API response status: 200
📊 NTS API data received: [data]
✅ NTS 1 data updated: [data]
🎵 Attempting to play channel: nts1
🔗 Stream URL found: [url]
```

### **Testing Tools**
- **`test.html`**: Local testing page with debugging
- **Console logging**: Detailed operation tracking
- **Network tab**: API call monitoring
- **Audio events**: Playback state tracking

## 🔒 Security & Privacy

### **Data Handling**
- **NTS API**: Read-only access to public stream data
- **No storage**: App doesn't store personal information
- **Local only**: All processing happens on your computer

### **Stream Access**
- **Public streams**: Uses publicly available NTS Radio streams
- **No authentication**: Streams are openly accessible
- **Respectful usage**: Follows NTS Radio terms of service

## 📱 Platform Support

### **DeskThing Compatibility**
- **Windows**: ✅ Full support
- **macOS**: ✅ Full support  
- **Linux**: ✅ Full support

### **Browser Compatibility**
- **Chrome**: ✅ Full support
- **Firefox**: ✅ Full support
- **Safari**: ✅ Full support
- **Edge**: ✅ Full support

## 🚀 Deployment

### **DeskThing Package**
- **Format**: ZIP file with flat structure
- **Size**: ~8KB (efficient)
- **Contents**: HTML, JS, manifest, icons
- **Structure**: Files at root level (no subdirectories)

### **Installation Process**
1. **Build**: `npm run build`
2. **Package**: `./deploy.sh`
3. **Upload**: To DeskThing Server
4. **Install**: On DeskThing client
5. **Test**: Verify functionality

## 🤝 Contributing

### **Development Workflow**
1. **Fork** the repository
2. **Create** feature branch
3. **Make** changes with tests
4. **Submit** pull request
5. **Review** and merge

### **Code Standards**
- **JavaScript**: ES6+ with async/await
- **HTML**: Semantic markup with accessibility
- **CSS**: CSS custom properties and modern features
- **Testing**: Console logging and error handling

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **NTS Radio**: For providing the streaming service and API
- **DeskThing Community**: For platform documentation and examples
- **Sonos Community**: For confirming working stream URLs

## 📞 Support

### **Getting Help**
1. **Check**: This README and troubleshooting section
2. **Search**: GitHub issues for similar problems
3. **Create**: New issue with detailed description
4. **Include**: Console logs and error messages

### **Useful Links**
- [NTS Radio](https://www.nts.live) - Official website
- [DeskThing Documentation](https://github.com/deskthing) - Platform docs
- [Project Repository](https://github.com/your-repo) - Source code

---

**🎵 Enjoy NTS Radio on your Car Thing! 🚗✨** 