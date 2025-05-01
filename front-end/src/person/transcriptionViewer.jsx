import React, { useState } from 'react';
import { api } from "../common/api";

const TranscriptionViewer = ({ recordingId, initalTranscription }) => {
  const [transcription, setTranscription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log(initalTranscription)

  const fetchTranscription = () => {
      setIsLoading(true)

      const processedText = initalTranscription.text

      setTranscription(processedText)
      setIsLoading(false)
  }

  return (
    <div className="relative">
      {transcription ? (
        <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-800 whitespace-pre-line">
          {transcription}
        </div>
      ) : (
        <button
          onClick={fetchTranscription}
          disabled={isLoading}
          className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
        >
          {isLoading ? 'در حال بارگذاری...' : 'نمایش متن مکالمه'}
        </button>
      )}
      
      {error && (
        <div className="text-red-500 text-sm mt-1">{error}</div>
      )}
    </div>
  );
};

export default TranscriptionViewer;
