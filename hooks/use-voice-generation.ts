import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

export interface VoiceGenerationOptions {
  text: string;
  voice?: string;
  speed?: number;
  persona?: "ancient_sage" | "mystical_guide" | "scholarly_hermit";
  mood?: "calm" | "energetic" | "mystical" | "compassionate" | "serious" | "playful";
  spiritualTone?: "ancient" | "modern" | "ceremonial" | "conversational" | "profound";
  conversationId?: string;
  saveAudio?: boolean;
}

export interface VoiceGenerationResult {
  audioUrl: string;
  duration: number;
  format: string;
  characterCount: number;
  processingTime: number;
}

export interface VoiceInfo {
  id: string;
  name: string;
  provider: string;
  language: string;
  gender: string;
  description: string;
  characteristics: {
    age: string;
    gender: string;
    authority: number;
    warmth: number;
    wisdom: number;
    mysticism: number;
    clarity: number;
    resonance: string;
  };
  recommendedPersonas: string[];
  spiritualAlignment: string[];
}

export interface UseVoiceGenerationReturn {
  // State
  isGenerating: boolean;
  isPlaying: boolean;
  currentAudio: HTMLAudioElement | null;
  availableVoices: VoiceInfo[];
  isLoadingVoices: boolean;
  error: string | null;
  
  // Actions
  generateVoice: (options: VoiceGenerationOptions) => Promise<VoiceGenerationResult | null>;
  playAudio: (audioUrl: string) => Promise<void>;
  pauseAudio: () => void;
  stopAudio: () => void;
  loadVoices: (provider?: string, language?: string) => Promise<void>;
  
  // Utilities
  estimateCost: (text: string) => number;
  validateText: (text: string) => { valid: boolean; errors: string[] };
  getRecommendedVoice: (persona?: string, spiritualLevel?: string) => string;
}

export function useVoiceGeneration(): UseVoiceGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [availableVoices, setAvailableVoices] = useState<VoiceInfo[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const generateVoice = useCallback(async (options: VoiceGenerationOptions): Promise<VoiceGenerationResult | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      // Validate text
      const validation = validateText(options.text);
      if (!validation.valid) {
        throw new Error(validation.errors.join(", "));
      }

      const response = await fetch("/api/voice/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: options.text,
          config: {
            provider: "openai",
            voice: options.voice || "alloy",
            speed: options.speed || 1.0,
            language: "en",
            outputFormat: "mp3"
          },
          conversationId: options.conversationId,
          emotionalContext: {
            mood: options.mood || "calm",
            intensity: 0.5,
            spiritualTone: options.spiritualTone || "conversational",
            breathingPauses: true,
            accentuation: []
          },
          persona: options.persona,
          saveAudio: options.saveAudio ?? true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Voice generation failed");
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || "Voice generation failed");
      }

      toast.success("Voice generated successfully!", {
        description: `Duration: ${Math.round(result.duration)}s, Characters: ${result.characterCount}`,
      });

      return {
        audioUrl: result.audioUrl,
        duration: result.duration,
        format: result.format,
        characterCount: result.characterCount,
        processingTime: result.processingTime
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Voice generation failed";
      setError(errorMessage);
      toast.error("Voice generation failed", {
        description: errorMessage,
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const playAudio = useCallback(async (audioUrl: string): Promise<void> => {
    try {
      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Create new audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setCurrentAudio(audio);

      // Set up event listeners
      audio.addEventListener("loadstart", () => {
        setIsPlaying(true);
      });

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      });

      audio.addEventListener("error", (e) => {
        console.error("Audio playback error:", e);
        setIsPlaying(false);
        setCurrentAudio(null);
        toast.error("Audio playback failed");
      });

      audio.addEventListener("pause", () => {
        setIsPlaying(false);
      });

      audio.addEventListener("play", () => {
        setIsPlaying(true);
      });

      // Start playback
      await audio.play();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Audio playback failed";
      setError(errorMessage);
      toast.error("Audio playback failed", {
        description: errorMessage,
      });
    }
  }, []);

  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  }, []);

  const loadVoices = useCallback(async (provider: string = "openai", language: string = "en"): Promise<void> => {
    setIsLoadingVoices(true);
    setError(null);

    try {
      const response = await fetch(`/api/voice/generate?provider=${provider}&language=${language}`);
      
      if (!response.ok) {
        throw new Error("Failed to load voices");
      }

      const data = await response.json();
      setAvailableVoices(data.voices || []);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load voices";
      setError(errorMessage);
      toast.error("Failed to load voices", {
        description: errorMessage,
      });
    } finally {
      setIsLoadingVoices(false);
    }
  }, []);

  const estimateCost = useCallback((text: string): number => {
    // OpenAI pricing: $15.00 per 1M characters
    const characterCount = text.length;
    const costPerCharacter = 15.00 / 1000000;
    return Math.max(0.01, characterCount * costPerCharacter);
  }, []);

  const validateText = useCallback((text: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!text || text.trim().length === 0) {
      errors.push("Text cannot be empty");
    }

    if (text.length > 4000) {
      errors.push("Text must be under 4000 characters");
    }

    if (text.length < 10) {
      errors.push("Text must be at least 10 characters");
    }

    // Check for potentially problematic characters
    const problematicChars = /[^\w\s.,!?;:()\-'"]/g;
    if (problematicChars.test(text)) {
      errors.push("Text contains characters that may not be pronounced correctly");
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }, []);

  const getRecommendedVoice = useCallback((persona?: string, spiritualLevel?: string): string => {
    // Voice recommendations based on persona
    const personaVoiceMap: Record<string, string> = {
      "ancient_sage": "onyx",
      "mystical_guide": "nova",
      "scholarly_hermit": "echo"
    };

    if (persona && personaVoiceMap[persona]) {
      return personaVoiceMap[persona];
    }

    // Voice recommendations based on spiritual level
    const levelVoiceMap: Record<string, string> = {
      "SEEKER": "alloy",
      "STUDENT": "shimmer",
      "ADEPT": "fable",
      "MASTER": "onyx"
    };

    if (spiritualLevel && levelVoiceMap[spiritualLevel]) {
      return levelVoiceMap[spiritualLevel];
    }

    return "alloy"; // Default fallback
  }, []);

  return {
    // State
    isGenerating,
    isPlaying,
    currentAudio,
    availableVoices,
    isLoadingVoices,
    error,
    
    // Actions
    generateVoice,
    playAudio,
    pauseAudio,
    stopAudio,
    loadVoices,
    
    // Utilities
    estimateCost,
    validateText,
    getRecommendedVoice
  };
}

// Additional utility hooks for voice functionality

export function useVoiceControls() {
  const [volume, setVolume] = useState(1.0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const updateAudioElement = useCallback((audio: HTMLAudioElement | null) => {
    if (audioRef.current) {
      // Remove old listeners
      audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
      audioRef.current.removeEventListener("durationchange", handleDurationChange);
    }

    audioRef.current = audio;

    if (audio) {
      // Apply current settings
      audio.volume = volume;
      audio.playbackRate = playbackRate;

      // Add new listeners
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("durationchange", handleDurationChange);
    }
  }, [volume, playbackRate]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleDurationChange = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, audioRef.current.duration || 0));
    }
  }, []);

  const changeVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  const changePlaybackRate = useCallback((rate: number) => {
    const clampedRate = Math.max(0.25, Math.min(4, rate));
    setPlaybackRate(clampedRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = clampedRate;
    }
  }, []);

  return {
    volume,
    playbackRate,
    currentTime,
    duration,
    updateAudioElement,
    seek,
    changeVolume,
    changePlaybackRate,
    progress: duration > 0 ? currentTime / duration : 0
  };
}

export function useVoicePreferences() {
  const [preferences, setPreferences] = useState({
    defaultVoice: "alloy",
    defaultSpeed: 1.0,
    defaultPersona: undefined as string | undefined,
    autoPlay: false,
    saveAudio: true,
    enableHermeticEnhancements: true
  });

  const updatePreference = useCallback(<K extends keyof typeof preferences>(
    key: K,
    value: typeof preferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    
    // Save to localStorage
    try {
      const saved = JSON.parse(localStorage.getItem("hermes-voice-preferences") || "{}");
      saved[key] = value;
      localStorage.setItem("hermes-voice-preferences", JSON.stringify(saved));
    } catch (error) {
      console.error("Failed to save voice preferences:", error);
    }
  }, []);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hermes-voice-preferences");
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error("Failed to load voice preferences:", error);
    }
  }, []);

  return {
    preferences,
    updatePreference
  };
}