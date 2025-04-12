import { useEffect, useState } from "react";
import { api } from "../common/api";
import SMSLog from "./smsLog.jsx"

const SmsLogsListPage = () => {
  const [smsLogs, setSmsLogs] = useState([]);

  useEffect(() => {
    const fetchSmsLogs = async () => {
      try {
        const response = await api.get("logs/smsLogs/");
        // Ensure response.json is an array
        if (Array.isArray(response.data)) {
          setSmsLogs(response.data);
        } else {
          console.error("Expected an array but received:", response.json);
          setSmsLogs([]); // Set to empty array if the response is not valid
        }
      } catch (error) {
        console.error("Error occurred: ", error);
        setSmsLogs([]); // Set to empty array on error
      }
    };

    fetchSmsLogs();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">لاگ پیام ها</h1>
      <ol className="list-decimal pl-5 space-y-2">
        {smsLogs.length > 0 ? (
          smsLogs.map((log, index) => (
            <SMSLog smsLog={log} key={index} />
          ))
        ) : (
          <li className="text-gray-500">No SMS logs available.</li>
        )}
      </ol>
    </div >
  );
};

export default SmsLogsListPage;
