import React, { useEffect, useState } from 'react'
import { FaSearch, FaPlus, FaEdit, FaEllipsisV, FaAngleLeft, FaAngleRight } from 'react-icons/fa'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import Pagination from '../../../components/Pagination'
import {
  CButton,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CFormInput,
  CFormLabel,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react'
import { useSelector } from 'react-redux'
import { Modal } from 'react-bootstrap'

function ViewSubAdmin() {
  const ACCENT_COLOR = 'rgb(255, 102, 0)' // Defined accent color for consistent styling

  const [admins, setAdmins] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  // Modal state for Add Credit
  const [showModal, setShowModal] = useState(false)
  const [addcreditmodal, setaddcreditmodal] = useState(null)
  const [credit, setcredit] = useState(0)

  const { user } = useSelector((state) => state.user)

  const fetchSubAdmins = async () => {
    try {
      let url = ''
      if (searchTerm.trim()) {
        url = `/api/auth/Search_subadmin?searchKey=${encodeURIComponent(
          searchTerm,
        )}&page=${page}&limit=${limit}`
      } else {
        url = `/api/auth/View_subadmin?page=${page}&limit=${limit}`
      }

      const response = await axios.get(url, { withCredentials: true })

      setAdmins(
        response.data.subadmins.map((admin) => ({
          ...admin,
          loadingStatus: false,
        })),
      )
      setTotalPages(response.data.totalPages || 1)
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error('Unauthorized access. Please log in again.')
        window.location.reload()
      }
      toast.error('Error fetching subadmins')
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      setAdmins((prev) =>
        prev.map((admin) => (admin._id === id ? { ...admin, loadingStatus: true } : admin)),
      )

      await axios.put(
        `/api/auth/updateSubadminStatus/${id}`,
        { status: newStatus },
        { withCredentials: true },
      )

      toast.success('Status updated')

      setAdmins((prev) =>
        prev.map((admin) =>
          admin._id === id ? { ...admin, status: newStatus, loadingStatus: false } : admin,
        ),
      )
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error('Unauthorized access. Please log in again.')
        window.location.reload()
      }
      toast.error('Failed to update status')
      setAdmins((prev) =>
        prev.map((admin) => (admin._id === id ? { ...admin, loadingStatus: false } : admin)),
      )
    }
  }

  const handleaddCredit = (admin) => {
    setaddcreditmodal(admin)
    setcredit(0)
    setShowModal(true)
  }

  const addCredit = async () => {
    if (credit <= 0) {
      toast.error('Credit must be a positive number.')
      return
    }

    try {
      await axios.put(
        `/api/auth/Add_Credit_subadmin`,
        { Sub_admin_id: addcreditmodal._id, credit: Number(credit) },
        { withCredentials: true },
      )
      toast.success('Credit added successfully!')
      setShowModal(false)
      setaddcreditmodal(null)
      setcredit(0)
      fetchSubAdmins()
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error('Unauthorized access. Please log in again.')
        window.location.reload()
      }
      toast.error(error.response?.data?.message || 'Failed to add credit')
    }
  }

  useEffect(() => {
    fetchSubAdmins()
  }, [searchTerm, page])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  const [hoveredIndex, setHoveredIndex] = useState(null)

  const getStatusStyle = (status) => {
    const isActive = status === 'Active'
    return {
      // Dark Mode Adjusted Colors
      backgroundColor: isActive ? 'rgba(25,135,84,0.3)' : 'rgba(220,53,69,0.3)', // Slightly darker/more saturated background for contrast
      color: isActive ? '#4CAF50' : '#FF6B6B', // Brighter status text for visibility
      dotColor: isActive ? '#4CAF50' : '#FF6B6B',
    }
  }

  // --- DARK MODE STYLES ---
  const DARK_BG = '#121212' // Main background
  const CARD_BG = '#1e1e1e' // Card/Table background
  const DARK_TEXT = '#e0e0e0' // Light text color
  const MUTED_TEXT = '#9e9e9e' // Muted text color
  const TABLE_HEADER_BG = '#282828' // Table header background

  return (
    // Apply main dark background to the container
    <div className="container-fluid" style={{ paddingBottom: '3rem', backgroundColor: DARK_BG, minHeight: '100vh', color: DARK_TEXT }}>

      {/* --- HEADER: Professional Card Header --- */}
      <div
        className="px-4 px-md-5 py-4 mb-4 rounded-3 shadow-lg" // Use shadow-lg for better dark mode depth
        style={{
          borderLeft: `6px solid ${ACCENT_COLOR}`, // Accent bar
          backgroundColor: CARD_BG, // Dark card background
        }}
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <h2 className="fw-bold mb-0" style={{ color: DARK_TEXT }}>Co Admin Management</h2>
          <div className="d-flex align-items-center gap-3">
            {/* User Info (kept from original code) */}
            <img
              src="https://placehold.co/48x48/333333/dddddd?text=A" // Dark mode placeholder
              alt="Admin Avatar"
              className="rounded-circle"
              width="48"
              height="48"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/48x48/333333/dddddd?text=A" }}
            />
            <div className
              ="text-end">
              <div className="fw-bold" style={{ color: DARK_TEXT }}>{user.Name}</div>
              {user.role !== 'User' && (
                <div className="small" style={{ color: MUTED_TEXT }}>{user.role}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTROLS: Search and Create Button --- */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 px-4 px-md-5 pt-0 pb-4">
        <div style={{ maxWidth: '350px', width: '100%' }}>
          <div
            className="input-group border rounded-pill shadow-sm"
            style={{
              borderColor: '#444',
              backgroundColor: CARD_BG, // Dark search input background
            }}
          >
            <span
              className="input-group-text border-0"
              style={{
                paddingLeft: '1rem',
                backgroundColor: 'transparent',
                color: MUTED_TEXT, // Muted icon color
              }}
            >
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control border-0"
              placeholder="Search by name, username, or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{
                borderRadius: '0 50px 50px 0',
                padding: '10px 15px',
                backgroundColor: CARD_BG, // Dark input field
                color: DARK_TEXT, // Light text color
              }}
            />
          </div>
        </div>

        <Link
          to="/CreateCOAdmin"
          className="btn px-4 py-2 shadow fw-semibold d-flex align-items-center rounded-pill"
          style={{
            backgroundColor: ACCENT_COLOR,
            color: 'white',
            boxShadow: `0 4px 15px ${ACCENT_COLOR}66`,
            transition: 'all 0.3s ease',
          }}
        >
          <FaPlus className="me-2" /> Create New Co Admin
        </Link>
      </div>

      {/* --- DESKTOP TABLE VIEW: Modern Card-Row Design --- */}
      <div className="px-5 d-none d-md-block pb-5">
        <div
          className="rounded-3 shadow-lg"
          style={{
            overflow: 'hidden',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)', // Deeper shadow for dark mode
            backgroundColor: CARD_BG, // Dark table container
          }}
        >
          {/* Custom Dark Table Classes */}
          <table className="table table-borderless align-middle mb-0" style={{ color: DARK_TEXT }}>
            {/* Table Header */}
            <thead style={{ backgroundColor: TABLE_HEADER_BG }}>
              <tr>
                <th className="ps-4 text-uppercase small fw-bold py-3" style={{ color: MUTED_TEXT }}>User / Email</th>
                <th className="text-uppercase small fw-bold" style={{ color: MUTED_TEXT }}>Phone</th>
                <th className="text-uppercase small fw-bold text-end" style={{ color: MUTED_TEXT }}>Today's Payout</th>
                <th className="text-uppercase small fw-bold text-end" style={{ color: MUTED_TEXT }}>Credit Balance</th>
                <th className="text-uppercase small fw-bold text-end" style={{ color: MUTED_TEXT }}>Total Payout</th>
                <th className="text-uppercase small fw-bold text-center" style={{ color: MUTED_TEXT }}>Status</th>
                <th className="text-uppercase small fw-bold text-center" style={{ color: MUTED_TEXT }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin, index) => {
                const statusStyle = getStatusStyle(admin.status)
                return (
                  // Custom row styling for dark mode
                  <tr
                    key={admin._id || index}
                    className="py-2"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{
                      borderBottom: `1px solid ${TABLE_HEADER_BG}`, // Dark border separation
                      backgroundColor: hoveredIndex === index ? '#2a2a2a' : CARD_BG, // Darker hover state
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {/* Name / Email Column */}
                    <td className="ps-4 py-3">
                      <div className="fw-bold" style={{ color: DARK_TEXT }}>{admin?.Name}</div>
                      <div className="small" style={{ color: MUTED_TEXT }}>@{admin?.User_name}</div>
                      <div className="small" style={{ color: MUTED_TEXT }}>{admin?.email}</div>
                    </td>
                    <td style={{ color: DARK_TEXT }}>{admin?.Phone}</td>
                    <td className="text-end fw-medium" style={{ color: DARK_TEXT }}>₹{admin?.todayBalance || 0}</td>
                    {/* Highlighted Credit Balance */}
                    <td className="text-end fw-bold" style={{ color: ACCENT_COLOR }}>₹{admin?.credit || 0}</td>
                    <td className="text-end" style={{ color: MUTED_TEXT }}>₹{admin?.allTimeBalance || 0}</td>

                    {/* Status Column */}
                    <td className="text-center">
                      <button
                        className="px-3 py-1 rounded-pill border-0 d-inline-flex align-items-center fw-medium"
                        style={{ ...statusStyle, fontSize: '13px' }}
                        onClick={() =>
                          handleStatusChange(
                            admin._id,
                            admin.status === 'Active' ? 'Inactive' : 'Active',
                          )
                        }
                        disabled={admin.loadingStatus}
                      >
                        {admin.loadingStatus ? (
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        ) : (
                          <span
                            style={{ ...statusStyle, width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block', marginRight: '6px', backgroundColor: statusStyle.dotColor }}
                          ></span>
                        )}
                        {admin.status === 'Active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Action Column */}
                    <td className="text-center">
                      <CDropdown
                        alignment="end"
                        // visibility logic kept for improved UX
                        visible={hoveredIndex === index}
                        className="d-inline-block"
                      >
                        <CDropdownToggle
                          color="transparent"
                          caret={false}
                          className="border-0 bg-transparent p-0"
                          style={{ fontSize: '18px', color: MUTED_TEXT }} // Muted color for dots
                        >
                          <FaEllipsisV />
                        </CDropdownToggle>

                        {/* Dropdown Menu - Darkened */}
                        <CDropdownMenu
                          className="shadow-lg border-0 p-1 rounded-3"
                          style={{ minWidth: '180px', backgroundColor: TABLE_HEADER_BG }}
                        >
                          <CDropdownItem
                            className="d-flex align-items-center px-3 py-2 rounded-md"
                            component={NavLink}
                            style={{ transition: 'background-color 0.1s', color: DARK_TEXT }}
                          >
                            <Link
                              className="d-flex align-items-center text-decoration-none"
                              to={`/editCoAdmin/${admin._id}`}
                              style={{ color: DARK_TEXT }}
                            >
                              <FaEdit className="me-2" style={{ color: ACCENT_COLOR }} />
                              Edit Permissions
                            </Link>
                          </CDropdownItem>

                          <CDropdownItem
                            className="d-flex align-items-center px-3 py-2 rounded-md"
                            onClick={() => handleaddCredit(admin)}
                            style={{ transition: 'background-color 0.1s', color: DARK_TEXT }}
                          >
                            <FaPlus className="me-2 text-success" />
                            Add Credit
                          </CDropdownItem>
                        </CDropdownMenu>
                      </CDropdown>
                    </td>
                  </tr>
                )
              })}
              {admins.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-5" style={{ color: MUTED_TEXT }}>No Sub Admins found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MOBILE CARD VIEW: Enhanced Readability --- */}
      <div className="px-3 d-md-none pb-5">
        {admins.map((admin, index) => {
          const statusStyle = getStatusStyle(admin.status)
          return (
            <div key={admin._id || index}
              className="rounded-3 p-4 mb-3 shadow-sm"
              style={{
                borderLeft: `6px solid ${ACCENT_COLOR}`, // Stronger accent bar
                backgroundColor: CARD_BG, // Dark card background
                color: DARK_TEXT,
              }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="fw-bold fs-5 mb-1" style={{ color: DARK_TEXT }}>{admin?.Name}</div>
                  <div className="small" style={{ color: MUTED_TEXT }}>@{admin?.User_name}</div>
                </div>
                {/* Status toggle button */}
                <button
                  className="px-3 py-1 rounded-pill border-0 d-inline-flex align-items-center fw-medium"
                  style={{ ...statusStyle, fontSize: '12px' }}
                  onClick={() =>
                    handleStatusChange(admin._id, admin.status === 'Active' ? 'Inactive' : 'Active')
                  }
                  disabled={admin.loadingStatus}
                >
                  <span
                    style={{ ...statusStyle, width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block', marginRight: '6px', backgroundColor: statusStyle.dotColor }}
                  ></span>
                  {admin.status === 'Active' ? 'Active' : 'Inactive'}
                </button>
              </div>

              <hr className="my-3" style={{ borderColor: '#333' }} />

              <div className="row small g-3 fw-medium">
                <div className="col-6" style={{ color: MUTED_TEXT }}>Email</div>
                <div className="col-6 text-end" style={{ color: DARK_TEXT }}>{admin?.email}</div>

                <div className="col-6" style={{ color: MUTED_TEXT }}>Phone</div>
                <div className="col-6 text-end" style={{ color: DARK_TEXT }}>{admin?.Phone}</div>

                <div className="col-6" style={{ color: MUTED_TEXT }}>Today's Payout</div>
                <div className="col-6 text-end" style={{ color: DARK_TEXT }}>₹{admin?.todayBalance || 0}</div>

                <div className="col-6" style={{ color: MUTED_TEXT }}>Credit Balance</div>
                <div className="col-6 text-end">
                  <span style={{ color: ACCENT_COLOR }} className="fw-bold">₹{admin?.credit || 0}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex justify-content-end mt-4 gap-2">
                <button
                  className="btn btn-sm w-50 fw-semibold rounded-pill"
                  style={{
                    backgroundColor: `${ACCENT_COLOR}33`, // Lighter accent background
                    color: ACCENT_COLOR,
                    borderColor: ACCENT_COLOR
                  }}
                  onClick={() => handleaddCredit(admin)}
                >
                  <FaPlus className="me-1" /> Add Credit
                </button>
                <Link
                  to={`/editCoAdmin/${admin._id}`}
                  className="btn btn-dark btn-sm w-50 fw-semibold rounded-pill"
                  style={{ backgroundColor: TABLE_HEADER_BG, borderColor: TABLE_HEADER_BG, color: DARK_TEXT }} // Dark button style
                >
                  <FaEdit className="me-1" /> Edit User
                </Link>
              </div>
            </div>
          )
        })}
        {admins.length === 0 && (
          <div className="text-center py-4" style={{ color: MUTED_TEXT }}>No Sub Admins found.</div>
        )}
      </div>

      {/* --- PAGINATION --- */}
      <div className="px-5">
        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>

      {/* --- ADD CREDIT MODAL: Dark Mode Styling Applied --- */}
      <Modal
        show={showModal} onHide={() => setShowModal(false)} centered contentClassName='dark-modal-content'
        aria-labelledby="AddCreditModalLabel"
        className="rounded-lg"
        // Modal Content Styling
        style={{ '--cui-modal-bg': CARD_BG, '--cui-modal-content-bg': CARD_BG, '--cui-modal-color': DARK_TEXT }}
      >
        <Modal.Header style={{ borderBottom: `2px solid ${ACCENT_COLOR}33` }}>
          <Modal.Title id="AddCreditModalLabel" className="fw-bold" style={{ color: ACCENT_COLOR }}>
            Add Credit to {addcreditmodal?.Name}
          </Modal.Title>
          {/* Custom close button style for dark mode */}
          <CButton
            className="btn-close"
            onClick={() => setShowModal(false)}
            style={{ filter: 'invert(1) grayscale(100%) brightness(200%)' }} // Inverts/brightens the default close icon
          ></CButton>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <CFormLabel className="fw-medium" style={{ color: MUTED_TEXT }}>Admin Name</CFormLabel>
            <CFormInput
              value={addcreditmodal?.Name || ''}
              disabled
              style={{
                borderRadius: '8px',
                backgroundColor: TABLE_HEADER_BG, // Darker input disabled background
                color: MUTED_TEXT,
                borderColor: '#333'
              }}
            />
          </div>
          <div className="mb-3">
            <CFormLabel className="fw-medium" style={{ color: MUTED_TEXT }}>Credit Amount (in ₹)</CFormLabel>
            <CFormInput
              type="number"
              value={credit}
              onChange={(e) => {
                const value = Math.max(0, Number(e.target.value));
                setcredit(value);
              }}
              style={{
                borderRadius: '8px',
                borderColor: '#333',
                backgroundColor: DARK_BG, // Dark input background
                color: DARK_TEXT,
              }}
              min="0"
            />
          </div>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: `1px solid ${TABLE_HEADER_BG}` }}>
          <CButton
            color="secondary"
            onClick={() => setShowModal(false)}
            style={{ borderRadius: '8px', backgroundColor: MUTED_TEXT, color: CARD_BG, borderColor: MUTED_TEXT }}
          >
            Cancel
          </CButton>
          <CButton
            color="primary"
            onClick={addCredit}
            style={{
              backgroundColor: ACCENT_COLOR,
              color: 'white',
              borderRadius: '8px',
              borderColor: ACCENT_COLOR
            }}
          >
            Add Credit
          </CButton>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default ViewSubAdmin