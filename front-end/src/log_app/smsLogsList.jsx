import { useEffect, useState } from "react";
import api from "../common/api";

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
            <li key={index} className={`${log.status ? "bg-green-300" : "bg-red-300"} flex justify-between shadow-md rounded-lg p-4`}>
              <p className="text-sm font-semibold">شماره تلفن: {log.phone_number}</p>
            </li>
          ))
        ) : (
          <li className="text-gray-500">No SMS logs available.</li>
        )}
      </ol>
    </div >
  );
};

export default SmsLogsListPage;
