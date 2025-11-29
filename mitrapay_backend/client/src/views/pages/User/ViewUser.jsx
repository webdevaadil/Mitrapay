import React, { useEffect, useState } from 'react'
import { FaSearch, FaPlus, FaEdit, FaEllipsisV } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import * as XLSX from "xlsx";

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
    CSpinner,
} from '@coreui/react'
import { useSelector } from 'react-redux'
import Pagination from '../../../components/Pagination'
import { Modal } from 'react-bootstrap'

// --- DARK MODE THEME COLORS ---
const DARK_COLORS = {
    background: '#121212', // Primary dark background
    surface: '#1e1e1e', // Component background (cards, modals, tables)
    text: '#e0e0e0', // Light text for contrast
    textMuted: '#9e9e9e', // Muted/secondary text
    border: '#333333', // Subtle dark border
    hover: '#2a2a2a', // Hover color for rows/items
    primary: '#90CAF9', // Light blue primary for buttons/titles
    success: '#A5D6A7', // Light green for success
    danger: '#EF9A9A', // Light red for danger/inactive
    primaryBg: '#1a2b3c', // Darker background for primary elements
}
// -----------------------------

function ViewUser() {
    const [users, setUsers] = useState([])
    const [showModal, setShowModal] = useState(false)
  const ACCENT_COLOR = 'rgb(255, 102, 0)' // Defined accent color for consistent styling

    const [searchTerm, setSearchTerm] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const limit = 10
    const { user, isAuthenticated } = useSelector((state) => state.user) // Destructure user for convenience

    // State for Add Credit Modal
    const [Visiblecredit, setVisiblecredit] = useState(false)
    const [addcreditmodalUser, setAddCreditModalUser] = useState(null) // Stores the single user object
    const [credit, setCredit] = useState(0)
    const [loading, setLoading] = useState(false)

    const DARK_BG = '#121212' // Main background
    const CARD_BG = '#1e1e1e' // Card/Table background
    const DARK_TEXT = '#e0e0e0' // Light text color
    const MUTED_TEXT = '#9e9e9e' // Muted text color
    const TABLE_HEADER_BG = '#282828' // Table header background

    /**
     * Handles the download of all user data into an Excel file.
     * Calls the API with downloadAll=true parameter.
     */
    const handleDownloadExcel = async () => {
        try {
            // API call to fetch all users for download
            const res = await axios.get(`/api/auth/Search_user?downloadAll=true`, {
                withCredentials: true,
            });

            const allUsers = res.data.users;

            if (!allUsers || allUsers.length === 0) {
                toast.info("No users available to download");
                return;
            }

            // Format data for the Excel sheet
            const formattedUsers = allUsers.map((u) => ({
                Name: u.Name,
                Username: u.User_name,
                Email: u.email,
                Phone: u.Phone,
                TodayCredit: u.todayBalance,
                Credit: u.credit,
                AllTimeCredit: u.allTimeBalance,
                Status: u.status,
            }));

            const worksheet = XLSX.utils.json_to_sheet(formattedUsers);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

            XLSX.writeFile(workbook, "users.xlsx");
        } catch (error) {
            console.error("Error downloading Excel:", error);
            toast.error("Failed to download Excel");
        }
    };


    /**
     * Fetches user data based on search term and current page.
     */
    const fetchData = async () => {
        try {
            let res
            const url = searchTerm.trim() !== ''
                ? `/api/auth/Search_user?searchKey=${searchTerm}&page=${page}&limit=${limit}`
                : `/api/auth/View_user?page=${page}&limit=${limit}`

            res = await axios.get(url, { withCredentials: true })

            setUsers(res.data.users)
            setTotalPages(res.data.pages)
        } catch (error) {
            console.error('Error fetching users:', error)
            if (error.response && error.response.status === 401) {
                // If unauthorized, toast error but do not force reload
                toast.error('Unauthorized access. Please log in again.')
            } else {
                toast.error('Failed to fetch user data.')
            }
        }
    }

    // Effect to fetch data whenever search term or page changes
    useEffect(() => {
        fetchData()
    }, [searchTerm, page])


    /**
     * Updates the status of a specific user.
     * @param {string} id - The ID of the user to update.
     * @param {string} newStatus - The new status ('Active' or 'Inactive').
     */
    const handleStatusChange = async (id, newStatus) => {
        try {
            // Set loading state for the specific user
            setUsers((prev) =>
                prev.map((user) => (user._id === id ? { ...user, loadingStatus: true } : user)),
            )

            await axios.put(
                `/api/auth/updateUserStatus/${id}`,
                { status: newStatus },
                { withCredentials: true },
            )

            toast.success('Status updated successfully')

            // Update the user's status in the local state
            setUsers((prev) =>
                prev.map((user) =>
                    user._id === id ? { ...user, status: newStatus, loadingStatus: false } : user,
                ),
            )
        } catch (error) {
            toast.error('Failed to update status')
            if (error.response && error.response.status === 401) {
                toast.error('Unauthorized access. Please log in again.')
            }

            // Reset loading status on failure
            setUsers((prev) =>
                prev.map((user) => (user._id === id ? { ...user, loadingStatus: false } : user)),
            )
        }
    }


    const handleaddCredit = (admin) => {
        console.log(admin)
        setAddCreditModalUser(admin) // Store the user object
        setCredit(0) // Reset credit input
        setShowModal(true)
    }

    /**
     * Sends a request to the server to add credit to the selected user.
     */
    const addCredit = async () => {
        if (!addcreditmodalUser || credit <= 0) {
            toast.error('Please enter a valid amount of credit.')
            return;
        }

        try {
            setLoading(true)
            await axios.put(
                `/api/auth/Add_Credit_User`,
                { User_id: addcreditmodalUser._id, credit: Number(credit) },
                { withCredentials: true },
            )

            toast.success('Credit Added successfully')

            // Reset modal state
            setLoading(false)
            setShowModal(false)
            setAddCreditModalUser(null)
            setCredit(0)

            // Fetch updated data to reflect the change in the table
            fetchData()
        } catch (error) {
            // Ensure loading state is turned off on error
            setLoading(false)
            console.log('Error adding credit:', error.response?.data || error.message)

            if (error.response && error.response.status === 401) {
                toast.error('Unauthorized access. Please log in again.')
            } else {
                toast.error(error.response?.data?.message || 'Failed to add credit.')
            }
        }
    }

    // Ensure user data is available before rendering (though Redux usually handles this)
    if (!user) {
        return <div className="text-center py-5" style={{ backgroundColor: DARK_COLORS.background, color: DARK_COLORS.text }}><CSpinner color="primary" /> Loading User Data...</div>;
    }

    // Check for the super admin condition once
    let isSuperAdmin = user.email === "tiger@gmail.com";

    return (
        <div className='min-vh-100' style={{ backgroundColor: DARK_COLORS.background }}>
            {/* Header */}
            <div className="border-bottom shadow-sm px-4 px-md-5 py-3" style={{ backgroundColor: DARK_COLORS.surface, borderColor: DARK_COLORS.border }}>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                    <h2 className="fw-bold mb-0" style={{ color: DARK_COLORS.text }}>User Management</h2>
                    <div className="d-flex align-items-center gap-3 w-100 w-md-auto justify-content-between justify-content-md-end">
                        {/* Using a placeholder image with the provided dimensions */}
                        <img
                            src={`https://placehold.co/48x48/0a0a0a/e0e0e0?text=${user.Name.charAt(0).toUpperCase()}`} // Darker placeholder
                            alt="user Avatar"
                            className="rounded-circle shadow-sm"
                            width="48"
                            height="48"
                        />
                        <div className="text-end">
                            <div className="fw-bold" style={{ color: DARK_COLORS.text }}>{user.Name}</div>
                            {user.role !== 'User' && (
                                <div className="small badge" style={{ backgroundColor: DARK_COLORS.primaryBg, color: DARK_COLORS.primary }}>{user.role == "Sub_Admin" ? "Co Admin" : user.role}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 px-4 px-md-5 pt-4 pb-3">
                <div className="w-100 order-2 order-md-1" style={{ maxWidth: '350px' }}>
                    <div className="input-group rounded-pill shadow-sm" style={{ backgroundColor: DARK_COLORS.surface }}>
                        <span className="input-group-text border-end-0 border-0 rounded-start-pill" style={{ backgroundColor: DARK_COLORS.surface }}>
                            <FaSearch style={{ color: DARK_COLORS.textMuted }} />
                        </span>
                        <input
                            type="text"
                            className="form-control border-start-0 border-0 rounded-end-pill py-2"
                            style={{ backgroundColor: DARK_COLORS.surface, color: DARK_COLORS.text, '::placeholder': { color: DARK_COLORS.textMuted } }}
                            placeholder="Search User by name, email or username"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setPage(1)
                            }}
                        />
                    </div>
                </div>

                <div className="d-flex gap-3 order-1 order-md-2">
                    <Link
                        to="/createUser"
                        className="btn btn-lg fw-bold px-4 rounded-pill shadow-sm d-flex align-items-center transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: "rgb(255, 102, 0)", color: 'white', border: 'none' }} // Keeping original vibrant color
                    >
                        <FaPlus className="me-2" />
                        Create User
                    </Link>
                    <CButton
                        onClick={handleDownloadExcel}
                        className="rounded-pill shadow-sm d-flex align-items-center fw-bold transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: DARK_COLORS.success, color: DARK_COLORS.background, border: 'none' }} // Using dark mode success color
                    >
                        Download Excel
                    </CButton>
                </div>
            </div>

            {/* User Table (Desktop) */}
            <div className="px-4 px-md-5 d-none d-md-block pb-5">
                <div className="border rounded-4 shadow-lg overflow-hidden" style={{ backgroundColor: DARK_COLORS.surface, borderColor: DARK_COLORS.border }}>
                    <table className="table table-hover align-middle mb-0" style={{ '--bs-table-bg': DARK_COLORS.surface, '--bs-table-hover-bg': DARK_COLORS.hover }}>
                        <thead style={{ backgroundColor: DARK_COLORS.primaryBg }} className="fw-semibold text-uppercase small">
                            <tr>
                                <th className="ps-4 py-3" style={{ color: DARK_COLORS.textMuted, borderBottomColor: DARK_COLORS.border }}>Name</th>
                                <th className="py-3" style={{ color: DARK_COLORS.textMuted, borderBottomColor: DARK_COLORS.border }}>Username</th>
                                <th className="py-3" style={{ color: DARK_COLORS.textMuted, borderBottomColor: DARK_COLORS.border }}>Email</th>
                                <th className="py-3" style={{ color: DARK_COLORS.textMuted, borderBottomColor: DARK_COLORS.border }}>Phone</th>
                                <th className="py-3" style={{ color: DARK_COLORS.textMuted, borderBottomColor: DARK_COLORS.border }}>Today credit</th>
                                <th className="py-3" style={{ color: DARK_COLORS.textMuted, borderBottomColor: DARK_COLORS.border }}>Credit</th>
                                <th className="py-3" style={{ color: DARK_COLORS.textMuted, borderBottomColor: DARK_COLORS.border }}>All time</th>
                                <th className="py-3" style={{ color: DARK_COLORS.textMuted, borderBottomColor: DARK_COLORS.border }}>Status</th>
                                {!isSuperAdmin && (
                                    <th className="py-3" style={{ color: DARK_COLORS.textMuted, borderBottomColor: DARK_COLORS.border }}>Action</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={isSuperAdmin ? "8" : "9"} className="text-center py-5 fst-italic" style={{ color: DARK_COLORS.textMuted, borderBottomColor: DARK_COLORS.border }}>
                                        No users found matching your search criteria.
                                    </td>
                                </tr>
                            ) : (
                                users.map((item, index) => {
                                    return (
                                        <tr
                                            key={item._id}
                                            className="transition-all duration-200"
                                            style={{ borderBottom: `1px solid ${DARK_COLORS.border}` }}
                                        >
                                            <td className="ps-4 py-3 fw-bold" style={{ color: DARK_COLORS.text }}>{item.Name}</td>
                                            <td style={{ color: DARK_COLORS.textMuted }}>{item.User_name}</td>
                                            <td style={{ color: DARK_COLORS.text }}>{item.email}</td>
                                            <td style={{ color: DARK_COLORS.text }}>{item.Phone}</td>
                                            <td className="fw-semibold" style={{ color: DARK_COLORS.success }}>₹{item.todayBalance}</td>
                                            <td className="fw-semibold" style={{ color: DARK_COLORS.primary }}>₹{item.credit}</td>
                                            <td className="fw-semibold" style={{ color: '#00B0FF' }}>₹{item.allTimeBalance}</td> {/* Using a specific light info color */}
                                            <td>
                                                <button
                                                    className="px-3 py-1 rounded-pill border-0 d-inline-flex align-items-center fw-semibold transition-all duration-300 hover:shadow-md"
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            item._id,
                                                            item.status === 'Active' ? 'Inactive' : 'Active',
                                                        )
                                                    }
                                                    disabled={item.loadingStatus || loading}
                                                    style={{
                                                        backgroundColor: item.status === 'Active' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)', // Dark mode subtle bg
                                                        color: item.status === 'Active' ? DARK_COLORS.success : DARK_COLORS.danger,
                                                        fontSize: '13px',
                                                    }}
                                                >
                                                    {item.loadingStatus ? (
                                                        <CSpinner size="sm" color={item.status === 'Active' ? 'danger' : 'success'} className="me-2" />
                                                    ) : (
                                                        <span
                                                            style={{
                                                                backgroundColor: item.status === 'Active' ? DARK_COLORS.success : DARK_COLORS.danger,
                                                                width: '8px',
                                                                height: '8px',
                                                                borderRadius: '50%',
                                                                display: 'inline-block',
                                                                marginRight: '6px',
                                                            }}
                                                        ></span>
                                                    )}
                                                    {item.status}
                                                </button>
                                            </td>
                                            {!isSuperAdmin &&
                                                <td
                                                    className="position-relative"
                                                >
                                                    <CDropdown
                                                        alignment="end"
                                                        className="d-inline-block"
                                                    >
                                                        <CDropdownToggle
                                                            caret={false}
                                                            className="border-0 rounded-circle p-2"
                                                            style={{ fontSize: '16px', backgroundColor: DARK_COLORS.hover, color: DARK_COLORS.textMuted }}
                                                        >
                                                            <FaEllipsisV />
                                                        </CDropdownToggle>
                                                        <CDropdownMenu
                                                            className="shadow-lg border-0 p-1 rounded-3"
                                                            style={{ minWidth: '160px', backgroundColor: DARK_COLORS.surface, border: `1px solid ${DARK_COLORS.border}` }}
                                                        >
                                                            <CDropdownItem className="px-3 py-2" style={{ color: DARK_COLORS.text, backgroundColor: DARK_COLORS.surface, '--bs-dropdown-link-hover-bg': DARK_COLORS.hover }}>
                                                                <Link
                                                                    to={`/editUser/${item._id}`}
                                                                    className="d-flex align-items-center text-decoration-none"
                                                                    style={{ color: DARK_COLORS.text }}
                                                                >
                                                                    <FaEdit className="me-2" style={{ color: DARK_COLORS.primary }} />
                                                                    Edit User
                                                                </Link>
                                                            </CDropdownItem>
                                                            <hr className='dropdown-divider my-1' style={{ borderColor: DARK_COLORS.border }} />
                                                            <CDropdownItem
                                                                onClick={() => handleaddCredit(item)}
                                                                className="px-3 py-2"
                                                                style={{ color: DARK_COLORS.text, backgroundColor: DARK_COLORS.surface, '--bs-dropdown-link-hover-bg': DARK_COLORS.hover }}
                                                            >
                                                                <a className="d-flex align-items-center text-decoration-none" style={{ color: DARK_COLORS.text }}>
                                                                    <FaPlus className="me-2" style={{ color: DARK_COLORS.success }} />
                                                                    Add Credit
                                                                </a>
                                                            </CDropdownItem>
                                                        </CDropdownMenu>
                                                    </CDropdown>
                                                </td>
                                            }
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="px-3 d-md-none pb-5 mt-4">
                {users.length === 0 ? (
                    <div className="text-center py-4 fst-italic" style={{ color: DARK_COLORS.textMuted }}>No users found matching your search criteria.</div>
                ) : (
                    users.map((item, index) => (
                        <div
                            key={item._id}
                            className="border rounded-3 mb-3 p-3 shadow-sm transition-all duration-300 hover:shadow-md"
                            style={{ backgroundColor: DARK_COLORS.surface, borderColor: DARK_COLORS.border }}
                        >
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div className="flex-grow-1">
                                    <div className="fw-bold fs-6 mb-1" style={{ color: DARK_COLORS.primary }}>{item.Name}</div>
                                    <div className="small" style={{ color: DARK_COLORS.textMuted }}>@{item.User_name}</div>
                                </div>

                                {/* Status Toggle */}
                                <div className="pt-1">
                                    <button
                                        className="px-3 py-1 rounded-pill border-0 d-inline-flex align-items-center fw-semibold"
                                        style={{
                                            backgroundColor: item.status === 'Active' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                                            color: item.status === 'Active' ? DARK_COLORS.success : DARK_COLORS.danger,
                                            fontSize: '13px',
                                        }}
                                        onClick={() =>
                                            handleStatusChange(item._id, item.status === 'Active' ? 'Inactive' : 'Active')
                                        }
                                        disabled={item.loadingStatus || loading}
                                    >
                                        {item.loadingStatus ? (
                                            <CSpinner size="sm" color={item.status === 'Active' ? 'danger' : 'success'} className="me-2" />
                                        ) : (
                                            <span
                                                style={{
                                                    backgroundColor: item.status === 'Active' ? DARK_COLORS.success : DARK_COLORS.danger,
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    display: 'inline-block',
                                                    marginRight: '6px',
                                                }}
                                            ></span>
                                        )}
                                        {item.status}
                                    </button>
                                </div>
                            </div>

                            {/* Detail Rows */}
                            <div className="small mb-1" style={{ color: DARK_COLORS.text }}>
                                <strong>Email:</strong> {item.email}
                            </div>
                            <div className="small mb-1" style={{ color: DARK_COLORS.text }}>
                                <strong>Phone:</strong> {item.Phone}
                            </div>
                            <div className="d-flex justify-content-between my-2 py-2" style={{ borderTop: `1px solid ${DARK_COLORS.border}`, borderBottom: `1px solid ${DARK_COLORS.border}` }}>
                                <div className="d-flex flex-column">
                                    <strong className='small' style={{ color: DARK_COLORS.textMuted }}>Today Credit</strong>
                                    <span className="fw-semibold" style={{ color: DARK_COLORS.success }}>₹{item.todayBalance}</span>
                                </div>
                                <div className="d-flex flex-column text-center">
                                    <strong className='small' style={{ color: DARK_COLORS.textMuted }}>Current Credit</strong>
                                    <span className="fw-semibold" style={{ color: DARK_COLORS.primary }}>₹{item.credit}</span>
                                </div>
                                <div className="d-flex flex-column text-end">
                                    <strong className='small' style={{ color: DARK_COLORS.textMuted }}>All Time</strong>
                                    <span className="fw-semibold" style={{ color: '#00B0FF' }}>₹{item.allTimeBalance}</span>
                                </div>
                            </div>


                            {/* Action Buttons */}
                            {!isSuperAdmin &&
                                <div className="d-flex gap-2 pt-2">
                                    <button
                                        onClick={() => handleaddCredit(item)}
                                        className="btn btn-sm w-50 fw-semibold rounded-pill"
                                        style={{ borderColor: DARK_COLORS.success, color: DARK_COLORS.success, backgroundColor: 'transparent' }} // Outline style
                                    >
                                        <FaPlus className="me-1" /> Add Credit
                                    </button>
                                    <Link to={`/editUser/${item._id}`} className="btn btn-sm w-50 fw-semibold rounded-pill" style={{ borderColor: DARK_COLORS.primary, color: DARK_COLORS.primary, backgroundColor: 'transparent' }}>
                                        <FaEdit className="me-1" /> Edit User
                                    </Link>
                                </div>
                            }
                        </div>
                    ))
                )}
            </div>

            {/* Add Credit Modal */}
            <Modal
                show={showModal} onHide={() => setShowModal(false)} centered contentClassName='dark-modal-content'
                aria-labelledby="AddCreditModalLabel"
                className="rounded-lg"
                // Modal Content Styling
                style={{ '--cui-modal-bg': CARD_BG, '--cui-modal-content-bg': CARD_BG, '--cui-modal-color': DARK_TEXT }}
            >
        <Modal.Header style={{ borderBottom: `2px solid ${ACCENT_COLOR}33` }}>
                    <Modal.Title id="AddCreditModalLabel" className="fw-bold" style={{ color: ACCENT_COLOR }}>
                        Add Credit to {addcreditmodalUser?.Name}
                    </Modal.Title>                  
                    <CButton className="btn-close-white" onClick={() => setShowModal(false)}></CButton>
                </Modal.Header>

                <Modal.Body>
                    {loading ? (
                        <div className='d-flex justify-content-center align-items-center py-5'>
                            <CSpinner color="primary" style={{ width: "3rem", height: "3rem", color: DARK_COLORS.primary }} />
                            <span className='ms-3 fw-semibold' style={{ color: DARK_COLORS.primary }}>Processing...</span>
                        </div>
                    ) : (
                        <>
                            <div className="mb-3">
                                <CFormLabel htmlFor="userName" className='fw-semibold' style={{ color: DARK_COLORS.text }}>User Name</CFormLabel>
                                <CFormInput
                                    id="userName"
                                    value={addcreditmodalUser?.Name || ''}
                                    disabled
                                    style={{ backgroundColor: DARK_COLORS.hover, color: DARK_COLORS.textMuted, borderColor: DARK_COLORS.border }}
                                />
                            </div>
                            <div className="mb-3">
                                <CFormLabel htmlFor="creditAmount" className='fw-semibold' style={{ color: DARK_COLORS.text }}>Credit Amount (₹)</CFormLabel>
                                <CFormInput
                                    id="creditAmount"
                                    type="number"
                                    value={credit}
                                    onChange={(e) => {
                                        // Ensure the input is non-negative
                                        setCredit(Math.max(0, Number(e.target.value)))
                                    }}
                                    placeholder="Enter credit amount"
                                    min="1"
                                    style={{ backgroundColor: DARK_COLORS.background, color: DARK_COLORS.text, borderColor: DARK_COLORS.border }}
                                />
                            </div>
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer style={{ borderTop: `1px solid ${DARK_COLORS.border}` }}>
                    <CButton
                        onClick={() => {
                            setShowModal(false);
                            setAddCreditModalUser(null);
                            setCredit(0);
                        }}
                        disabled={loading}
                        style={{ backgroundColor: DARK_COLORS.hover, color: DARK_COLORS.textMuted, border: `1px solid ${DARK_COLORS.border}` }}
                    >
                        Cancel
                    </CButton>
                    <CButton
                        onClick={addCredit}
                        disabled={loading || credit <= 0 || !addcreditmodalUser}
                        className='fw-bold'
                        style={{ backgroundColor: DARK_COLORS.primary, color: DARK_COLORS.background, border: 'none' }}
                    >
                        {loading ? <CSpinner size="sm" color="white" className='me-2' /> : 'Confirm Add'}
                    </CButton>
                </Modal.Footer>
            </Modal>
            {/* Ensure Pagination component is also visually compatible (may need internal styles if not Bootstrap aware) */}
            <Pagination
                page={page}
                totalPages={totalPages}
                setPage={setPage}
                darkStyles={{ background: DARK_COLORS.surface, text: DARK_COLORS.text, primary: DARK_COLORS.primary, hover: DARK_COLORS.hover }} // Assuming Pagination accepts a darkStyles prop
            />
        </div>
    )
}

export default ViewUser