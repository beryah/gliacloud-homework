# Video Highlight Editor

A modern React-based video highlight editing tool that uses AI to help users create highlight clips from uploaded videos and add transcripts to these clips.

## 🚀 Features

- **Video Upload & Processing**: Upload video files and simulate AI processing
- **Interactive Transcript**: View and edit AI-generated transcripts with sections and timestamps
- **Highlight Selection**: Select/unselect sentences to create custom highlight reels
- **Real-time Sync**: Video playback syncs with transcript highlighting
- **Auto-scroll**: Transcript automatically scrolls to current sentence during playback
- **Timeline Visualization**: Visual timeline showing selected highlights
- **Text Overlay**: Selected transcript text displays over video during playback

## 🏗️ Project Structure

```
video-highlight-tool/
├── public/
│   └── mock/
│       └── transcript.json          # Mock AI transcript data
│
├── src/
│   ├── components/                  # Reusable UI components
│   │   ├── VideoPlayer.tsx         # Video playback controls
│   │   ├── TranscriptEditor.tsx    # Transcript display & selection
│   │   ├── Segment.tsx             # Section display component
│   │   ├── Sentence.tsx            # Individual sentence component
│   │   ├── HighlightOverlay.tsx    # Video text overlay
│   │   └── Loader.tsx              # Loading spinner
│   │
│   ├── store/                       # Zustand state management
│   │   └── highlightStore.ts        # Global state for highlights & video
│   │
│   ├── services/                    # API calls & data fetching
│   │   └── transcriptService.ts     # Transcript data service
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useTranscript.ts         # Transcript data logic
│   │   ├── useVideoSync.ts          # Video playback synchronization
│   │   └── useScrollIntoView.ts     # Auto-scroll functionality
│   │
│   ├── types/                       # TypeScript type definitions
│   │   └── index.ts
│   │
│   ├── utils/                       # Utility functions
│   │   ├── timeFormat.ts            # Time formatting utilities
│   │   └── scrollHelper.ts          # Scroll helper functions
│   │
│   ├── styles/                      # Global styles
│   │   └── index.css                # Tailwind CSS imports
│   │
│   └── App.tsx                      # Main application component
```

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **State Management**: Zustand for global state
- **Styling**: Tailwind CSS for responsive design
- **Icons**: Lucide React for modern icons
- **Build Tool**: Vite for fast development
- **File System**: Browser File System API for reading JSON files

## 📋 Technical Choices

### State Management - Zustand
- **Why**: Lightweight, TypeScript-friendly, and minimal boilerplate
- **Alternative**: Redux Toolkit (more complex for this use case)
- **Benefits**: Simple API, excellent performance, easy testing

### Component Architecture
- **Pattern**: Composition over inheritance
- **Structure**: Smart containers + dumb presentational components
- **Benefits**: Reusable, testable, maintainable

### Custom Hooks
- **useTranscript**: Handles video processing and transcript loading
- **useVideoSync**: Manages video playback state and synchronization
- **useScrollIntoView**: Automatic scrolling to highlighted content

### File Organization
- **Feature-based**: Components grouped by functionality
- **Separation of Concerns**: Clear boundaries between UI, logic, and data
- **Scalability**: Easy to add new features and maintain

## 🚦 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Modern browser with File System API support

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd gliacloud-homework

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. **Upload Video**: Click "Choose Video File" to upload a video
2. **AI Processing**: Wait for simulated AI transcript generation
3. **Select Highlights**: Click sentences to select/unselect for highlights
4. **Navigate**: Click timestamps to jump to specific times
5. **Preview**: Watch your highlight reel with text overlays

## 🔧 Configuration

### Mock Data Structure
The `public/mock/transcript.json` file contains the AI-generated transcript data:

```json
{
  "videoData": {
    "duration": 180,
    "transcript": [
      {
        "id": "section-id",
        "title": "Section Title",
        "sentences": [
          {
            "id": "sentence-id",
            "text": "Transcript text",
            "startTime": 0,
            "endTime": 3,
            "isSelected": false
          }
        ]
      }
    ]
  }
}
```

## 🧪 Development

### Key Files to Modify
- `src/store/highlightStore.ts`: Add new state management
- `src/services/transcriptService.ts`: Modify API integration
- `src/components/`: Add new UI components
- `public/mock/transcript.json`: Update sample data

### Testing
```bash
# Run type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or support, please open an issue in the repository.
