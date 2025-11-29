import { useState } from "react";
import axios from "axios";

function DownloadStatementModal({ show, onClose }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleDownload = async () => {
    try {
      const res = await axios.get(
        `/api/auth/download-excel?fromDate=${fromDate}&toDate=${toDate}`,
        { responseType: "blob" } // 👈 Important for file download
      );
console.log(res)
    //   return
      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "payout_statement.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      onClose();
    } catch (error) {
         if (error.response && error.response.status === 401) {
      toast.error('Unauthorized access. Please log in again.')

      // navigate('/login')
      window.location.reload();

    }
      console.error("Download Error:", error);
      alert("Failed to download statement");
    }
  };

  return (
    <div className={`modal ${show ? "d-block" : "d-none"}`} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3 shadow">
          <div className="modal-header">
            <h5 className="modal-title">Download Statement</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-control mb-3"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />

            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button className="btn btn-success" onClick={handleDownload}>
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DownloadStatementModal;
