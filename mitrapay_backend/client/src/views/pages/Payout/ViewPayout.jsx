import React, { useEffect, useState } from 'react'
import { FaSearch, FaPlus, FaEdit, FaEllipsisV, FaDownload, FaEye, FaSync } from 'react-icons/fa'
import { MdRefresh } from "react-icons/md";
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import Pagination from '../../../components/Pagination' // use shared component
import { useSelector } from 'react-redux'
import { CCol, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CFormInput, CRow, CSpinner } from '@coreui/react'
import { Modal, Button, Dropdown } from 'react-bootstrap'
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { socket } from '../../../socket.js'
import DownloadStatementModal from "./DownloadStatementModal.js";

// 🎨 DARK MODE COLOR PALETTE
const CUSTOM_PRIMARY = "#ff6600"; // Vibrant Orange (Your original color)
const DARK_BG = "#1e1e1e"; // Main background
const CARD_BG = "#2c2c2c"; // Card/Container background
const LIGHT_BG = "#383838"; // Lighter dark for subtle contrast/input
const TEXT_COLOR_LIGHT = "#ffffff"; // Light text for readability
const TEXT_COLOR_MUTED = "#b3b3b3"; // Muted text
const INPUT_BORDER_COLOR = "#555555"; // Input border in dark mode
const ACCENT_SUBTLE_DARK = "rgba(255, 102, 0, 0.2)"; // Light orange tint for dark mode headers/modals

function ViewPayout() {
  const [payouts, setPayouts] = useState([])
  const [searchTerm, setSearchTerm] = useState({ searchKey: '', startdate: '', enddate: '' })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const { user, error, isAuthenticated } = useSelector((state) => state.user)

  const [showModal, setShowModal] = useState(false)
  const [utrCapture, setsetutrCapture] = useState(false)
  const [showModalutr, setshowModalutr] = useState(false)
  const [loading, setloading] = useState(false)
  const [ShoweditModal, setShoweditModal] = useState(false)
  const [ShowstatementModal, setShowstatementModal] = useState(false)
  const [selectedPayout, setSelectedPayout] = useState(null)
  const navigate = useNavigate();

  // --- Utility Functions (KEPT UNCHANGED for brevity, only included function names) ---

  const handleView = (payout) => {
    setSelectedPayout(payout)
    setShowModal(true)
  }
  const handleedit = (payout) => {
    setSelectedPayout(payout)
    setShoweditModal(true)
  }
  const handlestatement = (payout) => {
    setShowstatementModal(true)
  }

  useEffect(() => {
    fetchPayouts()
  }, [page, searchTerm])

  const fetchPayouts = async () => {
    setloading(true)
    try {
      const endpoint =
        searchTerm.searchKey.trim() == '' && searchTerm.startdate.trim() === '' && searchTerm.enddate.trim() === ''
          ? `/api/auth/view_payout?page=${page}&limit=${limit}`
          : `/api/auth/search_Payout?searchKey=${encodeURIComponent(searchTerm.searchKey)}&page=${page}&limit=${limit}&startDate=${encodeURIComponent(searchTerm.startdate)}&endDate=${encodeURIComponent(searchTerm.enddate)}`


      const res = await axios.get(endpoint, { withCredentials: true })

      const data = res.data

      setloading(false)
      setPayouts(
        (data.payouts || []).map((payout) => ({
          ...payout,
          loadingStatus: false,
        })),
      )
      setTotalPages(data.pages || 1)
    } catch (err) {
      setloading(false)

      toast.error('Failed to fetch payouts')
      console.error('Error fetching payouts:', err)
      if (err.response && err.response.status === 401) {
        toast.error('Unauthorized access. Please log in again.')
        window.location.reload();
      }
    }
  }
  const utrfetch = async () => {
    console.log(payouts)
  }
  const handleNotification = (data) => {
    console.log(data)
    fetchPayouts()
  }

  useEffect(() => {
    socket.on("refreshpayout", (data) => {
      handleNotification(data)
    });

    return () => {
      socket.off("refreshpayout");
    };
  }, []);



  const handleshowutr = async (data) => {
    try {
      // return
      await axios.get(
        `/api/auth/Find_utr/${data.transaction_id}`,
        { data },
        { withCredentials: true },
      ).then((response) => {
        setsetutrCapture(`${response.data.utr}`)
        setshowModalutr(true)
        setTimeout(() => {
          fetchPayouts()
        }, 2000);
      }
      )

    } catch (error) {
      toast.error(error.response?.data.message || 'Error raising claim')
      if (error.response && error.response.status === 401) {
        toast.error('Unauthorized access. Please log in again.')
        window.location.reload();
      }
      console.error('Error raising claim:', error)
    }
  }

  const handleDownloadExcel = () => {
    const dataToExport = payouts
      // ✅ First filter payouts where utr is empty
      .filter((payout) => payout.utr === "")
      // ✅ Then map to your required export structure
      .map((payout) => ({
        "Payment Amount (Request)": payout.Amount,
        "IFSC CODE": payout["BIC / SWIFT / IFSC Code"] || payout.ifsc,
        "Beneficiary Account No": payout["Beneficiary Account No"] || payout.accountNumber,
        "Beneficiary Name (Request)": payout["Beneficiary Name"] || payout.name,
        "Phone/Mobile No": "",
        "Email": "",
        REMARKS: payout.remark,
        "Payment Instructions 1": payout.remark,
        "CCY": "INR",
      }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payouts')

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, `payouts_${new Date().toISOString()}.xlsx`)
  }

  const approvedpayout = async (id, status, utr, transaction_id, remark, Payment_By, Amount) => {
    if (status !== "approved") {
      utr = ''
    }
    try {
      const response = await axios.post(
        `/api/auth/Approve_payout`, { id, status, utr, transaction_id, remark, Payment_By, Amount })
      fetchPayouts()
      toast.success('Payout successfully updated.')
    }
    catch (error) {
      console.error('Error approving payout:', error)
      toast.error(error.response?.data?.message || "Failed to update payout.")
      if (error.response && error.response.status === 401) {
        toast.error('Unauthorized access. Please log in again.')
        window.location.reload();
      }
    }
  }

  const downloadPdf = async () => {
    const input = document.getElementById('list-group');
    if (!input) return;

    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const ratio = pdfWidth / imgWidth;
      const newImgHeight = imgHeight * ratio;

      let position = 0;
      let heightLeft = newImgHeight;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, newImgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - newImgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, newImgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`payout-details-${selectedPayout?.transaction_id || 'N-A'}.pdf`);
    } catch (e) {
      toast.error("Failed to generate PDF.");
      console.error(e);
    }
  };


  // --- UI START (DARK MODE MODIFIED) ---
  return (
    <div className="container-fluid py-4" style={{ minHeight: '100vh', backgroundColor: DARK_BG, color: TEXT_COLOR_LIGHT }}>
      {/* Header */}
      {/* Set primary color for prominent elements */}
      <div className="border-bottom px-3 px-md-5 py-3 shadow-sm mb-4" style={{ backgroundColor: CARD_BG, borderColor: INPUT_BORDER_COLOR }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div className="d-flex align-items-center">
            {/* Back button - Changed to orange outline */}
            <button
              type="button"
              className="btn btn-outline-secondary rounded-circle me-3"
              style={{ width: '40px', height: '40px', borderColor: CUSTOM_PRIMARY, color: CUSTOM_PRIMARY }}
              onClick={() => navigate(-1)}
            >
              <i className="fas fa-arrow-left fs-6" style={{ color: TEXT_COLOR_LIGHT }}></i>
            </button>
            <h2 className="fw-bold mb-0" style={{ color: TEXT_COLOR_LIGHT }}>Transaction Management</h2>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* User Avatar & Role */}
            <img
              src="https://storage.googleapis.com/a1aa/image/bc142717-90f8-44af-ea05-493b2c81045c.jpg"
              alt="Admin Avatar"
              // Added border-primary-custom
              className="rounded-circle border"
              style={{ borderColor: CUSTOM_PRIMARY }}
              width="48"
              height="48"
            />
            <div className="text-end">
              <div className="fw-bold" style={{ color: TEXT_COLOR_LIGHT }}>{user.Name}</div>
              {user.role !== 'User' && (
                // Orange badge
                <div className="badge text-uppercase small text-white" style={{ backgroundColor: CUSTOM_PRIMARY }}>{user.role}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls - Search, Filters, Actions */}
      <div className="p-4 shadow-sm mx-3 mx-md-5 mb-4 border rounded-3" style={{ backgroundColor: CARD_BG, borderColor: INPUT_BORDER_COLOR }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3">

          {/* Search Input - Used orange accent for icon */}
          <div className="flex-grow-1" style={{ maxWidth: '450px' }}>
            <div className="input-group input-group-sm rounded-3 overflow-hidden shadow-sm" style={{ border: `1px solid ${INPUT_BORDER_COLOR}` }}>
              <span className="input-group-text border-0" style={{ backgroundColor: LIGHT_BG }}>
                <FaSearch style={{ color: CUSTOM_PRIMARY }} />
              </span>
              <input
                type="text"
                className="form-control border-0 pe-3"
                placeholder="Search by UTR, Name, or Account No."
                value={searchTerm.searchKey}
                onChange={(e) => {
                  (setSearchTerm({ ...searchTerm, searchKey: e.target.value }))
                  setPage(1)
                }}
                style={{ backgroundColor: LIGHT_BG, color: TEXT_COLOR_LIGHT }}
              />
            </div>
          </div>

          {/* Date Filters */}
          <div className="d-flex gap-2">
            <CFormInput
              type="date"
              id="startDate"
              className="form-control-sm rounded-3"
              value={searchTerm.startdate} onChange={(e) => {
                (setSearchTerm({ ...searchTerm, startdate: e.target.value }))
                setPage(1)
              }}
              aria-label="Start Date"
              style={{ backgroundColor: LIGHT_BG, color: TEXT_COLOR_LIGHT, borderColor: INPUT_BORDER_COLOR }}
            />
            <CFormInput
              type="date"
              id="endDate"
              className="form-control-sm rounded-3"
              value={searchTerm.enddate} onChange={(e) => {
                (setSearchTerm({ ...searchTerm, enddate: e.target.value }))
                setPage(1)
              }}
              aria-label="End Date"
              style={{ backgroundColor: LIGHT_BG, color: TEXT_COLOR_LIGHT, borderColor: INPUT_BORDER_COLOR }}
            />
          </div>

          {/* Action Buttons - Orange primary button */}
          <div className="d-flex flex-wrap gap-2 justify-content-end">
            <button
              onClick={fetchPayouts}
              className="btn btn-outline-secondary btn-sm d-flex align-items-center rounded-3"
              style={{ color: TEXT_COLOR_LIGHT, borderColor: INPUT_BORDER_COLOR }}
            >
              <FaSync className="me-2" />
              Refresh
            </button>
            <Link to="/SendMoney" className="btn btn-sm text-white d-flex align-items-center rounded-3" style={{ backgroundColor: CUSTOM_PRIMARY, border: `1px solid ${CUSTOM_PRIMARY}` }}>
              <FaPlus className="me-2" />
              New Payout
            </Link>
            <button className="btn btn-success btn-sm d-flex align-items-center rounded-3" onClick={handleDownloadExcel}>
              <FaDownload className="me-2" />
              Download Pending
            </button>
            <button
              className="btn btn-outline-info btn-sm d-flex align-items-center rounded-3"
              onClick={() => setShowstatementModal(true)}
              style={{ color: 'lightblue', borderColor: 'lightblue' }}
            >
              <FaDownload className="me-2" />
              Export Statement
            </button>
          </div>
        </div>
      </div>

      {/* Table - Desktop View */}
      <div className="px-3 px-md-5 pb-4">
        <div className="table-responsive border rounded-3 shadow-sm d-none d-md-block" style={{ backgroundColor: CARD_BG, borderColor: INPUT_BORDER_COLOR }}>
          {/* Custom table-dark equivalent styling */}
          <table className="table table-hover align-middle mb-0" style={{ color: TEXT_COLOR_LIGHT }}>
            {/* Table Header: Light orange background */}
            <thead style={{ backgroundColor: LIGHT_BG, borderBottom: `1px solid ${INPUT_BORDER_COLOR}` }}>
              <tr>
                <th className='text-nowrap' style={{ color: TEXT_COLOR_LIGHT }}>Amount (₹)</th>
                {(user.role === "Super_Admin" || user.role === "Sub_Admin") && user.email !== "tiger@gmail.com" && <th className='text-nowrap' style={{ color: TEXT_COLOR_LIGHT }}>Bank UTR</th>}
                <th className='text-nowrap' style={{ color: TEXT_COLOR_LIGHT }}>Order Id</th>
                <th className='text-nowrap' style={{ color: TEXT_COLOR_LIGHT }}>Date</th>
                <th className='text-nowrap' style={{ color: TEXT_COLOR_LIGHT }}>Status</th>
                <th className="text-nowrap" style={{ color: TEXT_COLOR_LIGHT }}>Beneficiary Name</th>
                <th className='text-nowrap' style={{ color: TEXT_COLOR_LIGHT }}>Beneficiary Code</th>
                <th className='text-nowrap' style={{ color: TEXT_COLOR_LIGHT }}>Beneficiary A/c No.</th>
                <th className='text-nowrap' style={{ color: TEXT_COLOR_LIGHT }}>IFSC Code</th>
                <th className='text-nowrap' style={{ color: TEXT_COLOR_LIGHT }}>Bank Name</th>
                <th className='text-nowrap' style={{ color: TEXT_COLOR_LIGHT }}>Payment Method</th>
                <th className='text-nowrap' style={{ color: TEXT_COLOR_LIGHT }}>Remark</th>
                <th className='text-nowrap' style={{ color: TEXT_COLOR_LIGHT }}>Paid By</th>
                {/* Sticky header background must match table-light/accent subtle */}
                <th className='text-nowrap' style={{ position: 'sticky', right: 0, zIndex: 2, backgroundColor: LIGHT_BG, color: TEXT_COLOR_LIGHT }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="13" className="text-center py-5">
                    <CSpinner style={{ color: CUSTOM_PRIMARY }} />
                  </td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan="13" className="text-center py-4" style={{ color: TEXT_COLOR_MUTED }}>
                    No payouts found matching criteria.
                  </td>
                </tr>
              ) : (
                payouts.map((payout, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? CARD_BG : LIGHT_BG }}>
                    <td><span className='fw-semibold' style={{ color: CUSTOM_PRIMARY }}>{payout.Amount.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR'
                    })}</span></td>

                    {(user.role === "Super_Admin" || user.role === "Sub_Admin") && user.email !== "tiger@gmail.com" && <td className='small' style={{ color: TEXT_COLOR_MUTED }}>{payout.utr || '-'}</td>}
                    <td className='small' style={{ color: TEXT_COLOR_MUTED }}>{payout.order_id || '-'}</td>
                    <td className='small text-nowrap' style={{ color: TEXT_COLOR_MUTED }}>
                      {new Date(payout.createdAt).toLocaleString("en-Us", {
                        timeZone: "Asia/Kolkata",
                      })}
                    </td>
                    <td>
                      <span
                        // Standard colors for status
                        className={`badge text-uppercase fw-semibold ${payout.status === "COMPLETED" ? "bg-success" : payout.status === "Pending" ? "bg-warning text-dark" : "bg-danger"}`}
                      >
                        {payout.status}
                      </span>
                    </td>
                    {/* <td className="text-nowrap fw-medium" style={{ color: TEXT_COLOR_LIGHT }}>
                      <span
                        className="px-3 py-1 text-sm font-medium rounded-md text-white whitespace-nowrap"
                        style={{
                          backgroundColor:
                            payout.Credit_status?.toLowerCase().startsWith("confirmed")
                              ? "#198754" // green
                              : payout.Credit_status?.toLowerCase().startsWith("pending")
                                ? "#ffc107" // yellow
                                : payout.Credit_status?.toLowerCase().startsWith("rejected")
                                  ? "#dc3545" // red
                                  : "transparentno", // default (gray if nothing matches)

                          // width: '128px',
                          // height: '60px',
                          borderRadius: '17px',
                          display: 'inline-block',
                          textAlign: "center"
                        }}
                      >
                        {payout.Credit_status}
                      </span>

                    </td> */}

                    <td className="text-nowrap fw-medium" style={{ color: TEXT_COLOR_LIGHT }}>{payout["Beneficiary Name"] || payout.name}</td>
                    <td className="text-nowrap small" style={{ color: TEXT_COLOR_MUTED }}>{payout["Beneficiary Code"] || '-'}</td>
                    <td className="text-nowrap small" style={{ color: TEXT_COLOR_LIGHT }}>{payout["Beneficiary Account No"] || payout.accountNumber}</td>
                    <td className="text-nowrap small" style={{ color: TEXT_COLOR_LIGHT }}>{payout["BIC / SWIFT / IFSC Code"] || payout.ifsc}</td>
                    <td className="text-nowrap small" style={{ color: TEXT_COLOR_MUTED }}>{payout["Beneficiary Bank Name"] || '-'}</td>
                    <td className="text-nowrap small" style={{ color: TEXT_COLOR_MUTED }}>{payout["Payment Method Name"] || '-'}</td>
                    <td className="text-nowrap small" style={{ color: TEXT_COLOR_MUTED }}>{payout.remark || '-'}</td>
                    <td className="text-nowrap small text-info">{payout.Payment_By?.[0]?.email || '-'}</td>

                    <td
                      // Important for sticky column
                      style={{
                        position: "sticky",
                        right: 0,
                        zIndex: 7,
                        cursor: "pointer",
                        backgroundColor: index % 2 === 0 ? CARD_BG : LIGHT_BG, // Match row background
                      }}
                    >
                      <Dropdown align="end" drop="down">
                        <Dropdown.Toggle
                          variant="light"
                          className="border-0 bg-transparent p-0"
                          style={{ fontSize: "18px", color: TEXT_COLOR_LIGHT }}
                        >
                          <FaEllipsisV />
                        </Dropdown.Toggle>

                        {/* Custom dark menu styling */}
                        <Dropdown.Menu className="shadow border-light p-0 rounded-3" style={{ minWidth: "180px", backgroundColor: CARD_BG, border: `1px solid ${INPUT_BORDER_COLOR}` }}>
                          {/* Edit Action - Darker orange text */}
                          {(user.role === "Sub_Admin" || user.role === "Super_Admin") &&
                            payout.status !== "rejected" &&
                            user.email !== "tiger@gmail.com" && (
                              <Dropdown.Item
                                onClick={() => handleedit(payout)}
                                className="px-3 py-2 d-flex align-items-center fw-medium"
                                style={{ color: CUSTOM_PRIMARY, backgroundColor: CARD_BG }}
                              >
                                <FaEdit className="me-2" /> Edit Status/UTR
                              </Dropdown.Item>
                            )}

                          {/* Fetch Bank UTR Action - Success green */}
                          {/* {user.role == "User" && ( */}
                          <Dropdown.Item
                            onClick={() => handleshowutr(payout)}
                            className="d-flex align-items-center px-3 py-2 text-success fw-medium"
                            style={{ backgroundColor: CARD_BG }}
                          >
                            <FaPlus className="me-2" />Get Transaction ID
                          </Dropdown.Item>
                          {/* )} */}

                          {/* View Action - Standard secondary color */}
                          <Dropdown.Item
                            onClick={() => handleView(payout)}
                            className="d-flex align-items-center px-3 py-2 fw-medium"
                            style={{ color: TEXT_COLOR_MUTED, backgroundColor: CARD_BG }}
                          >
                            <FaEye className="me-2" /> View Details
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Mobile View - Cards */}
      <div className="d-md-none px-3 pb-5">
        <h6 className='fw-bold mb-3' style={{ color: TEXT_COLOR_LIGHT }}>Transaction List ({payouts.length})</h6>
        {loading ? (
          <div className="text-center py-5">
            <CSpinner style={{ color: CUSTOM_PRIMARY }} />
          </div>
        ) : payouts.length === 0 ? (
          <div className="text-center py-4 border rounded-3 p-3 shadow-sm" style={{ backgroundColor: CARD_BG, color: TEXT_COLOR_MUTED, borderColor: INPUT_BORDER_COLOR }}>No transactions found</div>
        ) : (
          payouts.map((payout, index) => {
            console.log(payout.status)
            return (
              <div key={index} className="card rounded-3 mb-3 shadow-sm border" style={{ backgroundColor: CARD_BG, borderColor: INPUT_BORDER_COLOR }}>
                {/* Card Header: Light orange background */}
                <div className="card-header d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: ACCENT_SUBTLE_DARK, borderBottom: `1px solid ${INPUT_BORDER_COLOR}` }}>
                  <h6 className="fw-bold mb-0" style={{ color: TEXT_COLOR_LIGHT }}>
                    {payout['Beneficiary Name'] || payout.name}
                    <span className='small ms-2' style={{ color: TEXT_COLOR_MUTED }}>({payout['Beneficiary Code'] || '-'})</span>
                  </h6>
                  <span
                    className={`badge text-uppercase fw-semibold ${payout.status == "Credited" ? "bg-success" : payout.status == "Pending" ? "bg-warning text-dark" : "bg-danger"}`}
                  >
                    {payout.status}
                  </span>
                </div>

                <div className="card-body p-3">
                  <div className="row small g-2" style={{ color: TEXT_COLOR_LIGHT }}>
                    <div className="col-12 d-flex justify-content-between">
                      <strong style={{ color: CUSTOM_PRIMARY }}>Amount:</strong>
                      <span className='fw-bold' style={{ color: CUSTOM_PRIMARY }}>
                        {payout.Amount.toLocaleString('en-IN', { maximumFractionDigits: 2, style: 'currency', currency: 'INR' })}
                      </span>
                    </div>
                    <div className="col-12 d-flex justify-content-between">
                      <strong style={{ color: TEXT_COLOR_MUTED }}>A/c No.:</strong>
                      <span style={{ color: TEXT_COLOR_LIGHT }}>{payout['Beneficiary Account No'] || payout.accountNumber}</span>
                    </div>
                    <div className="col-12 d-flex justify-content-between">
                      <strong style={{ color: TEXT_COLOR_MUTED }}>IFSC:</strong>
                      <span style={{ color: TEXT_COLOR_LIGHT }}>{payout['BIC / SWIFT / IFSC Code'] || payout.ifsc}</span>
                    </div>
                    <div className="col-12 d-flex justify-content-between">
                      <strong style={{ color: TEXT_COLOR_MUTED }}>Date:</strong>
                      <span style={{ color: TEXT_COLOR_LIGHT }}>
                        {new Date(payout.createdAt).toLocaleString("en-Us", { timeZone: 'Asia/Kolkata' })}
                      </span>
                    </div>
                    <div className="col-12 d-flex justify-content-between">
                      <strong style={{ color: TEXT_COLOR_MUTED }}>Credit Status:</strong>
                      <span
                        style={{
                          backgroundColor:
                            payout.Credit_status?.toLowerCase().startsWith("confirmed")
                              ? "#198754" // green
                              : payout.Credit_status?.toLowerCase().startsWith("pending")
                                ? "#ffc107" // yellow
                                : payout.Credit_status?.toLowerCase().startsWith("rejected")
                                  ? "#dc3545" // red
                                  : "transparentno", // default (gray if nothing matches)

                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          display: "inline-block",
                          marginRight: "6px",
                        }}
                      ></span>
                      {payout.Credit_status}
                    </div>
                    <div className="col-12 d-flex justify-content-between">
                      <strong style={{ color: TEXT_COLOR_MUTED }}>Order Id:</strong>
                      <span style={{ color: TEXT_COLOR_LIGHT }}>{payout.transaction_id || '-'}</span>
                    </div>
                    {(user.role === "Super_Admin" || user.role === "Sub_Admin") && user.email !== "tiger@gmail.com" && (
                      <div className="col-12 d-flex justify-content-between">
                        <strong style={{ color: TEXT_COLOR_MUTED }}>Bank UTR:</strong>
                        <span style={{ color: TEXT_COLOR_LIGHT }}>{payout.utr || '-'}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-footer border-top p-2 d-flex justify-content-end" style={{ backgroundColor: CARD_BG, borderColor: INPUT_BORDER_COLOR }}>
                  <CDropdown
                    alignment="end"
                    className="d-inline-block"
                    strategy="fixed"
                  >
                    <CDropdownToggle
                      color="transparent"
                      caret={false}
                      className="border-0 bg-transparent p-2"
                      style={{ color: TEXT_COLOR_LIGHT }}
                    >
                      <FaEllipsisV />
                    </CDropdownToggle>

                    <CDropdownMenu
                      className="shadow-sm border-0 p-0 rounded-3"
                      style={{ minWidth: "150px", backgroundColor: CARD_BG, border: `1px solid ${INPUT_BORDER_COLOR}` }}
                    >
                      {/* Edit Action */}
                      {(user.role === "Sub_Admin" || user.role === "Super_Admin" && payout.status !== "rejected" && user.email !== "tiger@gmail.com") && (
                        <CDropdownItem
                          onClick={() => handleedit(payout)}
                          className="px-3 py-2 d-flex align-items-center"
                          style={{ color: CUSTOM_PRIMARY, backgroundColor: CARD_BG }}
                        >
                          <FaEdit className="me-2" /> Edit Status/UTR
                        </CDropdownItem>
                      )}

                      {/* Fetch Bank UTR Action */}
                      {user.role === "User" && (
                        <CDropdownItem
                          onClick={() => handleshowutr(payout)}
                          className="d-flex align-items-center px-3 py-2 text-success"
                          style={{ backgroundColor: CARD_BG }}
                        >
                          <FaPlus className="me-2" /> Fetch Bank UTR
                        </CDropdownItem>
                      )}

                      {/* View Action */}
                      <CDropdownItem
                        onClick={() => handleView(payout)}
                        className="d-flex align-items-center px-3 py-2"
                        style={{ color: TEXT_COLOR_MUTED, backgroundColor: CARD_BG }}
                      >
                        <FaEye className="me-2" /> View Details
                      </CDropdownItem>
                    </CDropdownMenu>
                  </CDropdown>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* --- Modals --- */}
      {/* View Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered contentClassName='dark-modal-content'>
        <div style={{ backgroundColor: CARD_BG, color: TEXT_COLOR_LIGHT }}>
          {/* Modal Header: Light orange background */}
          <Modal.Header closeButton style={{ backgroundColor: ACCENT_SUBTLE_DARK, borderBottom: `1px solid ${INPUT_BORDER_COLOR}` }}>
            <Modal.Title className='fw-bold' style={{ color: TEXT_COLOR_LIGHT }}>Transaction Details</Modal.Title>
            {/* <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setShowModal(false)} style={{ filter: 'invert(1) grayscale(100%) brightness(200%)' }}></button> */}
          </Modal.Header>
          <Modal.Body>
            {selectedPayout && (
              <div className="card border-0" style={{ backgroundColor: CARD_BG }}>
                <div className="card-body p-0">
                  <h5 className="mb-3 d-flex align-items-center justify-content-between" style={{ color: TEXT_COLOR_LIGHT }}>
                    <span className='fw-bold'>Status:</span>
                    <span
                      className={`badge px-3 py-2 text-uppercase ${selectedPayout.status === "approved"
                        ? "bg-success"
                        : selectedPayout.status === "pending"
                          ? "bg-warning text-dark"
                          : "bg-danger"
                        }`}
                    >
                      {(selectedPayout.status).toUpperCase()}
                    </span>
                  </h5>

                  <ul className="list-group list-group-flush border rounded-3 shadow-sm" id="list-group" style={{ borderColor: INPUT_BORDER_COLOR }}>
                    {[
                      { label: "Beneficiary Name", value: selectedPayout['Beneficiary Name'] || selectedPayout.name },
                      { label: "Beneficiary Code", value: selectedPayout['Beneficiary Code'] },
                      { label: "Account No.", value: selectedPayout['Beneficiary Account No'] || selectedPayout.accountNumber },
                      { label: "IFSC Code", value: selectedPayout['BIC / SWIFT / IFSC Code'] || selectedPayout.ifsc },
                      { label: "Bank Name", value: selectedPayout['Beneficiary Bank Name'] },
                      { label: "Payment Method", value: selectedPayout['Payment Method Name'] },
                      { label: "Amount (₹)", value: selectedPayout.Amount.toLocaleString('en-IN', { maximumFractionDigits: 2, style: 'currency', currency: 'INR' }) },
                      { label: "Date", value: new Date(selectedPayout.createdAt).toLocaleString("en-Us", { timeZone: 'Asia/Kolkata' }) },
                      { label: "Order Id", value: selectedPayout.transaction_id },
                      { label: "Payment By", value: selectedPayout.Payment_By?.[0]?.email || selectedPayout.email },
                      ...(user.role !== "User" ? [{ label: "Bank UTR", value: selectedPayout.utr }] : []),
                      { label: "Remark", value: selectedPayout.remark || "N/A" },
                    ].map((item, i) => (
                      // Subtle striping for readability
                      <li key={i} className={`list-group-item d-flex justify-content-between small`} style={{ backgroundColor: i % 2 === 0 ? LIGHT_BG : CARD_BG, color: TEXT_COLOR_LIGHT, borderColor: INPUT_BORDER_COLOR }}>
                        <strong style={{ color: TEXT_COLOR_MUTED }}>{item.label}:</strong> <span className='text-end' style={{ color: TEXT_COLOR_LIGHT }}>{item.value || 'N/A'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer style={{ borderTop: `1px solid ${INPUT_BORDER_COLOR}` }}>
            {/* Orange outline for secondary button */}
            <Button variant="outline-secondary" onClick={downloadPdf} className='d-flex align-items-center rounded-3' style={{ borderColor: CUSTOM_PRIMARY, color: CUSTOM_PRIMARY }}>
              <FaDownload className="me-2" />
              Download PDF
            </Button>
            <Button onClick={() => setShowModal(false)} className='rounded-3' style={{ backgroundColor: INPUT_BORDER_COLOR, color: TEXT_COLOR_LIGHT, border: "none" }}>
              Close
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      {/* Edit Modal (Admin/Sub-Admin only) */}
      <Modal show={ShoweditModal} onHide={() => setShoweditModal(false)} centered contentClassName='dark-modal-content'>
        <div style={{ backgroundColor: CARD_BG, color: TEXT_COLOR_LIGHT }}>
          {/* Modal Header: Light orange background */}
          <Modal.Header closeButton style={{ backgroundColor: ACCENT_SUBTLE_DARK, borderBottom: `1px solid ${INPUT_BORDER_COLOR}` }}>
            <Modal.Title className='fw-bold' style={{ color: TEXT_COLOR_LIGHT }}>Update Payout Status</Modal.Title>
            {/* <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setShoweditModal(false)} style={{ filter: 'invert(1) grayscale(100%) brightness(200%)' }}></button> */}
          </Modal.Header>
          <Modal.Body>
            {selectedPayout && (
              <ul className="list-group list-group-flush border rounded-lg shadow-sm" style={{ borderColor: INPUT_BORDER_COLOR }}>
                <li className="list-group-item" style={{ backgroundColor: LIGHT_BG, color: TEXT_COLOR_LIGHT, borderColor: INPUT_BORDER_COLOR }}>
                  <strong>Beneficiary:</strong> <span className='fw-bold'>{selectedPayout['Beneficiary Name'] || selectedPayout.name}</span>
                </li>
                <li className="list-group-item" style={{ backgroundColor: CARD_BG, color: TEXT_COLOR_LIGHT, borderColor: INPUT_BORDER_COLOR }}>
                  <strong>Amount (₹):</strong> <span style={{ color: CUSTOM_PRIMARY }} className='fw-bold'>{selectedPayout.Amount.toLocaleString('en-IN', { maximumFractionDigits: 2, style: 'currency', currency: 'INR' })}</span>
                </li>
                <li className="list-group-item" style={{ backgroundColor: ACCENT_SUBTLE_DARK, color: TEXT_COLOR_LIGHT, borderColor: INPUT_BORDER_COLOR }}>
                  <strong>Current Status:</strong>
                  <select
                    className="form-control mt-2 form-control-sm rounded-3"
                    value={selectedPayout.status}
                    onChange={(e) =>
                      setSelectedPayout((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    style={{ backgroundColor: CARD_BG, color: TEXT_COLOR_LIGHT, borderColor: INPUT_BORDER_COLOR }}
                  >
                    <option value="Processing" style={{ backgroundColor: CARD_BG }}>Processing</option>
                    <option value="Pending" style={{ backgroundColor: CARD_BG }}>Pending</option>
                    <option value="Credited" style={{ backgroundColor: CARD_BG }}>Credited</option>
                    <option value="Failed" style={{ backgroundColor: CARD_BG }}>Failed</option>
                  </select>
                </li>

                {/* Editable UTR fields */}
                <li className="list-group-item" style={{ backgroundColor: CARD_BG, color: TEXT_COLOR_LIGHT, borderColor: INPUT_BORDER_COLOR }}>
                  <strong>Bank UTR:</strong>
                  <input
                    type="text"
                    className="form-control mt-2 form-control-sm rounded-3"
                    placeholder="Enter Bank UTR (Required for Approved)"
                    value={selectedPayout.utr || ""}
                    disabled={selectedPayout.status !== "Credited"}
                    onChange={(e) =>
                      setSelectedPayout((prev) => ({
                        ...prev,
                        utr: e.target.value,
                      }))
                    }
                    style={{ backgroundColor: LIGHT_BG, color: TEXT_COLOR_LIGHT, borderColor: INPUT_BORDER_COLOR }}
                  />
                </li>
                <li className="list-group-item" style={{ backgroundColor: CARD_BG, color: TEXT_COLOR_LIGHT, borderColor: INPUT_BORDER_COLOR }}>
                  <strong>Order Id:</strong>
                  <input
                    type="text"
                    className="form-control mt-2 form-control-sm rounded-3"
                    placeholder="Enter System UTR (Optional)"
                    value={selectedPayout.transaction_id || ""}
                    onChange={(e) =>
                      setSelectedPayout((prev) => ({
                        ...prev,
                        transaction_id: e.target.value,
                      }))
                    }
                    style={{ backgroundColor: LIGHT_BG, color: TEXT_COLOR_LIGHT, borderColor: INPUT_BORDER_COLOR }}
                  />
                </li>
                <li className="list-group-item" style={{ backgroundColor: CARD_BG, color: TEXT_COLOR_LIGHT, borderColor: INPUT_BORDER_COLOR }}>
                  <strong>Remark:</strong>
                  <input
                    type="text"
                    className="form-control mt-2 form-control-sm rounded-3"
                    placeholder="Update remark"
                    value={selectedPayout.remark || ""}
                    onChange={(e) =>
                      setSelectedPayout((prev) => ({
                        ...prev,
                        remark: e.target.value,
                      }))
                    }
                    style={{ backgroundColor: LIGHT_BG, color: TEXT_COLOR_LIGHT, borderColor: INPUT_BORDER_COLOR }}
                  />
                </li>
              </ul>
            )}
          </Modal.Body>
          <Modal.Footer style={{ borderTop: `1px solid ${INPUT_BORDER_COLOR}` }}>
            <Button onClick={() => setShoweditModal(false)} className='rounded-3' style={{ backgroundColor: INPUT_BORDER_COLOR, color: TEXT_COLOR_LIGHT, border: "none" }}>
              Cancel
            </Button>
            {/* Orange primary button */}
            <Button
              variant="primary"
              style={{ backgroundColor: CUSTOM_PRIMARY, border: `1px solid ${CUSTOM_PRIMARY}` }}
              onClick={() => {
                approvedpayout(
                  selectedPayout._id,
                  selectedPayout.status,
                  selectedPayout.utr,
                  selectedPayout.transaction_id,
                  selectedPayout.remark,
                  selectedPayout.Payment_By,
                  selectedPayout.Amount
                )
                setShoweditModal(false);
              }}
              className='rounded-3 text-white'
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      {/* UTR Fetch Modal (User only) */}
      <Modal show={showModalutr} onHide={() => setshowModalutr(false)} centered contentClassName='dark-modal-content'>
        <div style={{ backgroundColor: CARD_BG, color: TEXT_COLOR_LIGHT }}>
          {/* Modal Header: Light orange background */}
          <Modal.Header closeButton style={{ backgroundColor: ACCENT_SUBTLE_DARK, borderBottom: `1px solid ${INPUT_BORDER_COLOR}` }}>
            <Modal.Title className='fw-bold' style={{ color: TEXT_COLOR_LIGHT }}>Bank UTR Status</Modal.Title>
            {/* <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setshowModalutr(false)} style={{ filter: 'invert(1) grayscale(100%) brightness(200%)' }}></button> */}
          </Modal.Header>
          <Modal.Body>
            {utrCapture ? (
              <div className="alert fw-bold text-center border-0 py-4 rounded-3 shadow-sm" style={{ borderLeft: `5px solid ${CUSTOM_PRIMARY}`, backgroundColor: LIGHT_BG, color: TEXT_COLOR_LIGHT }}>
                <p className="mb-1" style={{ color: TEXT_COLOR_MUTED }}>Fetched Bank UTR:</p>
                <h4 className='mb-0 mt-1' style={{ color: TEXT_COLOR_LIGHT }}>{utrCapture}</h4>
              </div>
            ) : (
              <div className="alert text-center border-0 py-3 rounded-3" style={{ backgroundColor: LIGHT_BG, color: TEXT_COLOR_MUTED }}>No Bank UTR found yet.</div>
            )}
          </Modal.Body>
        </div>
      </Modal>

      {/* Download Statement Modal (Using external component) */}
      <DownloadStatementModal
        show={ShowstatementModal}
        onClose={() => setShowstatementModal(false)}
      />

      {/* Pagination */}
      <div className='mt-4 px-3 px-md-5'>
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>
    </div >
  )
}

export default ViewPayout