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

# NTS Radio for DeskThing

NTS Radio app for DeskThing. It provides NTS 1, NTS 2, themed infinite mixtapes, show metadata, favorites, and playback controls for a connected Car Thing or other DeskThing client.

## Install on DeskThing

### Requirements

- DeskThing Server installed and running on the computer that will host the app
- A DeskThing client connected to that server, such as a Car Thing
- Node.js 16 or newer and npm, only needed to build the app
- Internet access to load NTS metadata and audio streams

### 1. Build the app package

From this directory (`nts-deskthing-test`), run:

```bash
npm install
chmod +x deploy.sh
./deploy.sh
```

The script builds the frontend and creates `nts-deskthing-test.zip` in the project directory. Upload this ZIP as-is; do not upload the `dist` directory itself.

### 2. Upload the package to DeskThing Server

1. Open **DeskThing Server**.
2. Open the **Apps** section.
3. Choose **Upload App** (the wording may vary slightly by DeskThing Server version).
4. Select `nts-deskthing-test.zip`.
5. Wait for the app to finish importing and installing.

### 3. Launch the app

1. Select **NTS Radio** in the DeskThing app list.
2. Start or enable the app for the connected client.
3. Select NTS 1, NTS 2, or a mixtape and press play.
4. Confirm that audio is playing through the computer audio output managed by DeskThing.

The Car Thing acts as the controller. Audio is played by the computer running DeskThing Server, not by the Car Thing itself.

## Updating the app

Build a new package and upload it again:

```bash
./deploy.sh
```

If DeskThing keeps the previous version, remove the existing NTS Radio app first, then upload the newly generated ZIP.

## Local development

Install dependencies once, then start both the API server and Vite frontend:

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`. The Node server runs on port `3000` and proxies `/api` requests to NTS. To run the pieces separately:

```bash
npm run dev:server
npm run dev:client
```

To preview a production build locally:

```bash
npm run build
npm start
```

## Troubleshooting

### The ZIP cannot be uploaded

Make sure the upload is `nts-deskthing-test.zip`, created by `./deploy.sh`. Run the command from the project root and verify that the archive contains `index.html`, `index.js`, `manifest.json`, and the PNG icons at its top level.

### The app is missing from the DeskThing list

Restart DeskThing Server, confirm that the upload completed, and check that the connected client is online. The manifest identifies the app as **NTS Radio** with app ID `nts-radio`.

### The app opens but metadata does not load

The app needs internet access to reach `https://www.nts.live`. When testing in a browser, also keep the local Node server running because it provides the `/api/nts/*` proxy endpoints.

### There is no audio

Confirm that the computer running DeskThing Server has an available audio output, the client is connected, and the NTS stream is reachable. Try another channel or mixtape, then restart the app if playback remains stuck.

## Project commands

```text
npm run dev          Start the server and Vite frontend
npm run dev:server   Start the Node API server
npm run dev:client   Start the Vite frontend
npm run build        Build the DeskThing frontend
npm run preview      Preview the Vite build
npm start            Serve the built app with Node
./deploy.sh          Build and create the DeskThing ZIP
```
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