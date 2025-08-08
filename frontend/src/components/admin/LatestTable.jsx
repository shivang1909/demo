import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Eye,
  Phone,
  Mail,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const LatestTable = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch latest records
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/client/getall",
          {
            withCredentials: true,
          }
        );
        // Only take latest 10 records
        const sorted = response.data?.slice().reverse().slice(0, 10);
        setRecords(sorted || []);
      } catch (error) {
        console.error("Failed to fetch records:", error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  return (
    <div className="w-full bg-white max-w-7xl mx-auto shadow-inner rounded-lg overflow-hidden border border-gray-200 mt-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Latest Records</h2>
        <p className="text-sm text-gray-600 mt-1">
          Showing the 10 most recent entries
        </p>
      </div>

      {/* Table or loading */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : records.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No records found.</div>
        ) : (
          <table className="w-full min-w-max">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Docs
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record, index) => (
                <tr
                  key={record._id || index}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {record.name || "-"}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate max-w-[120px] sm:max-w-none">
                        {record.email || "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">
                        {record.mobile?.value || "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-start text-sm text-gray-600">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-400" />
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {record.documents.length || 0} Documents
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Showing {records.length} of {records.length} results
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="p-1 rounded-md text-gray-400 hover:text-gray-500 cursor-not-allowed"
              disabled
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-3 py-1 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md">
              1
            </span>
            <button
              className="p-1 rounded-md text-gray-400 hover:text-gray-500 cursor-not-allowed"
              disabled
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestTable;
