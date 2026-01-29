import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Mic, Square, Navigation, Loader2, PanelLeft, FileText, Download, LocateIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { AudioPlayerBar } from './AudioPlayerBar';
import { VoiceSelector } from './VoiceSelector';
import { HighlightedText, type HighlightedTextRef } from './HighlightedText';
import { useSessionStore } from '@/stores/sessionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useEngineStore } from '@/stores/engineStore';
import { useAudioStore } from '@/stores/audioStore';
import { useDocumentStore } from '@/stores/documentStore';
import { useTextSyncStore } from '@/stores/textSyncStore';
import { useGeneration } from '@/hooks/useGeneration';
import { getStreamingPlayer } from '@/lib/audio/streamingPlayer';
import { fadeIn } from '@/lib/motion';
import { getQualityLabel } from './ControlsPanel';

interface ContentPageProps {
  onToggleSidebar: () => void;
  onBack: () => void;
}

export function ContentPage({ onToggleSidebar, onBack }: ContentPageProps) {
  const { currentSession, updateCurrentSession } = useSessionStore();
  const { speed, setSpeed, totalSteps, setTotalSteps } = useSettingsStore();
  const { isReady } = useEngineStore();
  const { duration, currentTime, isPlaying } = useAudioStore();
  const { setText: setDocumentText } = useDocumentStore();
  const { chunks: textChunks } = useTextSyncStore();
  const { isGenerating, generate } = useGeneration();

  // Local text state for editing
  const [text, setText] = useState(currentSession?.text || '');
  // Edit mode: show textarea. Otherwise show highlighted text (when audio available)
  const [isEditMode, setIsEditMode] = useState(true);
  // Follow mode: auto-scroll to current speaking position
  const [followMode, setFollowMode] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const highlightedTextRef = useRef<HighlightedTextRef>(null);

  // Sync local text when session changes
  useEffect(() => {
    setText(currentSession?.text || '');
  }, [currentSession?.id, currentSession?.text]);

  // Debounced save to IndexedDB
  const handleTextChange = useCallback(
    (newText: string) => {
      setText(newText);
      // Also update document store for generation hook
      setDocumentText(newText);

      // Debounce the save to IndexedDB
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        updateCurrentSession({ text: newText });
      }, 500);
    },
    [updateCurrentSession, setDocumentText],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Show player when generating or when there's audio to play
  const showPlayer = isGenerating || duration > 0;

  // Show highlighted text when we have audio and not in edit mode
  const hasAudio = duration > 0 || textChunks.length > 0;
  const showHighlightedText = hasAudio && !isEditMode;

  // Switch to playback mode when generation starts or audio starts playing
  useEffect(() => {
    if (isGenerating || isPlaying) {
      setIsEditMode(false);
    }
  }, [isGenerating, isPlaying]);

  // Switch back to edit mode when audio finishes playing
  const wasPlayingRef = useRef(false);
  useEffect(() => {
    // Detect when playback stops after having played
    if (wasPlayingRef.current && !isPlaying && !isGenerating && duration > 0 && currentTime === 0) {
      // Audio finished (player resets currentTime to 0 when done)
      setIsEditMode(true);
      setFollowMode(false);
    }
    wasPlayingRef.current = isPlaying;
  }, [isPlaying, isGenerating, duration, currentTime]);


  const isDisabled = !text.trim() || !isReady || isGenerating;

  const handleStopPlayback = useCallback(() => {
    const player = getStreamingPlayer();
    player.stop();
    setIsEditMode(true);
    setFollowMode(false);
  }, []);

  const handleRecenter = useCallback(() => {
    highlightedTextRef.current?.scrollToCurrentPosition();
  }, []);

  // Handle file download
  const handleDownloadFile = useCallback(() => {
    if (!currentSession?.originalFile || !currentSession?.fileName) return;

    const url = URL.createObjectURL(currentSession.originalFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentSession.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [currentSession?.originalFile, currentSession?.fileName]);

  const hasOriginalFile = currentSession?.originalFile && currentSession?.fileName;

  return (
    <motion.div variants={fadeIn} initial='hidden' animate='visible' exit='exit' className='flex flex-col h-full bg-background'>
      {/* Header / Playback Bar Area */}
      <div className='shrink-0 z-50'>
        {showPlayer ? (
          <div className='flex items-center glass px-2 md:px-4 h-16'>
            <button
              onClick={onToggleSidebar}
              className='p-2 text-text-secondary hover:text-text-primary transition-colors'
            >
              <PanelLeft size={20} />
            </button>
            {hasOriginalFile && (
              <button
                onClick={handleDownloadFile}
                className='flex items-center gap-2 ml-1 md:ml-2 md:pr-3 md:border-r border-border text-text-secondary hover:text-text-primary transition-colors'
                title='Download original file'
              >
                <FileText size={14} className='text-text-tertiary' />
                <span className='text-xs max-w-[80px] md:max-w-[120px] truncate hidden sm:inline'>
                  {currentSession?.fileName}
                </span>
                <Download size={12} className="md:ml-1" />
              </button>
            )}
            <div className='flex-1 h-full min-w-0'>
              <AudioPlayerBar className='bg-transparent border-none shadow-none backdrop-filter-none h-full' />
            </div>
            <button
              onClick={onBack}
              className='flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full border border-border text-sm font-semibold hover:bg-surface transition-colors ml-1 md:ml-2'
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
        ) : (
          <header className='flex items-center justify-between px-4 md:px-6 h-16 glass'>
            <div className='flex items-center gap-1 md:gap-4'>
              <button
                onClick={onToggleSidebar}
                className='p-2 text-text-secondary hover:text-text-primary transition-colors'
              >
                <PanelLeft size={20} />
              </button>
              <h1 className='text-xl md:text-h2 font-bold whitespace-nowrap'>SoundPage</h1>
              {hasOriginalFile && (
                <button
                  onClick={handleDownloadFile}
                  className='flex items-center gap-2 ml-1 md:ml-2 md:pl-4 md:border-l border-border text-text-secondary hover:text-text-primary transition-colors'
                  title='Download original file'
                >
                  <FileText size={16} className='text-text-tertiary' />
                  <span className='text-sm max-w-[100px] md:max-w-[200px] truncate hidden sm:inline'>
                    {currentSession?.fileName}
                  </span>
                  <Download size={14} className="md:ml-1" />
                </button>
              )}
            </div>
            <button
              onClick={onBack}
              className='flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full border border-border text-sm font-semibold hover:bg-surface transition-colors'
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </button>
          </header>
        )}
      </div>

      {/* Main Content Area */}
      <div className='flex-1 flex flex-col min-h-0 relative'>
        {/* Secondary Toolbar for playback mode */}
        <AnimatePresence>
          {showHighlightedText && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className='absolute top-0 inset-x-0 z-10 flex justify-center py-4 pointer-events-none'
            >
              <div className='flex items-center gap-1 md:gap-2 p-1 bg-surface-high/80 backdrop-blur-md rounded-full border border-border shadow-lg pointer-events-auto'>
                {!followMode && (
                  <button onClick={handleRecenter} className='flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary'>
                    <LocateIcon size={14} /> <span className="inline">Locate</span>
                  </button>
                )}
                <button
                  onClick={() => setFollowMode(!followMode)}
                  className={cn(
                    'flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-wider',
                    followMode ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  <Navigation size={12} fill={followMode ? 'white' : 'none'} />
                  {followMode ? <span className="inline">Following</span> : <span className="inline">Follow</span>}
                </button>
              
                <div className='w-px h-4 bg-border' />
                <button
                  onClick={handleStopPlayback}
                  className='flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-error hover:bg-error/10'
                >
                  <Square size={12} fill='currentColor' />
                  Stop
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className='flex-1 overflow-y-auto content-body px-4 md:px-0'>
          <div className='max-w-3xl mx-auto h-full flex flex-col'>
            {showHighlightedText ? (
              <HighlightedText ref={highlightedTextRef} text={text} followMode={followMode} className='flex-1 py-8' />
            ) : (
              <textarea
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder='Begin typing your narrative...'
                className={cn(
                  'w-full flex-1 resize-none py-8',
                  'text-lg md:text-[20px] text-text-primary leading-[1.6] font-medium',
                  'bg-transparent border-none outline-none focus-visible:outline-none',
                  'placeholder:text-text-tertiary/20',
                  'focus:ring-0',
                )}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modern Controls Panel - Floating at bottom */}
      {!showHighlightedText && (
        <div className='shrink-0 border-t border-border bg-background pb-8 md:pb-10 pt-4 md:pt-6'>
          <div className='max-w-5xl mx-auto px-4 md:px-6'>
            <div className='grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-end'>
              <div className='md:col-span-4 space-y-2'>
                <label className="block text-[10px] md:text-[11px] font-bold text-text-tertiary uppercase tracking-wider px-1">Speaker</label>
                <VoiceSelector />
              </div>
              
              <div className='md:col-span-4'>
                <Slider 
                  label="Quality"
                  valueDisplay={getQualityLabel(totalSteps)}
                  value={[totalSteps]} 
                  onValueChange={([v]) => setTotalSteps(v)} 
                  min={2} max={16} step={1} 
                />
              </div>

              <div className='md:col-span-3'>
                <Slider 
                  label="Speed"
                  valueDisplay={`${speed.toFixed(1)}x`}
                  value={[speed]} 
                  onValueChange={([v]) => setSpeed(v)} 
                  min={0.6} max={1.5} step={0.1} 
                />
              </div>

              <div className='md:col-span-1 flex md:block justify-end pt-2 md:pt-0'>
                <button
                  onClick={generate}
                  disabled={isDisabled}
                  className={cn(
                    'btn-icon btn-accent w-full md:w-[44px]',
                    isDisabled && 'bg-surface-high text-text-tertiary opacity-50 cursor-not-allowed'
                  )}
                >
                  {isGenerating ? <Loader2 className='animate-spin' size={24} /> : (
                    <div className="flex items-center gap-2 md:justify-center">
                      <Mic size={24} />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
