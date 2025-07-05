import { create } from 'zustand';
import type { VideoData, HighlightState } from '../types';

interface HighlightStore extends HighlightState {
  // Video element management
  videoElement: HTMLVideoElement | null;
  setVideoElement: (element: HTMLVideoElement | null) => void;
  
  // Actions
  setVideoData: (data: VideoData | null) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsProcessing: (processing: boolean) => void;
  toggleSentenceSelection: (sentenceId: string) => void;
  highlightCurrentSentence: (time: number) => void;
  updateSelectedSentences: () => void;
  resetState: () => void;
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

    // Find current sentence based on selected sentences
    const currentSentence = selectedSentences.find(sentence => 
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

    set({ selectedSentences: selected });
  },

  resetState: () => {
    set({ ...initialState, videoElement: null });
  },
}));