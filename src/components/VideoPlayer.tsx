import React from 'react';
import { Play, Pause } from 'lucide-react';
import { HighlightOverlay } from './HighlightOverlay';
import { useVideoSync } from '../hooks/useVideoSync';
import { useHighlightStore } from '../store/highlightStore';
import { formatTime, getTimePercentage } from '../utils/timeFormat';

export const VideoPlayer: React.FC = () => {
  const { videoData, selectedSentences, setVideoElement } = useHighlightStore();
  const { currentTime, isPlaying, togglePlayPause } = useVideoSync();

  if (!videoData) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <p className="text-gray-400">No video loaded</p>
      </div>
    );
  }

  const progressPercentage = getTimePercentage(currentTime, videoData.duration);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold">Preview</h2>
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* Video Container */}
        <div className="relative bg-black flex-1 flex items-center justify-center">
          <video
            ref={setVideoElement}
            src={videoData.url}
            className="max-w-full max-h-full"
            onLoadedData={() => {
              // Video loaded, ready for playback
            }}
          />
          
          {/* Text Overlay */}
          <HighlightOverlay />
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-800">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlayPause}
              className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full transition-colors"
              disabled={!videoData}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            
            <div className="flex-1">
              <div className="text-sm text-gray-400 mb-1">
                {formatTime(currentTime)} / {formatTime(videoData.duration)}
              </div>
              <div className="relative w-full bg-gray-700 rounded-full h-2">
                {/* Progress bar */}
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
                
                {/* Highlight markers */}
                {selectedSentences.map((sentence) => {
                  const startPercent = getTimePercentage(sentence.startTime, videoData.duration);
                  const widthPercent = getTimePercentage(
                    sentence.endTime - sentence.startTime, 
                    videoData.duration
                  );
                  
                  return (
                    <div
                      key={sentence.id}
                      className="absolute h-2 bg-green-500 rounded-full top-0"
                      style={{
                        left: `${startPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};