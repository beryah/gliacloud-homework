import type { TranscriptData, VideoData } from '../types';

/**
 * Loads transcript data from the JSON file
 * @returns Promise<TranscriptData> - The transcript data with duration and sections
 */
export const getTranscript = async (): Promise<TranscriptData> => {
  try {
    // Fetch the JSON file from the public directory
    const response = await fetch('/mock/transcript.json');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch transcript: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.videoData;
  } catch (error) {
    console.error('Failed to load /mock/transcript.json:', error);
    
    // Fallback data if file cannot be loaded
    return {
      duration: 180,
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
          id: 'demo',
          title: 'Live Demo',
          sentences: [
            { id: 's8', text: 'Let me show you how this works in practice.', startTime: 40, endTime: 44, isSelected: false },
            { id: 's9', text: 'First, we\'ll upload a document to the platform.', startTime: 44, endTime: 48, isSelected: true },
            { id: 's10', text: 'Notice how the AI automatically analyzes the content.', startTime: 48, endTime: 52, isSelected: true },
            { id: 's11', text: 'Within seconds, it provides intelligent suggestions.', startTime: 52, endTime: 56, isSelected: false },
            { id: 's12', text: 'You can see the collaboration features in action here.', startTime: 56, endTime: 60, isSelected: true },
          ]
        },
        {
          id: 'benefits',
          title: 'Key Benefits',
          sentences: [
            { id: 's13', text: 'This solution reduces manual work by up to 70%.', startTime: 70, endTime: 74, isSelected: true },
            { id: 's14', text: 'Teams report increased productivity within the first week.', startTime: 74, endTime: 78, isSelected: false },
            { id: 's15', text: 'The learning curve is minimal thanks to our intuitive design.', startTime: 78, endTime: 82, isSelected: false },
            { id: 's16', text: 'Security and privacy are built into every feature.', startTime: 82, endTime: 86, isSelected: true },
          ]
        },
        {
          id: 'conclusion',
          title: 'Conclusion',
          sentences: [
            { id: 's17', text: 'Thank you for watching our comprehensive product demo.', startTime: 160, endTime: 164, isSelected: false },
            { id: 's18', text: 'We\'re excited to help transform your team\'s productivity.', startTime: 164, endTime: 168, isSelected: true },
            { id: 's19', text: 'Visit our website to start your free trial today.', startTime: 168, endTime: 172, isSelected: true },
            { id: 's20', text: 'Questions? Reach out to our team anytime.', startTime: 172, endTime: 176, isSelected: false },
          ]
        }
      ]
    };
  }
};

/**
 * Simulates AI processing of a video file to generate transcript
 * @param file - The uploaded video file
 * @returns Promise<VideoData> - Complete video data with URL and transcript
 */
export const processVideoFile = async (file: File): Promise<VideoData> => {
  // Simulate API processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Load transcript data from JSON file
  const transcriptData = await getTranscript();
  
  // Additional processing delay to simulate AI analysis
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const videoUrl = URL.createObjectURL(file);
  
  return {
    url: videoUrl,
    duration: transcriptData.duration,
    transcript: transcriptData.transcript
  };
};