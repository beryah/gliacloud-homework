import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Upload, Download, Scissors } from 'lucide-react';

interface TranscriptSection {
  id: string;
  title: string;
  sentences: TranscriptSentence[];
}

interface TranscriptSentence {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  isSelected: boolean;
  isHighlighted?: boolean;
}

interface VideoData {
  url: string;
  duration: number;
  transcript: TranscriptSection[];
}

// Mock API function
const mockProcessVideo = async (file: File): Promise<VideoData> => {
  // Simulate API processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const videoUrl = URL.createObjectURL(file);
  
  return {
    url: videoUrl,
    duration: 180, // 3 minutes mock duration
    transcript: [
      {
        id: 'intro',
        title: 'Introduction',
        sentences: [
          { id: 's1', text: 'Welcome to our product presentation.', startTime: 0, endTime: 3, isSelected: false },
          { id: 's2', text: 'Today we will discuss the key features of our new application.', startTime: 3, endTime: 7, isSelected: true },
          { id: 's3', text: 'This revolutionary tool will change how you work.', startTime: 7, endTime: 11, isSelected: true },
        ]
      },
      {
        id: 'features',
        title: 'Key Features',
        sentences: [
          { id: 's4', text: 'Our first major feature is real-time collaboration.', startTime: 15, endTime: 19, isSelected: false },
          { id: 's5', text: 'Users can work together seamlessly across different devices.', startTime: 19, endTime: 24, isSelected: true },
          { id: 's6', text: 'The interface is intuitive and user-friendly.', startTime: 24, endTime: 28, isSelected: false },
          { id: 's7', text: 'Advanced AI integration makes tasks faster and more efficient.', startTime: 28, endTime: 33, isSelected: true },
        ]
      },
      {
        id: 'conclusion',
        title: 'Conclusion',
        sentences: [
          { id: 's8', text: 'Thank you for watching our presentation.', startTime: 160, endTime: 164, isSelected: false },
          { id: 's9', text: 'We look forward to your feedback and questions.', startTime: 164, endTime: 168, isSelected: true },
          { id: 's10', text: 'Visit our website for more information.', startTime: 168, endTime: 172, isSelected: false },
        ]
      }
    ]
  };
};

const VideoHighlightEditor: React.FC = () => {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedSentences, setSelectedSentences] = useState<TranscriptSentence[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editingAreaRef = useRef<HTMLDivElement>(null);

  // Update selected sentences when video data changes
  useEffect(() => {
    if (videoData) {
      const selected = videoData.transcript.flatMap(section => 
        section.sentences.filter(sentence => sentence.isSelected)
      );
      setSelectedSentences(selected);
    }
  }, [videoData]);

  // Handle video time update
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      highlightCurrentSentence(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [videoData]);

  const highlightCurrentSentence = (time: number) => {
    if (!videoData) return;

    // Find current sentence based on selected sentences
    const currentSentence = selectedSentences.find(sentence => 
      time >= sentence.startTime && time <= sentence.endTime
    );

    // Update highlight state
    setVideoData(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        transcript: prev.transcript.map(section => ({
          ...section,
          sentences: section.sentences.map(sentence => ({
            ...sentence,
            isHighlighted: sentence.id === currentSentence?.id
          }))
        }))
      };
    });

    // Auto-scroll to current sentence
    if (currentSentence && editingAreaRef.current) {
      const sentenceElement = document.getElementById(`sentence-${currentSentence.id}`);
      if (sentenceElement) {
        sentenceElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please upload a video file');
      return;
    }

    setIsProcessing(true);
    try {
      const data = await mockProcessVideo(file);
      setVideoData(data);
    } catch (error) {
      console.error('Error processing video:', error);
      alert('Error processing video. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSentenceSelection = (sentenceId: string) => {
    setVideoData(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        transcript: prev.transcript.map(section => ({
          ...section,
          sentences: section.sentences.map(sentence => 
            sentence.id === sentenceId 
              ? { ...sentence, isSelected: !sentence.isSelected }
              : sentence
          )
        }))
      };
    });
  };

  const jumpToTimestamp = (startTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
      setCurrentTime(startTime);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentOverlayText = (): string => {
    const currentSentence = selectedSentences.find(sentence => 
      currentTime >= sentence.startTime && currentTime <= sentence.endTime
    );
    return currentSentence?.text || '';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Scissors className="w-6 h-6" />
          Video Highlight Editor
        </h1>
      </div>

      {/* Upload Section */}
      {!videoData && !isProcessing && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 hover:border-gray-500 transition-colors">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-4">Upload a video file to get started</p>
              <button
                onClick={() => fileInputRef.current?.click()}
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
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg">Processing video with AI...</p>
          </div>
        </div>
      )}

      {/* Main Interface */}
      {videoData && (
        <div className="flex h-screen">
          {/* Left Side - Editing Area */}
          <div className="w-1/2 bg-gray-800 border-r border-gray-700 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Transcript</h2>
                <div className="text-sm text-gray-400">
                  {selectedSentences.length} sentences selected
                </div>
              </div>
              
              <div ref={editingAreaRef} className="space-y-6">
                {videoData.transcript.map((section) => (
                  <div key={section.id} className="space-y-2">
                    <h3 className="text-lg font-medium text-blue-400">{section.title}</h3>
                    <div className="space-y-2">
                      {section.sentences.map((sentence) => (
                        <div
                          key={sentence.id}
                          id={`sentence-${sentence.id}`}
                          className={`p-3 rounded-lg cursor-pointer transition-all ${
                            sentence.isHighlighted 
                              ? 'bg-blue-900 border-2 border-blue-500' 
                              : sentence.isSelected 
                                ? 'bg-gray-700 border-2 border-green-500' 
                                : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                          onClick={() => toggleSentenceSelection(sentence.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  jumpToTimestamp(sentence.startTime);
                                }}
                                className="text-blue-400 hover:text-blue-300 text-sm font-mono"
                              >
                                {formatTime(sentence.startTime)}
                              </button>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">{sentence.text}</p>
                            </div>
                            <div className="flex-shrink-0">
                              <input
                                type="checkbox"
                                checked={sentence.isSelected}
                                onChange={() => toggleSentenceSelection(sentence.id)}
                                className="w-4 h-4 text-green-500 rounded focus:ring-green-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Preview Area */}
          <div className="w-1/2 bg-gray-900 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Preview</h2>
            </div>
            
            <div className="flex-1 flex flex-col">
              {/* Video Player */}
              <div className="relative bg-black flex-1 flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={videoData.url}
                  className="max-w-full max-h-full"
                  onLoadedData={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                    }
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                
                {/* Text Overlay */}
                {getCurrentOverlayText() && (
                  <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 px-4 py-2 rounded-lg max-w-4xl">
                    <p className="text-white text-center text-lg">
                      {getCurrentOverlayText()}
                    </p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="p-4 bg-gray-800">
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlayPause}
                    className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full transition-colors"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </button>
                  
                  <div className="flex-1">
                    <div className="text-sm text-gray-400 mb-1">
                      {formatTime(currentTime)} / {formatTime(videoData.duration)}
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${(currentTime / videoData.duration) * 100}%` }}
                      />
                      {/* Highlight markers */}
                      {selectedSentences.map((sentence) => (
                        <div
                          key={sentence.id}
                          className="absolute h-2 bg-green-500 rounded-full"
                          style={{
                            left: `${(sentence.startTime / videoData.duration) * 100}%`,
                            width: `${((sentence.endTime - sentence.startTime) / videoData.duration) * 100}%`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <button className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoHighlightEditor;