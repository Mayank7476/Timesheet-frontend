import { useState, useEffect } from "react";
import "./04leave-history.css";
const BASE_URL=import.meta.env.VITE_API_BASE_URL;


const LeaveHistory = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // ✅ leave dates fetched from backend (YYYY-MM-DD)
  const [leaveDates, setLeaveDates] = useState([]);

  const token = localStorage.getItem("token");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  /* ---------- Month Navigation ---------- */
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  /* ---------- Fetch Leave History ---------- */
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/leave/getleave`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        // Expected format: ["YYYY-MM-DD"]
        setLeaveDates(data.leaves || []);
      } catch (error) {
        console.error("Failed to fetch leave history", error);
      }
    };

    fetchLeaves();
  }, [currentDate]); // refetch on month change

  /* ---------- Check Leave Day ---------- */
  const isLeaveDay = (day) => {
  const dateObj = new Date(year, month, day);
  const dayNumber = dateObj.getDay();
  const isWeekend = dayNumber === 0 || dayNumber === 6;

  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;

  return leaveDates.includes(dateStr);
};

  /* ---------- Render ---------- */
  return (
    <div className="leave-container">
      <h2 className="page-title">Leave History</h2>

      {/* Month Navigation */}
      <div className="calendar-header">
        <button onClick={prevMonth}>◀</button>
        <h3>
          {currentDate.toLocaleString("default", { month: "long" })} {year}
        </h3>
        <button onClick={nextMonth}>▶</button>
      </div>

      {/* Days Header */}
      <div className="calendar-grid-header">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="day-name">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {/* Empty cells before first day */}
        {Array(firstDayOfMonth)
          .fill(null)
          .map((_, i) => (
            <div key={`empty-${i}`} className="empty"></div>
          ))}

        {/* Month Days */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
          <div
            key={day}
            className={`calendar-day ${
              isLeaveDay(day) ? "leave-day" : ""
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveHistory;
