import React from 'react';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { HighlightOverlay } from './HighlightOverlay';
import { useVideoSync } from '../hooks/useVideoSync';
import { useHighlightStore } from '../store/highlightStore';
import { formatTime, getTimePercentage } from '../utils/timeFormat';

export const VideoPlayer: React.FC = () => {
  const { 
    videoData, 
    selectedSentences, 
    setVideoElement
  } = useHighlightStore();
  
  const { 
    currentTime, 
    isPlaying, 
    togglePlayPause,
    seekToSentence,
    getCurrentSentenceInfo,
    currentSentenceIndex
  } = useVideoSync();

  if (!videoData) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <p className="text-gray-400">No video loaded</p>
      </div>
    );
  }

  const progressPercentage = getTimePercentage(currentTime, videoData.duration);
  const currentSentenceInfo = getCurrentSentenceInfo();

  const handlePreviousSentence = () => {
    if (currentSentenceIndex > 0) {
      seekToSentence(currentSentenceIndex - 1);
    }
  };

  const handleNextSentence = () => {
    if (currentSentenceIndex < selectedSentences.length - 1) {
      seekToSentence(currentSentenceIndex + 1);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold">Preview</h2>
        
        {/* Selected sentences info */}
        {selectedSentences.length > 0 && (
          <div className="mt-2 text-sm text-gray-400">
            <div className="flex items-center justify-between">
              <span>
                {selectedSentences.length} sentence(s) selected
                {currentSentenceInfo && isPlaying && (
                  <span className="text-blue-400 ml-2">
                    Playing: {currentSentenceInfo.current}/{currentSentenceInfo.total}
                  </span>
                )}
              </span>
              {currentSentenceInfo?.sentence && (
                <span className="text-xs text-gray-500 max-w-md truncate">
                  "{currentSentenceInfo.sentence.text}"
                </span>
              )}
            </div>
          </div>
        )}
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
            {/* Previous Sentence Button (only when sentences are selected) */}
            {selectedSentences.length > 0 && (
              <button
                onClick={handlePreviousSentence}
                className={`p-2 rounded-full transition-colors ${
                  currentSentenceIndex > 0
                    ? 'bg-gray-600 hover:bg-gray-500'
                    : 'bg-gray-700 cursor-not-allowed opacity-50'
                }`}
                disabled={currentSentenceIndex <= 0}
                title="Previous sentence"
              >
                <SkipBack className="w-4 h-4" />
              </button>
            )}
            
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full transition-colors"
              title={selectedSentences.length > 0 ? 'Play selected sentences' : 'Play video'}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            
            {/* Next Sentence Button (only when sentences are selected) */}
            {selectedSentences.length > 0 && (
              <button
                onClick={handleNextSentence}
                className={`p-2 rounded-full transition-colors ${
                  currentSentenceIndex < selectedSentences.length - 1
                    ? 'bg-gray-600 hover:bg-gray-500'
                    : 'bg-gray-700 cursor-not-allowed opacity-50'
                }`}
                disabled={currentSentenceIndex >= selectedSentences.length - 1}
                title="Next sentence"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            )}
            
            <div className="flex-1">
              <div className="text-sm text-gray-400 mb-1">
                {formatTime(currentTime)} / {formatTime(videoData.duration)}
                {selectedSentences.length > 0 && currentSentenceInfo && (
                  <span className="ml-4 text-blue-400">
                    Sentence {currentSentenceInfo.current} of {currentSentenceInfo.total}
                  </span>
                )}
              </div>
              
              <div className="relative w-full bg-gray-700 rounded-full h-2">
                {/* Progress bar */}
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
                
                {/* Highlight markers */}
                {selectedSentences.map((sentence, index) => {
                  const startPercent = getTimePercentage(sentence.startTime, videoData.duration);
                  const widthPercent = getTimePercentage(
                    sentence.endTime - sentence.startTime, 
                    videoData.duration
                  );
                  
                  const isCurrentSentence = selectedSentences.length > 0 && 
                    index === currentSentenceIndex && isPlaying;
                  
                  return (
                    <div
                      key={sentence.id}
                      className={`absolute h-2 rounded-full top-0 transition-all cursor-pointer ${
                        isCurrentSentence 
                          ? 'bg-yellow-400 h-3 -top-0.5' 
                          : 'bg-green-500 hover:bg-green-400'
                      }`}
                      style={{
                        left: `${startPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                      onClick={() => {
                        if (selectedSentences.length > 0) {
                          seekToSentence(index);
                        }
                      }}
                      title={`${sentence.text} (${formatTime(sentence.startTime)} - ${formatTime(sentence.endTime)})`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Sentence Navigation (only when multiple sentences are selected) */}
          {selectedSentences.length > 1 && (
            <div className="mt-3 flex justify-center">
              <div className="flex gap-1">
                {selectedSentences.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => seekToSentence(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSentenceIndex
                        ? 'bg-blue-500 w-4'
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                    title={`Go to sentence ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};