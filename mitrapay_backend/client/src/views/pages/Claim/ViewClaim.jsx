import React, { useEffect, useState } from 'react'
import { FaSearch, FaEdit, FaTrash } from 'react-icons/fa'
import axios from 'axios'
import Pagination from '../../../components/Pagination'
import { toast } from 'react-toastify'
import {
  CButton,
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

function ViewClaim() {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10
  const [loading, setloading] = useState(false) // Added missing loading state for table
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [Visiblecredit, setVisiblecredit] = useState(false) // Credit modal visibility
  const [addcreditmodal, setaddcreditmodal] = useState(null) // Credit modal data
  const [credit, setcredit] = useState(0)
  const { user } = useSelector((state) => state.user)

  // NOTE: The 'addCredit' function is called in the render but is NOT DEFINED
  // in the provided code. It should be defined here for the button to work.
  const addCredit = () => {
    // Implementation of addCredit is missing.
    // Example placeholder:
    // console.log('Adding credit:', credit, 'to user:', addcreditmodal);
    // setVisiblecredit(false);
    // setcredit(0);
    // fetchData();
    toast.info('Add Credit function is currently undefined.')
  }


  const fetchData = async () => {
    setloading(true)
    try {
      let res
      if (searchTerm.trim() !== '') {
        res = await axios.get(
          `/api/auth/Search_claim?searchKey=${searchTerm}&page=${page}&limit=${limit}`,
          { withCredentials: true },
        )
      } else {
        res = await axios.get(
          `/api/auth/View_claim?page=${page}&limit=${limit}`,
          { withCredentials: true },
        )
      }
      setUsers(res.data.claims)
      setTotalPages(res.data.pages)
    } catch (err) {
      if (err.response && err.response.status === 401) {
        toast.error('Unauthorized access. Please log in again.')
        window.location.reload()
      }
      // console.error('Error fetching users:', err)
    } finally {
      setloading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [searchTerm, page])

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUsers((prev) =>
        prev.map((user) => (user._id === id ? { ...user, loadingStatus: true } : user)),
      )

      await axios.put(
        `/api/auth/updateClaimStatus/${id}`,
        { status: newStatus },
        { withCredentials: true },
      )

      toast.success('Status updated')

      setUsers((prev) =>
        prev.map((user) =>
          user._id === id ? { ...user, status: newStatus, loadingStatus: false } : user,
        ),
      )
    } catch (err) { // Changed 'error' to 'err' for consistency with existing code
      if (err.response && err.response.status === 401) {
        toast.error('Unauthorized access. Please log in again.')
        window.location.reload()
      }
      toast.error('Failed to update status')
      setUsers((prev) =>
        prev.map((user) => (user._id === id ? { ...user, loadingStatus: false } : user)),
      )
    }
  }

  const handleaddCredit = (admin) => {
    setaddcreditmodal([admin])
    setVisiblecredit(true)
  }

  const DeleteClaim = async (item) => {
    // console.log(item)
    setloading(true);
    try {
      await axios.post(
        `/api/auth/DeleteClaim`,
        { id: item._id },
        { withCredentials: true },
      )
      toast.success('Claim Deleted Successfully')
      setVisiblecredit(false)
      // FIX: set to null instead of false, as it holds modal data
      setaddcreditmodal(null) 
      setcredit(0)
      fetchData()
    } catch (error) {
      // Replaced 'err' with 'error' here as it was defined this way in the original block
      if (error.response && error.response.status === 401) {
        toast.error('Unauthorized access. Please log in again.')
        window.location.reload();
      }
      toast.error(error.response?.data || 'Failed to delete claim')
    } finally {
      setloading(false);
    }
  }

  function convert(str) {
    if (!str) return '';
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join("-");
  }

  const handleOpenModal = (account) => {
    setSelectedAccount(account)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedAccount(null)
  }

  const handleSaveRemark = async () => {
    if (!selectedAccount) return;
    try {
      await axios.put(`/api/auth/updateClaimStatus/${selectedAccount._id}`, {
        status: selectedAccount.status,
        remark: selectedAccount.remark
      })
      toast.success('Remark and status updated successfully!')
      handleCloseModal()
      fetchData()
    } catch (err) {
      // console.log(err)
      if (err.response && err.response.status === 401) {
        toast.error('Unauthorized access. Please log in again.')
        window.location.reload();
      }
      toast.error('Failed to update remark and status')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="border-bottom px-4 px-md-5 py-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <h2 className="fw-semibold mb-0">ViewClaim</h2>
          <div className="d-flex align-items-center gap-3 w-100 w-md-auto justify-content-between justify-content-md-end">
            <img
              src="https://storage.googleapis.com/a1aa/image/bc142717-90f8-44af-ea05-493b2c81045c.jpg"
              alt="user Avatar"
              className="rounded-circle"
              width="48"
              height="48"
            />
            <div className="text-end">
              <div className="fw-bold">{user?.Name}</div>
              {user?.role === 'User' ? (
                ""
              ) : (
                <div className="text-muted small">{user?.role}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 px-4 px-md-5 pt-4 pb-3">
        <div className="w-100 order-2 order-md-1" style={{ maxWidth: '300px' }}>
          <div className="input-group">
            <span className="input-group-text border-end-0">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search User"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
            />
          </div>
        </div>
      </div>

      {/* User Table (Desktop) */}
      <div className="px-5 d-none d-md-block pb-5">
        <div className="table-responsive d-none d-md-block border rounded shadow-sm">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th className="ps-4">Name</th>
                <th>Remark</th>
                <th>CLAIM Status</th>
                <th>Account Number</th>
                <th>Account Holder Name</th>
                <th>Amount</th>
                {(user?.role === "Super_Admin" || user?.role === "Sub_Admin") && (user?.email !== "tiger@gmail.com") && <th>Bank utr</th>}
                <th>utr</th>
                <th>Claim Date</th>
                <th>Payout Date</th>
                <th>Payment status</th>
                <th>IFSC</th>
                <th>Phone</th>
                <th className="ps-6">Payment_By</th>
                <th className="ps-6">Claim_By</th>
                <th>Action</th>
              </tr>
            </thead>
            {loading ? (
              <tbody>
                <tr>
                  <td colSpan="12" className="text-center py-5">
                    <CSpinner color="primary" style={{ width: "3rem", height: "3rem" }} />
                  </td>
                </tr>
              </tbody>
            )
              : (<tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="text-center py-4 text-muted">
                      No Claim found
                    </td>
                  </tr>
                ) : (
                  users.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td className="ps-4 py-3">{item.claimby[0].Name}</td>
                        <td>{(item.remark)}</td>
                        <td>
                          <button
                            className="px-3 py-1 rounded-pill border-0 d-inline-flex align-items-center"
                            style={{
                              backgroundColor:
                                item.status === 'Active'
                                  ? 'rgba(25,135,84,0.1)'
                                  : 'rgba(220,53,69,0.1)',
                              color: item.status === 'Active' ? '#198754' : '#dc3545',
                              fontSize: '13px',
                            }}
                            onClick={() =>
                              handleStatusChange(
                                item._id,
                                item.status === 'Active' ? 'Inactive' : 'Active',
                              )
                            }
                            disabled={item.loadingStatus}
                          >
                            <span
                              style={{
                                backgroundColor: item.status === 'Active' ? '#198754' : '#dc3545',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                display: 'inline-block',
                                marginRight: '6px',
                              }}
                            ></span>
                            {item.status === 'Active' ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td>{item.accountNumber}</td>
                        <td>{item.accountHolderName}</td>
                        <td>{item.Amount}</td>
                        {(user?.role === "Super_Admin" || user?.role === "Sub_Admin") && (user?.email !== "tiger@gmail.com") && <td>{item.utr || ""}</td>}
                        <td>{item.Bank_Utr || item.utr}</td>
                        <td>{convert(item.Date)}</td>
                        <td>{convert(item.payoutdate)}</td>
                        <td>{item.CLAIMstatus}</td>
                        <td>{item.ifsc}</td>
                        <td>{item.claimby[0].Phone}</td>
                        {/* Added optional chaining for safety */}
                        <td>{item.Payment_By?.[0]?.[0]?.role} ({item.Payment_By?.[0]?.[0]?.email}) </td>
                        <td>{item.claimby?.[0]?.[0]?.role} ({item.claimby?.[0]?.[0]?.email}) </td>


                        {/* Use optional chaining for 'user' and simplified condition */}
                        {(user?.role === 'Sub_Admin' || (user?.role === 'Super_Admin' && user?.email !== "tiger@gmail.com")) ? (
                          <td style={{
                            position: 'sticky',
                            right: 0,
                            zIndex: 7,
                            cursor: 'pointer',
                            backgroundColor: '#fff', // Add background for sticky column
                          }}>
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleOpenModal(item)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger" // Changed to danger for deletion
                              onClick={() => DeleteClaim(item)}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        ) : (
                          <td style={{
                            position: 'sticky',
                            right: 0,
                            zIndex: 7,
                          }}></td>
                        )}
                      </tr>
                    )
                  })
                )}
              </tbody>)}
          </table>
        </div>
      </div>


      {/* Mobile Cards */}
      <div className="px-3 d-md-none pb-5 mt-3">
        {users.length === 0 ? (
          <div className="text-center text-muted py-4">No Claim found</div>
        ) : (
          users.map((item, index) => (
            <div
              key={index}
              className="border rounded mb-3 p-3 shadow-sm"
              style={{ backgroundColor: '#ffffff' }}
            >
              <div className="fw-bold mb-1">{item.claimby?.[0]?.Name}</div>
              <div>
                <strong>Phone:</strong> {item.claimby?.[0]?.Phone}
              </div>
              <div>
                <strong>Account Number:</strong> {item.accountNumber}
              </div>
              <div>
                <strong>Account Holder Name:</strong> {item.accountHolderName}
              </div>
              <div>
                <strong>IFSC:</strong> {item.ifsc}
              </div>
              <div>
                <strong>Amount:</strong> {item.Amount}
              </div>
              {/* Conditional rendering for utr - fixed redundant check in original code */}
              {(user?.role === "Super_Admin" || user?.role === "Sub_Admin") && user?.email !== "tiger@gmail.com" && <div>
                <strong>utr:</strong> {item.utr}
              </div>}
              <div>
                <strong>Bank utr:</strong> {item.Bank_Utr || item.utr}
              </div>
              <div>
                <strong>Payment By:</strong> {item.Payment_By?.[0]?.[0]?.role} ({item.Payment_By?.[0]?.[0]?.email})
              </div>
              <div>
                <strong>Payment status:</strong> {item.status}
              </div>
              <div>
                <strong>CLAIM status:</strong> {item.CLAIMstatus}
              </div>
              <div>
                <strong>Remark:</strong> {item.remark}
              </div>
              <div>
                <strong>Date:</strong> {convert(item.Date)}
              </div>
              <div className="d-flex justify-content-start gap-2 mt-2">
                {(user?.role === 'Sub_Admin' || (user?.role === 'Super_Admin' && user?.email !== "tiger@gmail.com")) && (
                  <>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleOpenModal(item)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => DeleteClaim(item)}
                    >
                      <FaTrash />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Credit Modal (Kept original structure for continuity) */}
      <CModal
        visible={Visiblecredit}
        onClose={() => setVisiblecredit(false)}
        aria-labelledby="LiveDemoExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel">Add Credit</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormLabel>
            Name
            <CFormInput value={addcreditmodal && addcreditmodal[0]?.Name} disabled></CFormInput>
          </CFormLabel>
          <CFormLabel>
            Credit
            <CFormInput
              type="number"
              value={credit}
              onChange={(e) => {
                setcredit(e.target.value)
              }}
            ></CFormInput>
          </CFormLabel>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisiblecredit(false)}>
            Close
          </CButton>
          {/* NOTE: 'addCredit' function is called here but must be defined in the component scope. */}
          
        </CModalFooter>
      </CModal>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />

      {/* Update Remark Modal */}
      <CModal
        visible={showModal}
        onClose={handleCloseModal}
        aria-labelledby="UpdateRemarkModalLabel"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle id="UpdateRemarkModalLabel">Update Remark</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedAccount && (
            <div className="space-y-4">
              <CFormLabel>
                Remark:
                <CFormInput
                  type="text"
                  className="mt-1"
                  value={selectedAccount.remark || ""}
                  onChange={(e) =>
                    setSelectedAccount((prev) => ({
                      ...prev,
                      remark: e.target.value,
                    }))
                  }
                />
              </CFormLabel>
              {/* You can add more fields here if needed for updating. */}
              <p className="text-muted small mt-2">Claim ID: {selectedAccount._id}</p>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCloseModal}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSaveRemark}>
            Save Changes
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default ViewClaim