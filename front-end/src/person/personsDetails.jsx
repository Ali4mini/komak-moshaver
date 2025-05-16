import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from "../common/api";

const PersonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State for person data
  const [person, setPerson] = useState(null);
  const [loadingPerson, setLoadingPerson] = useState(true);
  const [personError, setPersonError] = useState(null);
  
  // State for call logs
  const [callLogs, setCallLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [errorLogs, setErrorLogs] = useState(null);
  
  // State for audio player
  const [selectedLog, setSelectedLog] = useState(null);

  // Fetch person data
  useEffect(() => {
    setLoadingPerson(true);
    api.get(`common/persons/${id}/`)
      .then((response) => {
        setPerson(response.data);
        setPersonError(null);
      })
      .catch(error => {
        setPersonError('Failed to load person data');
        console.error('Error fetching person:', error);
      })
      .finally(() => {
        setLoadingPerson(false);
      });
  }, [id]);

  // Fetch call logs when person data is available
  useEffect(() => {
    if (person?.id) {
      setLoadingLogs(true);
      api.get(`logs/call-recordings/?person_id=${person.id}`)
        .then(response => {
          setCallLogs(response.data);
          setErrorLogs(null);
        })
        .catch(error => {
          setErrorLogs('Failed to load call logs');
          console.error('Error fetching call logs:', error);
        })
        .finally(() => {
          setLoadingLogs(false);
        });
    }
  }, [person?.id]);

  const handleNewTranscript = (updatedTranscript) => {
    const updatedTranscriptString = JSON.stringify(updatedTranscript);
    api.patch(`/logs/call-recordings/${selectedLog.id}/`, {
      recording_transcription: updatedTranscriptString
    });
  };

  const handleShowPlayer = (log) => {
    try {
      const { segments, metadata } = parseTranscriptString(log.recording_transcription);
      setSelectedLog({
        ...log,
        transcriptSegments: segments,
        metadata: metadata
      });
    } catch (error) {
      console.error('Error processing transcript:', error);
      setSelectedLog({
        ...log,
        transcriptSegments: [{ text: "Error loading transcript" }],
        metadata: {}
      });
    }
  };

  const parseTranscriptString = (transcriptString) => {
    if (!transcriptString) {
      return {
        segments: [{ text: "No transcript available" }],
        metadata: {}
      };
    }

    try {
      let cleanedString = transcriptString
        .replace(/^\(|\)$/g, '')
        .replace(/'/g, '"')
        .replace(/,\s*]/g, ']')
        .replace(/,\s*}/g, '}');

      const lastBracketIndex = cleanedString.lastIndexOf(']');
      const segmentsPart = cleanedString.substring(0, lastBracketIndex + 1);
      
      const data = JSON.parse(segmentsPart);
      const segments = data[0] || [];
      const metadata = data[1] || {};

      return { segments, metadata };
    } catch (error) {
      console.error('Failed to parse transcript:', error);
      return {
        segments: [{ text: "Error: Could not parse transcript" }],
        metadata: {}
      };
    }
  };

  const handleClosePlayer = () => {
    setSelectedLog(null);
  };

  // Formatting functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR');
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Never contacted';
    const dateTime = new Date(dateTimeString);
    return dateTime.toLocaleString('fa-IR');
  };

  const getGenderDisplay = () => {
    if (!person?.gender) return 'Not specified';
    return person.gender === 'F' ? 'خانم' : 'آقا';
  };

  const getCallTypeDisplay = (type) => {
    return type === 'inbound' ? 'ورودی' : 'خروجی';
  };

  // Loading and error states
  if (loadingPerson) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (personError) {
    return (
      <div className="p-4 text-red-500">
        {personError}
        <button 
          onClick={() => navigate('/persons')}
          className="block mt-2 text-blue-600 hover:text-blue-800"
        >
          بازگشت به لیست
        </button>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="p-4 text-gray-500">
        No person data available
        <button 
          onClick={() => navigate('/persons')}
          className="block mt-2 text-blue-600 hover:text-blue-800"
        >
          بازگشت به لیست
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">

      <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
        <div className="border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {person.first_name} {person.last_name}
          </h1>
          <p className="text-gray-600">
            {person.phone_number}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">اطلاعات شخصی</h2>
            <ul className="space-y-2">
              <li className="flex">
                <span className="text-gray-500 w-32">تاریخ تولد:</span>
                <span>{formatDate(person.date_of_birth)}</span>
              </li>
              <li className="flex">
                <span className="text-gray-500 w-32">جنسیت:</span>
                <span>{getGenderDisplay()}</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">اطلاعات تماس</h2>
            <ul className="space-y-2">
              <li className="flex">
                <span className="text-gray-500 w-32">آدرس:</span>
                <span>{person.address || 'Not specified'}</span>
              </li>
              <li className="flex">
                <span className="text-gray-500 w-32">آخرین تماس:</span>
                <span>{formatDateTime(person.last_contact)}</span>
              </li>
            </ul>
          </div>
        </div>

        {person.notes && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">یادداشت‌ها</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-700 whitespace-pre-line">{person.notes}</p>
            </div>
          </div>
        )}

        {/* Call Recordings Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">تاریخچه تماس‌ها</h2>
          
          {loadingLogs ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : errorLogs ? (
            <div className="p-3 bg-red-100 text-red-700 rounded-md">
              {errorLogs}
            </div>
          ) : callLogs.length === 0 ? (
            <p className="text-gray-500">هیچ تماسی ثبت نشده است</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاریخ تماس</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نوع تماس</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">مدت (ثانیه)</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">یادداشت</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">صوت مکالمه</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">متن مکالمه</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {callLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(log.start_time)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {getCallTypeDisplay(log.call_type)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {log.duration}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {log.notes || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {log.recording_file ? (
                          <a 
                            href={log.recording_file} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            دانلود
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <button 
                          onClick={() => handleShowPlayer(log)}
                          className="text-blue-600 hover:text-blue-800"
                          disabled={!log.recording_file}
                        >
                          نمایش
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t text-sm text-gray-500">
          <p>تاریخ ایجاد: {formatDateTime(person.created_at)}</p>
          <p>آخرین بروزرسانی: {formatDateTime(person.updated_at)}</p>
        </div>
      </div>

      {/* Audio Player Dialog - Make sure to import and implement AudioPlayerWithTranscript */}
      {selectedLog && (
        <AudioPlayerWithTranscript
          audioUrl={selectedLog.recording_file}
          segments={selectedLog.transcriptSegments}
          isOpen={!!selectedLog}
          onClose={handleClosePlayer}
          onSave={handleNewTranscript}
          recordingID={selectedLog.id}
          initialStatus={selectedLog.is_transcript_correct_show}
        />
      )}
    </div>
  );
};

export default PersonDetail;
