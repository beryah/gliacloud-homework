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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Scissors className="w-6 h-6" />
          Video Highlight Editor
        </h1>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-73px)]">
        {/* Upload Section */}
        {!videoData && !isProcessing && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 hover:border-gray-500 transition-colors">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg mb-4">Upload a video file to get started</p>
                <button
                  onClick={handleUploadClick}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
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
          <div className="flex items-center justify-center h-full">
            <Loader message="Processing video with AI..." size="large" />
          </div>
        )}

        {/* Main Interface */}
        {videoData && (
          <div className="flex h-full">
            {/* Left Side - Editing Area */}
            <div className="w-1/2 bg-gray-800 border-r border-gray-700">
              <TranscriptEditor />
            </div>

            {/* Right Side - Preview Area */}
            <div className="w-1/2 bg-gray-900">
              <VideoPlayer />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;