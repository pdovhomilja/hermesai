"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Play, Pause, Square, Mic, VolumeX, Volume2, RotateCcw, Download, Settings } from "lucide-react";
import { useVoiceGeneration, useVoiceControls } from "@/hooks/use-voice-generation";
import { cn } from "@/lib/utils";

interface VoicePlayerProps {
  text: string;
  audioUrl?: string;
  className?: string;
  autoGenerate?: boolean;
  conversationId?: string;
  variant?: "compact" | "full" | "minimal";
  voice?: string;
  persona?: "ancient_sage" | "mystical_guide" | "scholarly_hermit";
}

export function VoicePlayer({ 
  text, 
  audioUrl: initialAudioUrl,
  className,
  autoGenerate = false,
  conversationId,
  variant = "compact",
  voice,
  persona
}: VoicePlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | undefined>(initialAudioUrl);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    isGenerating,
    isPlaying,
    currentAudio,
    error,
    generateVoice,
    playAudio,
    pauseAudio,
    stopAudio,
    estimateCost,
    validateText
  } = useVoiceGeneration();

  const {
    volume,
    playbackRate,
    currentTime,
    duration: audioDuration,
    updateAudioElement,
    seek,
    changeVolume,
    changePlaybackRate,
    progress
  } = useVoiceControls();

  // Update audio element when currentAudio changes
  useEffect(() => {
    updateAudioElement(currentAudio);
  }, [currentAudio, updateAudioElement]);

  // Auto-generate voice on mount if enabled
  useEffect(() => {
    const generateVoiceOnMount = async () => {
      if (autoGenerate && !audioUrl && text) {
        const result = await generateVoice({
          text,
          voice,
          persona,
          conversationId,
          saveAudio: true
        });
        
        if (result) {
          setAudioUrl(result.audioUrl);
        }
      }
    };
    generateVoiceOnMount();
  }, [autoGenerate, audioUrl, text, voice, persona, conversationId, generateVoice]);

  const handleGenerate = useCallback(async () => {
    if (!text) return;
    
    const result = await generateVoice({
      text,
      voice,
      persona,
      conversationId,
      saveAudio: true
    });
    
    if (result) {
      setAudioUrl(result.audioUrl);
    }
  }, [text, voice, persona, conversationId, generateVoice]);

  const handlePlay = async () => {
    if (!audioUrl) {
      await handleGenerate();
      return;
    }
    
    if (isPlaying) {
      pauseAudio();
    } else {
      await playAudio(audioUrl);
    }
  };

  const handleVolumeToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      changeVolume(1.0);
    } else {
      setIsMuted(true);
      changeVolume(0);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const validation = validateText(text);
  const estimatedCost = estimateCost(text);

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePlay}
          disabled={!validation.valid || isGenerating}
          className="h-6 w-6 p-0"
          title={isGenerating ? "Generating voice..." : 
                 isPlaying ? "Pause audio" : 
                 audioUrl ? "Play audio" : "Generate and play"}
        >
          {isGenerating ? (
            <Mic className="h-3 w-3 animate-pulse" />
          ) : isPlaying ? (
            <Pause className="h-3 w-3" />
          ) : (
            <Play className="h-3 w-3" />
          )}
        </Button>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Card className={cn("flex items-center gap-2 p-2", className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePlay}
          disabled={!validation.valid || isGenerating}
        >
          {isGenerating ? (
            <Mic className="h-4 w-4 animate-pulse mr-1" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4 mr-1" />
          ) : (
            <Play className="h-4 w-4 mr-1" />
          )}
          {isGenerating ? "Generating..." : isPlaying ? "Pause" : "Play"}
        </Button>
        
        {isPlaying && currentAudio && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={stopAudio}
            >
              <Square className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 mx-2">
              <Progress value={progress * 100} className="w-full" />
            </div>
            
            <span className="text-xs text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(audioDuration)}
            </span>
          </>
        )}
        
        {error && (
          <div className="h-2 w-2 bg-destructive rounded-full" title={error} />
        )}
      </Card>
    );
  }

  // Full variant
  return (
    <Card className={cn("space-y-4 p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-primary" />
          <span className="font-medium">Voice Generation</span>
          {persona && (
            <Badge variant="secondary">
              {persona.replace('_', ' ')}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{text.length} chars</span>
          <span>•</span>
          <span>${estimatedCost.toFixed(4)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handlePlay}
          disabled={!validation.valid || isGenerating}
          variant="outline"
        >
          {isGenerating ? (
            <>
              <Mic className="h-4 w-4 mr-2 animate-pulse" />
              Generating...
            </>
          ) : isPlaying ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              {audioUrl ? "Play" : "Generate & Play"}
            </>
          )}
        </Button>
        
        {audioUrl && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={stopAudio}
              disabled={!isPlaying}
            >
              <Square className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => seek(0)}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <a href={audioUrl} download="hermes-voice.mp3">
                <Download className="h-4 w-4" />
              </a>
            </Button>
          </>
        )}
        
        <div className="flex-1" />
        
        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVolumeToggle}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume * 100}
            onChange={(e) => {
              setIsMuted(false);
              changeVolume(parseInt(e.target.value) / 100);
            }}
            className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        {/* Settings Toggle */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Playback Speed</label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="range"
                min="25"
                max="400"
                step="5"
                value={playbackRate * 100}
                onChange={(e) => changePlaybackRate(parseInt(e.target.value) / 100)}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-muted-foreground w-12">
                {playbackRate.toFixed(2)}x
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Voice:</span> {voice || "alloy"}
            </div>
            <div>
              <span className="font-medium">Characters:</span> {text.length}
            </div>
          </div>
        </Card>
      )}

      {/* Progress Bar */}
      {(isPlaying || currentTime > 0) && (
        <div className="space-y-2">
          <Progress value={progress * 100} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(audioDuration)}</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-2 border border-destructive/20 bg-destructive/5 rounded text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Validation Errors */}
      {!validation.valid && (
        <div className="p-2 border border-orange-200 bg-orange-50 rounded text-sm text-orange-700">
          <ul className="list-disc list-inside space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}