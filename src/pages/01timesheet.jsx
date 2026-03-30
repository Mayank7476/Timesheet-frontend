  import React, { useEffect, useState } from "react";
  import "./01timesheet.css";
  import { autoAlert } from "../utility";
  import Loader from "../component/loader"
  const MAX_HOURS = 9;
  const BASE_URL=import.meta.env.VITE_API_BASE_URL;

  /* ---------- TIME HELPERS ---------- */

  const getCompanyNow = () => new Date();
//     {
//   return new Date("2026-02-20T10:00:00"); // 👈 set your custom date here
// };
  const getCompanyMonday = () => {
    const now = getCompanyNow();
    const day = now.getUTCDay();
    const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1);
     const monday = new Date(now);
  monday.setUTCDate(diff);
  monday.setUTCHours(0, 0, 0, 0);

  return monday;
  };

  const addDays = (date, days) => {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
};

  const getWeekDays = (monday) => {
  const today = getCompanyNow();
  today.setUTCHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);

    const isFuture = d.getTime() > today.getTime();

    return {
      label: d.toLocaleDateString("en-US", {
        weekday: "long",
        timeZone: "UTC",
      }),
      dateLabel: d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }),
      dateISO: d.toISOString().split("T")[0], // ✅ BEST for backend match
      isHoliday: false,
      isFuture,
    };
  });
};

 const formatWeekRange = (monday) => {
  const sunday = addDays(monday, 6);

  return `${monday.toLocaleDateString("en-GB", { timeZone: "UTC" })} - 
          ${sunday.toLocaleDateString("en-GB", { timeZone: "UTC" })}`;
};

  // ✅ Check if 17th rule applies


  /* ===================================================== */

  export default function TimeSheet() {
    const token = localStorage.getItem("token");

    const [weekStart, setWeekStart] = useState(null);
    const [minWeekStart, setMinWeekStart] = useState(null);
    const [days, setDays] = useState([]);
    const [projects, setProjects] = useState([]);
    const [entries, setEntries] = useState([]);
    const [status, setStatus] = useState("draft");
    const [loading, setLoading] = useState(true);
    const [leaveDates, setLeaveDates] = useState([]);

    const currentWeekMonday = getCompanyMonday();

    /* ---------- FETCH INITIAL WEEK ---------- */

    const fetchInitialWeek = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/timesheet/initial-week`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();

        const backendDate = new Date(data.weekStart);

        // Ensure Monday alignment on frontend too
        const day = backendDate.getUTCDay();
        const diff =backendDate.getUTCDate() - day + (day === 0 ? -6 : 1);
        backendDate.setUTCDate(diff);
        backendDate.setUTCHours(0, 0, 0, 0);

        setWeekStart(backendDate);
        setMinWeekStart(backendDate);
        
      } catch (err) {
        console.error("Initial week fetch failed", err);
      }
    };

  const fetchLeaves = async (monday) => {
    try {
      const res = await fetch(`${BASE_URL}/api/leave/getleave`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      const leaves = data.leaves || [];

      setLeaveDates(leaves);

      const baseDays = getWeekDays(monday);

      const updatedDays = baseDays.map((d) => ({
        ...d,
        isHoliday: leaves.includes(d.dateISO),
      }));

      setDays(updatedDays);
    } catch (err) {
      console.error("Leave fetch failed", err);
    }
  };
    /* ---------- FETCH WEEK DATA ---------- */

    const fetchWeek = async (monday) => {
      const sunday = addDays(monday, 6);

      const res = await fetch(
        `${BASE_URL}/api/timesheet/week?monday=${monday.toISOString()}&sunday=${sunday.toISOString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      const assignedProjects = data.assignedProjects || [];
      const savedEntries = data.exists
        ? data.timesheet.entries
        : [];

      const entryMap = new Map(
        savedEntries.map((e) => [e.projectId._id, e])
      );

      setProjects(
        assignedProjects.map((p) => ({
          id: p._id,
          name: p.projectName,
          code: p.projectCode,
        }))
      );

      setEntries(
        assignedProjects.map((p) => ({
          projectId: p._id,
          hours: entryMap.get(p._id)
            ? entryMap.get(p._id).hours.map(String)
            : Array(7).fill("0"),
        }))
      );

      setStatus(data.exists ? data.timesheet.status : "draft");
    };

    /* ---------- EFFECTS ---------- */

    useEffect(() => {
      fetchInitialWeek();
    }, []);

  useEffect(() => {
    if (!weekStart) return;

    const loadData = async () => {
      setLoading(true);
      try{
      await fetchWeek(weekStart);
      await fetchLeaves(weekStart);}
      catch (err) {
      console.error(err);}
      finally {
      setLoading(false); // ✅ STOP loader here
    }
    };

    loadData();
  }, [weekStart]);


    /* ---------- NAVIGATION ---------- */

    const goPrevWeek = () => {
      if (!minWeekStart) return;

      const prev = addDays(weekStart, -7);

      if (prev < minWeekStart) return;

      setWeekStart(prev);
    };

    const goNextWeek = () => {
      const next = addDays(weekStart, 7);

      if (next > currentWeekMonday) return;

      setWeekStart(next);
    };

    /* ---------- INPUT ---------- */

    const handleHoursChange = (row, day, value) => {
  if (value === "") {
    const updated = [...entries];
    updated[row].hours[day] = "0";
    setEntries(updated);
    return;
  }

  const newValue = Number(value);

  if (newValue < 0) return;

  // 🔥 Calculate total of this column excluding current row
  const otherRowsTotal = entries.reduce((sum, r, index) => {
    if (index === row) return sum;
    return sum + Number(r.hours[day] || 0);
  }, 0);

  // 🔥 Remaining hours allowed
  const remaining = MAX_HOURS - otherRowsTotal;

  // 🚫 Prevent overflow
  if (newValue > remaining) {
    autoAlert(`Only ${remaining} hours allowed for this day`);
    return;
  }

  const updated = [...entries];
  updated[row].hours[day] = value;
  setEntries(updated);
};
    /* ---------- TOTALS ---------- */

    const getDayTotal = (dayIndex) =>
      entries.reduce(
        (sum, row) => sum + Number(row.hours[dayIndex] || 0),
        0
      );

    const getWeekTotal = () =>
      entries.reduce(
        (sum, row) =>
          sum +
          row.hours.reduce(
            (s, h) => s + Number(h || 0),
            0
          ),
        0
      );


      //----------validation------------
const validateDayTotals = () => {

  const isPartialDay = isPartialSubmissionAllowed();

  // ✅ On 17 → validate ONLY till 17
  if (isPartialDay) {
    if (!isFilledTill17()) {
      autoAlert("Fill all days till 17 before submitting");
      return false;
    }
    return true;
  }

  // ✅ Normal validation
  if (!isWeekFullyFilled()) {
    autoAlert("Fill all required days before submitting");
    return false;
  }

  return true;
};


  //-----------------save api------------
        const saveDraft = async () => {
      const monday = weekStart;
    const sunday = addDays(weekStart, 6);


      await fetch(`${BASE_URL}/api/timesheet/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          monday: monday.toISOString(),
          sunday: sunday.toISOString(),
          entries: entries.map((e) => ({
            projectId: e.projectId,
            hours: e.hours.map((h) => Number(h) || 0),
          })),
        }),
      });

      autoAlert("Timesheet saved ✅");
    };

    /* ---------- Submit api ---------- */
 const submitTimesheet = async () => {
  const monday = weekStart;
  const sunday = addDays(weekStart, 6);

  const today = getCompanyNow();
  const todayDate = today.getUTCDate();

  // ✅ Check if week contains 17
  const weekIncludes17 =
    monday.getUTCDate() <= 17 && sunday.getUTCDate() >= 17;

  // ✅ Partial allowed only on 17
  const isPartialDay = todayDate === 17 && weekIncludes17;


  const fullWeek = isWeekFullyFilled();
  const till17Filled = isFilledTill17();

  let finalStatus = "";

  // 🔥 DECISION LOGIC
  if (isPartialDay) {
    if (!till17Filled) {
      autoAlert("Fill all required days till 17");
      return;
    }

    // If full week also filled → treat as full
    finalStatus = fullWeek
      ? "submitted"
      : "partially-submitted";

  } else {
    if (!fullWeek) {
      autoAlert("Fill all required days before submitting");
      return;
    }

    finalStatus = "submitted";
  }

  // ✅ API CALL
  const res = await fetch(`${BASE_URL}/api/timesheet/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      monday: monday.toISOString(),
      sunday: sunday.toISOString(),
      status: finalStatus,
    }),
  });

  if (!res.ok) {
    autoAlert("Submission failed");
    return;
  }

  // ✅ POST SUBMIT BEHAVIOR

  // 🔸 PARTIAL SUBMIT → DO NOT MOVE WEEK
  if (finalStatus === "partially-submitted") {
    autoAlert("Timesheet partially submitted ✅");
    setStatus("partially-submitted");

    return; // ⛔ STOP (very important)
  }

  // 🔸 FULL SUBMIT → MOVE WEEK
  autoAlert("Timesheet submitted ✅");
  setStatus("submitted");

  const nextWeek = addDays(monday, 7);

  setMinWeekStart(nextWeek);
  setWeekStart(nextWeek);
};


    // --------------toggle holiday and add leave-----------
    const toggleHoliday = async (index) => {
      const updated = [...days];
      const day = updated[index];
      day.isHoliday = !day.isHoliday;
      setDays(updated);

      if (day.isHoliday) {
        setEntries((prev) =>
          prev.map((row) => ({
            ...row,
            hours: row.hours.map((h, i) => i === index ? "0" : h
            ),
          }))
        );
      }

      await fetch(`${BASE_URL}/api/leave/markleave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: day.dateISO,
          isLeave: day.isHoliday,
        }),
      });
    };



    //----------save and submit and validation ---------
  const saveAndSubmit = async () => {
    if (!validateDayTotals()) { return }
    // const nextWeek = addDays(monday, 7);
    await saveDraft();      // ✅ first save
    await submitTimesheet();
    
  };

  const isPartialSubmissionAllowed = () => {
  const monday = weekStart;
  const sunday = addDays(monday, 6);

  const today = getCompanyNow();
  const todayDate = today.getUTCDate();

  const weekIncludes17 =
    monday.getUTCDate() <= 17 && sunday.getUTCDate() >= 17;

  return todayDate === 17 && weekIncludes17;
};

// ✅ Check if full week is filled
const isWeekFullyFilled = () => {
  for (let i = 0; i < days.length; i++) {
    const total = getDayTotal(i);

    if (days[i].isHoliday) continue;

    if (total === 0 && (i === 5 || i === 6)) continue;

    if (total <= 0) return false;
  }
  return true;
};
//check if i filled till 17
const isFilledTill17 = () => {
  for (let i = 0; i < days.length; i++) {
    const d = days[i];
    const total = getDayTotal(i);

    // extract date number (1–31)
    const dayDate = new Date(d.dateISO).getUTCDate();

    // 👉 ONLY check till 17
    if (dayDate > 17) continue;

    if (d.isHoliday) continue;

    // skip weekend if 0
    if (total === 0 && (i === 5 || i === 6)) continue;

    if (total <= 0) {
      return false;
    }
  }

  return true;
};

const isLockedTill17 = (dayIndex) => {
  if (status !== "partially-submitted" && status !== "partially-approved") {
    return false;
  }

  const d = days[dayIndex];
  const dayDate = new Date(d.dateISO).getUTCDate();

  return dayDate <= 17; // 🔒 lock till 17
};


    /* ---------- LOADING ---------- */

    if (loading) return (<Loader text="loading"/>);

    /* ---------- UI ---------- */

    return (
      <div className="bodies">
        <h2 className="page-title">Timesheet</h2>

        <div className="week-nav">
          <span
            onClick={goPrevWeek}
            style={{
              cursor:
                weekStart > minWeekStart
                  ? "pointer"
                  : "not-allowed",
              opacity:
                weekStart > minWeekStart ? 1 : 0.3,
            }}
          >
            ⬅️
          </span>

          <span>
            Week: {formatWeekRange(weekStart)}
          </span>

          <span
            onClick={goNextWeek}
            style={{
              cursor:
                weekStart < currentWeekMonday
                  ? "pointer"
                  : "not-allowed",
              opacity:
                weekStart < currentWeekMonday
                  ? 1
                  : 0.3,
            }}
          >
            ➡️
          </span>
        </div>
            <div className="tableupper">
        <table className="table-box">
          <thead>
            <tr>
              <th>Code</th>
              <th>Project</th>
              {days.map((d, i) => (
                <th key={i}>
                  <div>{d.label}</div>
                  <div>{d.dateLabel}</div>
                </th>
              ))}
              <th>Total</th>
            </tr>
            <tr>
              <th></th>
              <th>Holiday</th>
              {days.map((d,i)=>(
                <th key={i}>
                  <input type="checkbox"
                  disabled={status==="submitted"||status==="approved"||d.isFuture  }
                  checked={d.isHoliday}
                    onChange={() => toggleHoliday(i)
                      
                    }
                  />
                </th>
              ))}
              <th></th>
            </tr>
          </thead>

          <tbody>
            {projects.map((p, r) => (
              <tr key={p.id}>
                <td>{p.code}</td>
                <td>{p.name}</td>

                {days.map((d, c) => (
                  <td key={c}>
                    <input
                      type="number"
                      min="0"
                      max="9"
                      disabled={d.isHoliday||
                        status === "submitted"||status==="approved" || d.isFuture|| isLockedTill17(c) ||
    (
      getDayTotal(c) >= MAX_HOURS &&
      Number(entries[r]?.hours[c] || 0) === 0
    )
                      }
                      value={entries[r]?.hours[c] || ""}
                      onChange={(e) =>
                        handleHoursChange(
                          r,
                          c,
                          e.target.value
                        )
                      }
                    />
                  </td>
                ))}

                <td>
                  {entries[r]?.hours.reduce(
                    (sum, h) =>
                      sum + Number(h || 0),
                    0
                  )}
                </td>
              </tr>
            ))}

            <tr>
              <td></td>
              <td><strong>Total</strong></td>

              {days.map((_, c) => (
                <td key={c}>
                  <strong>{getDayTotal(c)}</strong>
                </td>
              ))}

              <td>
                <strong>{getWeekTotal()}</strong>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
        <div className="btn-con">
          <button className="submit-save" onClick={saveDraft} disabled={status === "submitted"}>
            Save
          </button>
          <button className="submit-save" onClick={saveAndSubmit} disabled={status === "submitted"}>
            Submit
          </button>
        </div>
      </div>
    );
}