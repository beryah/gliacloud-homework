export interface TranscriptSentence {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  isSelected: boolean;
  isHighlighted?: boolean;
}

export interface TranscriptSection {
  id: string;
  title: string;
  sentences: TranscriptSentence[];
}

export interface TranscriptData {
  duration: number;
  transcript: TranscriptSection[];
}

export interface VideoData extends TranscriptData {
  url: string;
}

export interface HighlightState {
  videoData: VideoData | null;
  currentTime: number;
  isPlaying: boolean;
  isProcessing: boolean;
  selectedSentences: TranscriptSentence[];
}