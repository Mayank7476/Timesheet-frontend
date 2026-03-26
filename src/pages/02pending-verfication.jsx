import "./02pending-verification.css"
import { useEffect, useState } from "react";
import { autoAlert } from "../utility";
const BASE_URL=import.meta.env.VITE_API_BASE_URL;

const getWeekDaysForPopup = (weekStartDate) => {
  const start = new Date(weekStartDate);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);

    return {
      day: d.toLocaleDateString("en-US", {
        weekday: "long",
        timeZone: "UTC",
      }),
      date: d.toLocaleDateString("en-GB", {
        timeZone: "UTC",
      }),
      iso: d.toISOString().split("T")[0], // ✅ BEST
      isHoliday: false,
    };
  });
};


const PendingVerification = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
const [viewTimesheetData, setViewTimesheetData] = useState(null);
const [isEditMode, setIsEditMode] = useState(false);
const [popupDays, setPopupDays] = useState([]);
const [holidayDates, setHolidayDates] = useState([]);



  const token = localStorage.getItem("token");

  /* -------- DATE FORMATTER -------- */
  const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", {
    timeZone: "UTC",
  });



  const MAX_HOURS = 9;

const handleHoursChange = (row, day, value) => {
  if (value === "") {
    setViewTimesheetData((prev) => ({
      ...prev,
      entries: prev.entries.map((entry, i) =>
        i === row
          ? {
              ...entry,
              hours: entry.hours.map((h, j) =>
                j === day ? 0 : h
              ),
            }
          : entry
      ),
    }));
    return;
  }

  const newValue = Number(value);
  if (newValue < 0) return;

  const entries = viewTimesheetData.entries;

  // 🔥 total of column except current row
  const otherRowsTotal = entries.reduce((sum, r, index) => {
    if (index === row) return sum;
    return sum + Number(r.hours?.[day] || 0);
  }, 0);

  const remaining = MAX_HOURS - otherRowsTotal;

  // 🚫 block overflow
  if (newValue > remaining) {
    autoAlert(`Only ${remaining} hours allowed for this day`);
    return;
  }

  // ✅ update state correctly
  setViewTimesheetData((prev) => ({
    ...prev,
    entries: prev.entries.map((entry, i) =>
      i === row
        ? {
            ...entry,
            hours: entry.hours.map((h, j) =>
              j === day ? newValue : h
            ),
          }
        : entry
    ),
  }));
};


const getWeekTotal = () => {
  return entries.reduce(
    (sum, row) =>
      sum + row.hours.reduce((s, h) => s + Number(h || 0), 0),
    0
  );
};


  //done-------------------------

  /* -------- FETCH PENDING TIMESHEETS -------- */
  const fetchTimesheets = async (filters = {}) => {
    try {
      setLoading(true);


      const res = await fetch(
        `${BASE_URL}/api/pending-verification/pending`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setTimesheets(data.timesheets || []);
    } catch {
      autoAlert("Failed to load pending timesheets");
    } finally {
      setLoading(false);
    }
  };


  // done------------
  /* Load on page open */
  useEffect(() => {
    fetchTimesheets();
  }, []);




  /* -------- VERIFY / APPROVE -------- */
  const verifyTimesheet = async (id) => {
   

    const res = await fetch(
      `${BASE_URL}/api/pending-verification/${id}/verify`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      autoAlert("Approval failed");
      return;
    }

    // remove approved timesheet from UI
    setTimesheets((prev) => prev.filter((t) => t._id !== id));
    autoAlert("Timesheet Verified");
  };


  //done------------------------------
    const viewTimesheet = async (id, edit = false) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/pending-verification/pop/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      setViewTimesheetData(data.timesheet);
      setIsEditMode(edit);

      // 🔴 CHANGE: ALWAYS fetch & apply leaves
      await fetchLeavesForPopup(data.timesheet.weekStartDate);

      setShowViewPopup(true);
    } catch {
      autoAlert("Failed to load timesheet");
    }
  };


//done----------------------------------
 const fetchLeavesForPopup = async (weekStartDate) => {
    const res = await fetch(
      `${BASE_URL}/api/leave/getleave`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    const leaves = data.leaves || [];

    setHolidayDates(leaves);

    // 🔴 CHANGE: apply leaves to popup days
    setPopupDays(
      getWeekDaysForPopup(weekStartDate).map((d) => ({
        ...d,
        isHoliday: leaves.includes(d.iso),
      }))
    );
  };

//done----------------------------------
const toggleHoliday = async (index) => {
    const updatedDays = [...popupDays];
    const day = updatedDays[index];

    day.isHoliday = !day.isHoliday;
    setPopupDays(updatedDays);

    // 🔴 CHANGE: zero hours if holiday selected
    if (day.isHoliday) {
      setViewTimesheetData((prev) => ({
        ...prev,
        entries: prev.entries.map((row) => ({
          ...row,
          hours: row.hours.map((h, i) =>
            i === index ? 0 : h
          ),
        })),
      }));
    }

    // 🔴 CHANGE: SAME leave API as TimeSheet
    await fetch(`${BASE_URL}/api/leave/markleave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        date: day.iso,
        isLeave: day.isHoliday,
      }),
    });
  };

const savePopupTimesheet = async () => {
  try {
    const timesheetId = viewTimesheetData?._id;

    if (!timesheetId) {
      autoAlert("Timesheet ID missing");
      return;
    }
    const hasZeroDay = popupDays.some((d, dayIndex) => {
  const dayName = new Date(d.iso).getUTCDay(); // 0 = Sun, 6 = Sat

  // ✅ Skip Saturday & Sunday
  if (dayName === 0 || dayName === 6) return false;
       if (d.isHoliday) return false;
  const total = viewTimesheetData.entries.reduce(
    (sum, row) => sum + Number(row.hours?.[dayIndex] || 0),
    0
  );

  return total === 0;
});

    if (hasZeroDay) {
      autoAlert("Each day must have at least 1 hour");
      return;
    }

    const res = await fetch(
      `${BASE_URL}/api/pending-verification/popSave/${timesheetId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          entries: viewTimesheetData.entries.map((e) => ({
            projectId: e.projectId?._id || e.projectId,
            hours: e.hours.map((h) => Number(h) || 0),
          })),
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      autoAlert(data.message || "Failed to update timesheet");
      return;
    }

    autoAlert("Timesheet updated successfully ✅");

    setShowViewPopup(false);
    setViewTimesheetData(null);
    setIsEditMode(false);
    fetchTimesheets();

  } catch (err) {
    console.error(err);
    autoAlert("Something went wrong");
  }
};








  return (
    <div  className="pending-container">

      <h2 className="page-title">Pending for Approval</h2>

      
      

      {/* ---------- TABLE ---------- */}
      <table className="timesheet-table" >
        <thead >
          <tr>
            <th>Employee Code</th>
            <th>Employee Name</th>
            <th>Timesheet Period</th>
            <th>Total</th>
            <th>Action</th>
            <th>View</th>
          </tr>
        </thead>

        <tbody>
          {!loading && timesheets.length === 0 && (
            <tr>
              <td colSpan="6" className="empty-row" >
                No pending timesheets
              </td>
            </tr>
          )}

          {timesheets.map((ts) => (
            <tr key={ts._id}>
              <td>{ts.userId?.id||"not found"}</td>
              <td>{ts.userId?.name}</td>
              <td>
                {formatDate(ts.weekStartDate)} -{" "}
                {formatDate(ts.weekEndDate)}
              </td>
              <td>{ts.totalHours}</td>
              <td>
                <button className="action-btn verify-btn" onClick={() => verifyTimesheet(ts._id)} >
                  Verify
                </button>

                 <button className="action-btn reject-btn" onClick={() => viewTimesheet(ts._id,true) }>
                  Edit
                </button>
                
                
              </td>
              <td style={{ cursor: "pointer", color: "green" }} onClick={() => viewTimesheet(ts._id, false)}>
                     View
              </td>

            </tr>
          ))}
        </tbody>
      </table>

      {loading && <p>Loading...</p>}
        {showViewPopup && viewTimesheetData && (
  <div className="modaloverlay">

    <div className="modalbox">
      <h3>
        Timesheet (
        {formatDate(viewTimesheetData.weekStartDate)} –{" "}
        {formatDate(viewTimesheetData.weekEndDate)})
      </h3>

      <table className="timesheet-table">
        <thead>
          <tr>
              <th>Project</th>
              <th>Name</th>
              {getWeekDaysForPopup(viewTimesheetData.weekStartDate).map((d, i) => (
    <th key={i}>
      <div>{d.day}</div>
      <small>{d.date}</small>
    </th>
  ))}
              <th>Total</th>
            </tr>
          {/* 🔴 CHANGE: Holiday row driven by popupDays */}
          <tr>
            <th></th>
            <th>Holiday</th>

            {popupDays.map((d, i) => (
              <th key={i}>
                <input
                  type="checkbox"
                  checked={d.isHoliday}
                  disabled={!isEditMode}
                  onChange={() => toggleHoliday(i)}
                />
              </th>
            ))}

            <th></th>
          </tr>
        </thead>

        <tbody>
          {viewTimesheetData.entries.map((e, i) => (
            <tr key={i}>
              <td>{e.projectId.projectCode}</td>
              <td>{e.projectId.projectName}</td>

              {e.hours.map((h, j) => (
                <td key={j}>
                  {isEditMode ? (
                    <input
                      type="number"
                      min="0"
                      max="9"
                      value={h}

                     
                      disabled={popupDays[j]?.isHoliday}

                      onChange={(ev) =>
  handleHoursChange(i, j, ev.target.value)
}
                    />
                  ) : (
                    h
                  )}
                </td>
              ))}

              <td>
                {e.hours.reduce(
                  (sum, h) => sum + Number(h || 0),
                  0
                )}
              </td>
            </tr>
            
          ))}
          <tr className="total-3">
            <td></td>
            <td>total</td>
           {popupDays.map((_, c) => (
    <td key={c}>
      {viewTimesheetData.entries.reduce(
        (sum, row) => sum + Number(row.hours?.[c] || 0),
        0
      )}
    </td>
  ))}

  {/* Week Grand Total */}
  <td>
    {viewTimesheetData.entries.reduce(
      (total, row) =>
        total +
        (row.hours?.reduce(
          (sum, h) => sum + Number(h || 0),
          0
        ) || 0),
      0
    )}
</td>
          </tr>
        </tbody>
      </table>
<div className="btn-con">
      {isEditMode && (
  <button className="submit-save" onClick={savePopupTimesheet}>
    Save
  </button>
)}

      <button
        className="submit-save"
        onClick={() => {
          setShowViewPopup(false);
          setViewTimesheetData(null);
          setIsEditMode(false); // 🔴 CHANGE: reset edit mode
        }}
      >
        Close
      </button>
      </div>
    </div>
  </div>
)}


      </div>
      
    );
  };

export default PendingVerification;
