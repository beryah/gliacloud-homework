import React from 'react';
import { Play, Pause } from 'lucide-react';
import { HighlightOverlay } from './HighlightOverlay';
import { useVideoSync } from '../hooks/useVideoSync';
import { useHighlightStore } from '../store/highlightStore';
import { formatTime } from '../utils/timeFormat';
import { ProgressBar } from './ProgressBar';

export const VideoPlayer: React.FC = () => {
  const { videoData, selectedSentences, setVideoElement } = useHighlightStore();
  const { currentTime, isPlaying, togglePlayPause } = useVideoSync();

  if (!videoData) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <p className="text-gray-400 text-sm md:text-base">No video loaded</p>
      </div>
    );
  }


  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header - Responsive */}
      <div className="p-2 md:p-4 border-b border-gray-700 flex-shrink-0">
        <h2 className="text-lg md:text-xl font-semibold">Preview</h2>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0">
        {/* Video Container - Mobile Optimized */}
        <div className="relative bg-black flex-1 flex items-center justify-center min-h-0 overflow-hidden">
          <video
            ref={setVideoElement}
            src={videoData.url}
            className="w-full h-full object-contain"
            style={{ maxHeight: '100%', maxWidth: '100%' }}
            onLoadedData={() => {
              // Video loaded, ready for playback
            }}
          />
          
          {/* Text Overlay */}
          <HighlightOverlay />
        </div>

        {/* Controls - Mobile Responsive */}
        <div className="p-2 md:p-4 bg-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="bg-blue-600 hover:bg-blue-700 p-1.5 md:p-2 rounded-full transition-colors flex-shrink-0"
              disabled={!videoData}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 md:w-6 md:h-6" />
              ) : (
                <Play className="w-4 h-4 md:w-6 md:h-6" />
              )}
            </button>
            
            {/* Progress Section */}
            <div className="flex-1 min-w-0">
              {/* Time Display */}
              <div className="text-xs md:text-sm text-gray-400 mb-1 truncate">
                <span className="hidden sm:inline">
                  {formatTime(currentTime)} / {formatTime(videoData.duration)}
                </span>
                <span className="sm:hidden">
                  {formatTime(currentTime)}
                </span>
              </div>
              
              <ProgressBar
                currentTime={currentTime}
                duration={videoData.duration}
                selectedSentences={selectedSentences}
              />
            </div>
          </div>
          
          {/* Mobile: Additional info on separate line */}
          <div className="mt-2 md:hidden">
            {selectedSentences.length > 0 && (
              <div className="text-xs text-gray-500 truncate">
                {selectedSentences.length} sentence(s) selected
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
