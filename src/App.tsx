import React, { useRef } from 'react';
import { Upload, Scissors } from 'lucide-react';
import { VideoPlayer } from './components/VideoPlayer';
import { TranscriptEditor } from './components/TranscriptEditor';
import { Loader } from './components/Loader';
import { useTranscript } from './hooks/useTranscript';

const App: React.FC = () => {
  const { videoData, isProcessing, processVideo } = useTranscript();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await processVideo(file);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Scissors className="w-5 h-5 md:w-6 md:h-6" />
          <span className="hidden sm:inline">Video Highlight Editor</span>
          <span className="sm:hidden">Video Editor</span>
        </h1>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-65px)] md:h-[calc(100vh-73px)]">
        {/* Upload Section */}
        {!videoData && !isProcessing && (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center max-w-sm w-full">
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 md:p-8 hover:border-gray-500 transition-colors">
                <Upload className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-base md:text-lg mb-4">Upload a video file to get started</p>
                <button
                  onClick={handleUploadClick}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 md:px-6 md:py-2 rounded-lg transition-colors text-sm md:text-base w-full sm:w-auto"
                >
                  Choose Video File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* Processing */}
        {isProcessing && (
          <div className="flex items-center justify-center h-full p-4">
            <Loader message="Processing video with AI..." size="large" />
          </div>
        )}

        {/* Main Interface - Responsive Layout */}
        {videoData && (
          <div className="h-full flex flex-col md:flex-row">
            {/* Mobile: Preview on Top, Desktop: Left Side - Editing Area */}
            <div className="order-2 md:order-1 flex-1 md:w-1/2 bg-gray-800 border-t md:border-t-0 md:border-r border-gray-700 min-h-0">
              <TranscriptEditor />
            </div>

            {/* Mobile: Preview on Top, Desktop: Right Side - Preview Area */}
            <div className="order-1 md:order-2 h-64 sm:h-80 md:h-full md:w-1/2 bg-gray-900 border-b md:border-b-0 border-gray-700 md:border-0 flex-shrink-0">
              <VideoPlayer />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;