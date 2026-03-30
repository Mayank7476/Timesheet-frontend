import React, {useState } from "react";
import "./09Report.css";
import {autoAlert} from "../utility";

import * as XLSX from "xlsx";   // ⭐ NEW
import { saveAs } from "file-saver";   // ⭐ NEW
import Loader from "../component/loader";
const BASE_URL=import.meta.env.VITE_API_BASE_URL;

const Report = () => {

  const [reports, setReports] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [loading,setLoading]=useState(false);

  const token = localStorage.getItem("token");

  const fetchReport = async () => {
      setLoading(true);
    if (!fromDate || !toDate) {
      autoAlert("Please select date range");
      return;
    }


    try {

      const res = await fetch(
        `${BASE_URL}/api/report/getReportfron`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            fromDate,
            toDate
          })
        }
      );

      const data = await res.json();
      
      setReports(data);

    } catch (error) {
      console.error("Failed to fetch report", error);
    }
    finally{
      setLoading(false);
    }
  };


// ⭐ EXPORT TO EXCEL FUNCTION
const exportToExcel = () => {

  if (reports.length === 0) {
    autoAlert("No data to export");
    return;
  }
 setLoading(true);
  const excelData = [];

  reports.forEach(emp => {

    emp.details.forEach(d => {

      excelData.push({
        "Employee Code": emp.employeeCode,
        "Employee Name": emp.employeeName,
        "Project Code": d.projectCode,
        "Project Name": d.projectName,
        "Date": new Date(d.date).toLocaleDateString(),
        "Hours": d.hours
      });

    });

  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Timesheet Report");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array"
  });

  const data = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  saveAs(data, `Timesheet_Report_${fromDate}_to_${toDate}.xlsx`);
  setLoading(false);
};

const exportProjectReport = () => {

  if (reports.length === 0) {
    autoAlert("No data to export");
    return;
  }
  setLoading(true);
  const projectMap = new Map();

  reports.forEach(emp => {

    emp.details.forEach(d => {

      const key = d.projectCode;

      if (!projectMap.has(key)) {
        projectMap.set(key, {
          "Project Code": d.projectCode,
          "Project Name": d.projectName,
          "Total Hours": 0
        });
      }

      projectMap.get(key)["Total Hours"] += d.hours;

    });

  });

  const projectData = Array.from(projectMap.values());

  const worksheet = XLSX.utils.json_to_sheet(projectData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Project Report");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array"
  });

  const data = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  saveAs(data, `Project_Report_${fromDate}_to_${toDate}.xlsx`);
  setLoading(false);
};

  if(loading) return <Loader/>;
  return (
    <div className="report-bodies">

      <h2 className="page-title">Report</h2>

      {/* Date Filters */}
      <div className="report-filters">

        <label>From Date</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />

        <label>To Date</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />

        <button className="new-buttonof" onClick={fetchReport}>
          Generate Report
        </button>

        {/* ⭐ NEW EXPORT BUTTON */}
        <button className="export-button" onClick={exportToExcel}>
          Export Excel
        </button>
        <button className="export-button" onClick={exportProjectReport}>
          Export Project
        </button>
      </div>

      <table className="report-table">

       <thead>
<tr>
  <th></th>
  <th>Emp Code</th>
  <th>Employee Name</th>
  <th>Total Hours</th>
</tr>
</thead>

        <tbody>

{reports.length === 0 ? (
  <tr>
    <td colSpan="3">No data found</td>
  </tr>
) : (
  reports.map((emp, index) => (
    <React.Fragment key={index}>

      {/* Employee Row */}
      <tr
        className="employee-row"
        onClick={() =>
          setExpandedRow(expandedRow === index ? null : index)
        }
      >

        <td className="expand-icon">
          {expandedRow === index ? "▼" : "▶"}
        </td>

        <td>{emp.employeeCode}</td>
        <td>{emp.employeeName}</td>
        <td className="total-hours">{emp.totalHours}</td>

      </tr>

      {/* Expanded Detail */}
      {expandedRow === index && (
        <tr className="detail-row">
          <td colSpan="4">

            <table className="inner-table">

              <thead>
                <tr>
                  <th>Project Code</th>
                  <th>Project Name</th>
                  <th>Date</th>
                  <th>Hours</th>
                </tr>
              </thead>

              <tbody>
                {emp.details.map((d, i) => (
                  <tr key={i}>
                    <td>{d.projectCode}</td>
                    <td>{d.projectName}</td>
                    <td>{new Date(d.date).toLocaleDateString()}</td>
                    <td>{d.hours}</td>
                  </tr>
                ))}
              </tbody>

            </table>

          </td>
        </tr>
      )}

    </React.Fragment>
  ))
)}

</tbody>
      </table>

    </div>
  );
};

export default Report;