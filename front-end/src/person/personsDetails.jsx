import React from 'react';
import AudioPlayerWithTranscript from "./audioPlayerTranscript.jsx";
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from "../common/api";

const PersonDetail = ({ person }) => {
  const [callLogs, setCallLogs] = React.useState([]);
  const [loadingLogs, setLoadingLogs] = React.useState(false);
  const [errorLogs, setErrorLogs] = React.useState(null);
  const [selectedLog, setSelectedLog] = React.useState(null);
  const [processedTranscript, setProcessedTranscript] = React.useState(null);


  
    // In your parent component
    const handleNewTranscript = (updatedTranscript) => {
	const updatedTranscriptString = JSON.stringify(updatedTranscript)
      // Update your state or make API call
      api.patch(`/logs/call-recordings/${selectedLog.id}/`, {
	recording_transcription: updatedTranscriptString
      }).then(response => {
	
	const { segments, metadata } = parseTranscriptString(selectedLog.recording_transcription);
	
	setSelectedLog({
	  ...selectedLog,
	  transcriptSegments: segments,
	  metadata: metadata
	});
      }).catch(error => console.log(`error: ${error}`));
    };


  const handleShowPlayer = (log) => {
      try {
	// Parse the transcript string if it exists
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
	  formattedTranscript: "Error loading transcript",
	  metadata: {}
	});
      }
    };

    function parseTranscriptString(transcriptString) {
      try {
	// 1. First, clean the string by handling common issues
	let cleanedString = transcriptString
	  // Remove surrounding parentheses if they exist
	  .replace(/^\(|\)$/g, '')
	  // Replace single quotes with double quotes for JSON compatibility
	  .replace(/'/g, '"')
	  // Fix any trailing commas that might break parsing
	  .replace(/,\s*]/g, ']')
	  .replace(/,\s*}/g, '}');

	// 2. Split into segments and metadata parts
	const lastBracketIndex = cleanedString.lastIndexOf(']');
	const segmentsPart = cleanedString.substring(0, lastBracketIndex + 1);
	const metadataPart = cleanedString.substring(lastBracketIndex + 2); // Skip comma and space

	// 3. Parse each part separately
	const segments = JSON.parse(segmentsPart);
	// const metadata = JSON.parse(metadataPart);

	return { segments, metadataPart };
      } catch (error) {
	console.error('Failed to parse transcript:', error);
	// Return a fallback object if parsing fails
	return {
	  segments: [{ text: "Error: Could not parse transcript" }],
	  metadata: {}
	};
      }
    }

  React.useEffect(() => {
    if (person?.id) {
      api.get(`logs/call-recordings/?person_id=${person.id}`)
        .then(response => {
          setLoadingLogs(true);
          setErrorLogs(null);
          setCallLogs(response.data); 
        })
        .catch(error => {
          setErrorLogs('Failed to load call logs');
          console.log(error)
        })
        .finally(() => {
          setLoadingLogs(false)
        })
    }
  }, [person?.id]);


  const handleClosePlayer = () => {
    setSelectedLog(null);
  };

  // Format date of birth for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR'); // Persian date format
  };

  // Format datetime for display
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Never contacted';
    const dateTime = new Date(dateTimeString);
    return dateTime.toLocaleString('fa-IR'); // Persian datetime format
  };

  // Get gender display value
  const getGenderDisplay = () => {
    if (!person.gender) return 'Not specified';
    return person.gender === 'F' ? 'خانم' : 'آقا';
  };

  // Get call type display value
  const getCallTypeDisplay = (type) => {
    return type === 'inbound' ? 'ورودی' : 'خروجی';
  };

  if (!person) {
    return <div className="p-4 text-gray-500">No person data available</div>;
  }

  return (
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
        <p>تاریخ ایجاد: {new Date(person.created_at).toLocaleString('fa-IR')}</p>
        <p>آخرین بروزرسانی: {new Date(person.updated_at).toLocaleString('fa-IR')}</p>
      </div>

      {/* Audio Player Dialog */}
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

const PersonDetailsPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.person) {
    return (
      <div className="p-4 text-red-500">
        اطلاعات شخص یافت نشد
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
      <button 
        onClick={() => navigate('/persons')}
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        بازگشت به لیست
      </button>
      <PersonDetail person={state.person} />
    </div>
  );
};

export default PersonDetailsPage;
