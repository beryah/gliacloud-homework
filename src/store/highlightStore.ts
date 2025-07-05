import { create } from 'zustand';
import type { VideoData, HighlightState } from '../types';

interface HighlightStore extends HighlightState {
  // Video element management
  videoElement: HTMLVideoElement | null;
  setVideoElement: (element: HTMLVideoElement | null) => void;
  
  // New properties for selected playback
  isPlayingSelected: boolean;
  currentSentenceIndex: number;
  
  // Original actions
  setVideoData: (data: VideoData | null) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsProcessing: (processing: boolean) => void;
  toggleSentenceSelection: (sentenceId: string) => void;
  highlightCurrentSentence: (time: number) => void;
  updateSelectedSentences: () => void;
  resetState: () => void;
  
  // New actions for selected playback
  setCurrentSentenceIndex: (index: number) => void;
  setIsPlayingSelected: (playing: boolean) => void;
  goToNextSentence: () => void;
  goToPreviousSentence: () => void;
  startSelectedPlayback: () => void;
  stopSelectedPlayback: () => void;
}

const initialState: HighlightState = {
  videoData: null,
  currentTime: 0,
  isPlaying: false,
  isProcessing: false,
  selectedSentences: [],
};

export const useHighlightStore = create<HighlightStore>((set, get) => ({
  ...initialState,
  videoElement: null,
  
  // New state for selected playback
  isPlayingSelected: false,
  currentSentenceIndex: 0,

  setVideoElement: (element) => {
    set({ videoElement: element });
  },

  setVideoData: (data) => {
    set({ videoData: data });
    get().updateSelectedSentences();
  },

  setCurrentTime: (time) => {
    set({ currentTime: time });
    get().highlightCurrentSentence(time);
  },

  setIsPlaying: (playing) => {
    set({ isPlaying: playing });
  },

  setIsProcessing: (processing) => {
    set({ isProcessing: processing });
  },

  toggleSentenceSelection: (sentenceId) => {
    const { videoData } = get();
    if (!videoData) return;

    const updatedTranscript = videoData.transcript.map(section => ({
      ...section,
      sentences: section.sentences.map(sentence =>
        sentence.id === sentenceId
          ? { ...sentence, isSelected: !sentence.isSelected }
          : sentence
      )
    }));

    set({
      videoData: {
        ...videoData,
        transcript: updatedTranscript
      }
    });

    get().updateSelectedSentences();
  },

  highlightCurrentSentence: (time) => {
    const { videoData, selectedSentences } = get();
    if (!videoData) return;

    // If we have selected sentences, only highlight from selected sentences
    // Otherwise highlight from all sentences
    const sentencesToCheck = selectedSentences.length > 0 ? selectedSentences : 
      videoData.transcript.flatMap(section => section.sentences);

    // Find current sentence
    const currentSentence = sentencesToCheck.find(sentence => 
      time >= sentence.startTime && time <= sentence.endTime
    );

    // Update highlight state
    const updatedTranscript = videoData.transcript.map(section => ({
      ...section,
      sentences: section.sentences.map(sentence => ({
        ...sentence,
        isHighlighted: sentence.id === currentSentence?.id
      }))
    }));

    set({
      videoData: {
        ...videoData,
        transcript: updatedTranscript
      }
    });
  },

  updateSelectedSentences: () => {
    const { videoData } = get();
    if (!videoData) return;

    const selected = videoData.transcript.flatMap(section => 
      section.sentences.filter(sentence => sentence.isSelected)
    );

    // Sort by start time to ensure proper playback order
    selected.sort((a, b) => a.startTime - b.startTime);

    set({ selectedSentences: selected });
  },

  resetState: () => {
    set({ 
      ...initialState, 
      videoElement: null,
      isPlayingSelected: false,
      currentSentenceIndex: 0
    });
  },

  // New actions for selected playback
  setCurrentSentenceIndex: (index) => {
    set({ currentSentenceIndex: index });
  },
  
  setIsPlayingSelected: (playing) => {
    set({ isPlayingSelected: playing });
  },
  
  startSelectedPlayback: () => {
    const { selectedSentences } = get();
    if (selectedSentences.length === 0) return;
    
    set({ 
      isPlayingSelected: true,
      currentSentenceIndex: 0 
    });
  },
  
  stopSelectedPlayback: () => {
    set({ 
      isPlayingSelected: false,
      currentSentenceIndex: 0 
    });
  },
  
  goToNextSentence: () => {
    const { selectedSentences, currentSentenceIndex } = get();
    if (currentSentenceIndex < selectedSentences.length - 1) {
      set({ currentSentenceIndex: currentSentenceIndex + 1 });
      return true; // Has next sentence
    } else {
      // End of selected sentences, stop playback
      get().stopSelectedPlayback();
      return false; // No more sentences
    }
  },
  
  goToPreviousSentence: () => {
    const { currentSentenceIndex } = get();
    if (currentSentenceIndex > 0) {
      set({ currentSentenceIndex: currentSentenceIndex - 1 });
      return true;
    }
    return false;
  },
}));