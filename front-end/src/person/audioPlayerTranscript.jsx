import { useState, useRef, useEffect } from 'react';
import { api } from "../common/api";

const AudioPlayerWithTranscript = ({ 
  audioUrl, 
  segments: initialSegments = [], 
  isOpen, 
  onClose, 
  onSave, 
  recordingID,
  initialStatus = null 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [editingSegment, setEditingSegment] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [transcriptStatus, setTranscriptStatus] = useState(initialStatus);
  const [localSegments, setLocalSegments] = useState(initialSegments);
  const audioRef = useRef(null);

  // Sync local segments when prop changes
  useEffect(() => {
    setLocalSegments(initialSegments);
    console.log(localSegments)
  }, [initialSegments]);

  // Audio player setup
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  const onLabel = (status) => {
    const boolStatus = status === "correct" ? true : false;
    api.patch(`/logs/call-recordings/${recordingID}/`, {"is_transcript_correct": boolStatus})
      .then(() => console.log("success"))
      .catch((error) => console.log(`error: ${error}`));
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playSegment = (segment) => {
    const audio = audioRef.current;
    audio.currentTime = segment.start;
    audio.play();
    setIsPlaying(true);
    
    const segmentDuration = (segment.end - segment.start) * 1000;
    const timeout = setTimeout(() => {
      if (audio.currentTime >= segment.end) {
        audio.pause();
        setIsPlaying(false);
      }
    }, segmentDuration);

    return () => clearTimeout(timeout);
  };

  const handleTimeChange = (e) => {
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSegmentClick = (segment) => {
    playSegment(segment);
  };

  const handleSegmentDoubleClick = (segment) => {
    setEditingSegment(segment);
    setEditedText(segment.text);
  };

  const handleSaveEdit = () => {
    if (!editingSegment) return;
    
    const updatedSegments = localSegments.map(seg => 
      seg === editingSegment ? { ...seg, text: editedText } : seg
    );
    
    setLocalSegments(updatedSegments);
    
    if (onSave) {
      onSave(updatedSegments);
    }
    
    setEditingSegment(null);
  };

  const handleCancelEdit = () => {
    setEditingSegment(null);
  };

  const handleLabelTranscript = (status) => {
    setTranscriptStatus(status);
    onLabel(status);
  };

  const renderStatusIndicator = () => {
    if (!transcriptStatus) return null;
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        transcriptStatus === 'correct' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {transcriptStatus === 'correct' ? (
          <>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            صحیح
          </>
        ) : (
          <>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            ناصحیح
          </>
        )}
      </div>
    );
  };

  const renderSegments = () => {
    if (!localSegments || localSegments.length === 0) {
      return <div className="text-gray-500">متنی برای نمایش وجود ندارد</div>;
    }

    return (
      <div className="space-y-2" dir="rtl">
        {localSegments.map((segment, i) => (
          <div 
            key={i}
            className={`p-2 rounded cursor-pointer transition-colors ${
              currentTime >= segment.start && currentTime <= segment.end 
                ? 'bg-blue-100' 
                : 'hover:bg-gray-50'
            } ${
              editingSegment === segment ? 'bg-yellow-100 border border-yellow-300' : ''
            }`}
            onClick={() => handleSegmentClick(segment)}
            onDoubleClick={() => handleSegmentDoubleClick(segment)}
          >
            {editingSegment === segment ? (
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatTime(segment.start)} - {formatTime(segment.end)}</span>
                </div>
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  dir="rtl"
                  autoFocus
                />
                <div className="flex space-x-2 justify-end">
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                  >
                    ذخیره
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">
                    {formatTime(segment.start)} - {formatTime(segment.end)}
                  </span>
                </div>
                <p className="mt-1">{segment.text}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b p-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold">پخش صوت و متن مکالمه</h2>
            {renderStatusIndicator()}
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-end space-x-3 mb-4">
            <button
              onClick={() => handleLabelTranscript('correct')}
              className={`px-4 py-2 rounded-md flex items-center ${
                transcriptStatus === 'correct' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              صحیح است
            </button>
            <button
              onClick={() => handleLabelTranscript('incorrect')}
              className={`px-4 py-2 rounded-md flex items-center ${
                transcriptStatus === 'incorrect' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              ناصحیح است
            </button>
          </div>

          <div className="flex items-center mb-6 space-x-4">
            <button
              onClick={togglePlayPause}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
            
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleTimeChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <span className="text-sm text-gray-600">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">متن مکالمه</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
              {renderSegments()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayerWithTranscript;
