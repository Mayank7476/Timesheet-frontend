import { useEffect, useState } from "react";
import "./03timesheet-history.css";
const BASE_URL=import.meta.env.VITE_API_BASE_URL;

const TimesheetHistory = () => {
  const [activeTab, setActiveTab] = useState("submitted");
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // -------- FETCH TIMESHEET HISTORY ----------
  const fetchTimesheets = async (tab) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${BASE_URL}/api/history/timesheet-history?tab=${tab}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setTimesheets(data.timesheets || []);
    } catch (error) {
      alert("Failed to load timesheet history");
    } finally {
      setLoading(false);
    }
  }; 

  // Load data when tab changes
  useEffect(() => {
    fetchTimesheets(activeTab);
  }, [activeTab]);

  // -------- DATE FORMATTER ----------
  const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-GB", {
        timeZone: "UTC",
      })
    : "-";

  return (
    <div className="history-container">
      <h2 className="page-title">Timesheet-History</h2>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "submitted" ? "tab active" : "tab"}
          onClick={() => setActiveTab("submitted")}
        >
          Submitted
        </button>
        <button
          className={activeTab === "approved" ? "tab active" : "tab"}
          onClick={() => setActiveTab("approved")}
        >
          Approved
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && timesheets.length === 0 && (
        <p>No timesheets found</p>
      )}

      {/* TABLE */}
      {!loading && timesheets.length > 0 && (
        <table className="history-table">
          <thead>
            <tr>
              <th>Week Start</th>
              <th>Week End</th>
              <th>
                {activeTab === "approved"
                  ? "Approved On"
                  : "Submitted On"}
              </th>
              <th>Total Hour</th>
            </tr>
          </thead>
          <tbody>
            {timesheets.map((item) => (
              <tr key={item._id}>
                <td>{formatDate(item.weekStartDate)}</td>
                <td>{formatDate(item.weekEndDate)}</td>
                
                <td>
                  {activeTab === "approved"
                    ? formatDate(item.approvedAt)
                    : formatDate(item.submittedAt)}
                </td>
                <td>{item.totalHours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TimesheetHistory;

