import axios from 'axios'
import { useEffect } from 'react'
import { useState } from 'react'
import { FaSearch, FaPlus, FaEdit, FaDownload } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Pagination from '../../../components/Pagination'
import { CCol, CFormInput, CRow } from '@coreui/react'

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
function BeneficiaryAccount() {
  const { user, error, loading, isAuthenticated } = useSelector((state) => state.user)
  const [account, setaccount] = useState([])
  const [page, setPage] = useState(1)
  const [TotalPages, setTotalPages] = useState(1)
  const navigate = useNavigate()
  const limit = 10
  const [searchTerm, setSearchTerm] = useState({ searchKey: '', startdate: '', enddate: '' })

  // console.log("abs")
  const fetchPayouts = async () => {
    try {
      // const endpoint =
      //   searchTerm.trim() === ''
      //     ? `/api/auth/View_account?page=${page}&limit=${limit}`
      //     : `/api/auth/search_Payout?searchKey=${encodeURIComponent(searchTerm)}&page=${page}&limit=${limit}`
      const endpoint =
        searchTerm.searchKey.trim() == '' && searchTerm.startdate.trim() === '' && searchTerm.enddate.trim() === ''
          ? `/api/auth/View_account?page=${page}&limit=${limit}`
          : `/api/auth/search_benficiery?searchKey=${encodeURIComponent(searchTerm.searchKey)}&page=${page}&limit=${limit}&startDate=${encodeURIComponent(searchTerm.startdate)}&endDate=${encodeURIComponent(searchTerm.enddate)}`

      const res = await axios.get(endpoint, { withCredentials: true })

      const data = res.data
      console.log(data, 'data in beneficiary account')

      setaccount(
        (data.BeneficiaryAccounts || []).map((payout) => ({
          ...payout,
          // loadingStatus: false,
        })),
      )
      setTotalPages(data.pages || 1)
    } catch (err) {
      if (err.response && err.response.data) {
        toast.error(err.response.data.message)
      } else {
        console.error(err)
        toast.error('Failed to fetch beneficiary accounts')
      }
      if (err.response && err.response.status === 401) {
        toast.error('Unauthorized access. Please log in again.')

        // navigate('/login')
        window.location.reload();

      }
      toast.error('Failed to benichery payouts')
    }
  }
  useEffect(() => {
    fetchPayouts()
  }, [page, searchTerm])

  const [showModal, setShowModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)

  const handleOpenModal = (account) => {
    setSelectedAccount(account)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedAccount(null)
  }
  const handleDownloadExcel = () => {
    const dataToExport = account.map((payout) => ({
      "Beneficiary Name": payout["Beneficiary Name"] || payout.accountHolderName || payout.name,
      "Beneficiary Code": payout["Beneficiary Code"],
      "Beneficiary Account No.": payout["Beneficiary Account No"] || payout.accountNumber,
      "BIC / SWIFT / IFSC Code": payout["BIC / SWIFT / IFSC Code"] || payout.ifsc,
      "Beneficiary Bank Name": payout["Beneficiary Bank Name"],
      "Beneficiary Address": payout["Beneficiary Address 1"],
      "Effective From": payout["Effective From"],
      "Payment Method Name": payout["Payment Method Name"],
      Remark: payout.remark || "N/A",
      "Created By": payout.createdBy?.[0]?.name || "N/A",
      "Created By Email": payout.createdBy?.[0]?.email || "N/A",
      "Updated By": payout.updatedBy?.[0]?.name || "N/A",
      "Updated By Email": payout.updatedBy?.[0]?.email || "N/A",
      "Created At": payout.createdAt ? new Date(payout.createdAt).toLocaleString("en-Us", { timeZone: 'Asia/Kolkata' }) : "",
      "Updated At": payout.updatedAt ? new Date(payout.updatedAt).toLocaleString("en-Us", { timeZone: 'Asia/Kolkata' }) : "",

      Status: payout.status
        ? payout.status.charAt(0).toUpperCase() + payout.status.slice(1)
        : "Unknown",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Benificiery Accounts')

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, `Benificiery Accounts_${new Date().toISOString()}.xlsx`)
  }
  const exportToExcel = (data, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };
  const formatSingleUserForExport = (beneficiary) => {
    return [{
      "Beneficiary Name": beneficiary["Beneficiary Name"] || beneficiary.accountHolderName || beneficiary.name,
      "Beneficiary Code": beneficiary["Beneficiary Code"],
      "Beneficiary Account No.": beneficiary["Beneficiary Account No"] || beneficiary.accountNumber,
      "BIC / SWIFT / IFSC Code": beneficiary["BIC / SWIFT / IFSC Code"] || beneficiary.ifsc,
      "Beneficiary Bank Name": beneficiary["Beneficiary Bank Name"],
      "Beneficiary Address": beneficiary["Beneficiary Address 1"],
      "Effective From": beneficiary["Effective From"],
      "Payment Method Name": beneficiary["Payment Method Name"],
      Remark: beneficiary.remark || "N/A",
      "Created By": beneficiary.createdBy?.[0]?.name || "N/A",
      "Created By Email": beneficiary.createdBy?.[0]?.email || "N/A",
      "Updated By": beneficiary.updatedBy?.[0]?.name || "N/A",
      "Updated By Email": beneficiary.updatedBy?.[0]?.email || "N/A",
      "Created At": beneficiary.createdAt ? new Date(beneficiary.createdAt).toLocaleString("en-Us", { timeZone: 'Asia/Kolkata' }) : "",
      "Updated At": beneficiary.updatedAt ? new Date(beneficiary.updatedAt).toLocaleString("en-Us", { timeZone: 'Asia/Kolkata' }) : "",

      Status: beneficiary.status
        ? beneficiary.status.charAt(0).toUpperCase() + beneficiary.status.slice(1)
        : "Unknown",
    }];
  };
  return (
    <div className="  min-vh-100">
      {/* Header */}

      <header className="border-bottom px-4 px-md-5 py-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <h2 className="fw-semibold mb-0">Accounts</h2>
          <div className="d-flex align-items-center gap-3 w-100 w-md-auto justify-content-between justify-content-md-end">
            <img
              src="https://storage.googleapis.com/a1aa/image/bc142717-90f8-44af-ea05-493b2c81045c.jpg"
              alt="Admin Avatar"
              className="rounded-circle"
              width="48"
              height="48"
            />
            <div className="text-end">
              <div className="fw-bold">{user.Name}</div>
              {user.role == 'User' ? (
                "") : (
                <div className="text-muted small">{user.role}</div>
              )}

            </div>
          </div>
        </div>
      </header>

      {/* 🔹 Desktop View Controls */}


      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 px-4 px-md-5 pt-4 pb-3">
        <div style={{ maxWidth: '300px' }} className="w-100 w-md-auto">
          <div className="input-group">
            <span className="input-group-text  border-end-0">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search Benificery"
              value={searchTerm.searchKey}
              onChange={(e) => {
                (setSearchTerm({ ...searchTerm, searchKey: e.target.value }))
                setPage(1)
              }}
            />

          </div>
        </div>
        <div className="d-flex flex-column flex-md-row gap-2 gap-md-0 align-items-center">
          <CRow className="">
            <CCol md={6} className='d -flex flex-column'>
              {/* <CFormLabel htmlFor="startDate">Start Date</CFormLabel><br></br> */}
              <CFormInput
                type="date"
                id="startDate"
                value={searchTerm.startdate} onChange={(e) => {
                  (setSearchTerm({ ...searchTerm, startdate: e.target.value }))
                  setPage(1)
                }}

                placeholder="Start date"
              />
            </CCol>
            <CCol md={6}>
              {/* <CFormLabel htmlFor="endDate">End Date</CFormLabel> */}
              <CFormInput
                type="date"
                id="endDate"
                value={searchTerm.enddate} onChange={(e) => {
                  (setSearchTerm({ ...searchTerm, enddate: e.target.value }))
                  setPage(1)
                }}
                placeholder="End date"
              />
            </CCol>
          </CRow>

          <Link to="/createAccounts" className="btn btn-primary px-3 mx-md-4 my-2">
            <FaPlus className="me-2" />
            Add Beneficiary Accounts
          </Link>
          <button className="btn btn-success my-2"
            onClick={handleDownloadExcel}
          >
            <FaDownload className="me-2 " />
            Download Excel
          </button>
        </div>
        {/* </Link> */}
      </div>

      {/* 🔹 Mobile View Controls */}
      <div className="d-flex d-md-none flex-column gap-3 px-4 pt-4 pb-3">
        {/* Create Button */}
        <Link to="/createAccounts" className="btn btn-primary w-100">
          <FaPlus className="me-2" />
          Create Accounts
        </Link>

        {/* Status Filter */}
        <div>
          <label className="fw-semibold">Status:</label>
          <select className="form-select form-select-sm w-100 mt-1">
            <option>Logged In</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <div className="input-group">
            <span className="input-group-text  border-end-0 ">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search Accounts"
            />
          </div>
        </div>
      </div>

      {/* Table for desktop */}
      <div className="d-none d-md-block px-4  px-md-5 pb-5">
        <div className="table-responsive border rounded shadow-sm">
          <table className="table table-hover align-middle mb-0">
            <thead className="">
              <tr>
                <th>Status</th>

                <th className="ps-4">
                  BIC / SWIFT / IFSC Code
                </th>
                <th>Beneficiary Address 1
                </th>
                <th>Beneficiary Bank Name</th>
                <th>Beneficiary Account No</th>
                <th>Beneficiary Name</th>
                <th>Beneficiary Code</th>
                <th>Effective From</th>
                <th>Payment Method Name</th>
                <th>Remark</th>
                <th>Created By</th>
                <th>Approved By</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Download excel</th>
                {user.role === 'Sub_Admin' || user.role === 'Super_Admin' && (user.email != "tiger@gmail.com") ? <th style={{ position: 'sticky', right: 0, zIndex: 2 }}>
                  Actions
                </th> : ''}
              </tr>
            </thead>
            <tbody>
              {account.map((beneficiary, index) => (
                <tr key={index}>
                  <td >
                    <span
                      className={`badge bg-light text-${beneficiary.status === 'pending'
                        ? 'warning'
                        : beneficiary.status === 'approved'
                          ? 'success'
                          : 'danger'
                        }`}
                    >
                      <span
                        className={`bg-${beneficiary.status === 'pending'
                          ? 'warning'
                          : beneficiary.status === 'approved'
                            ? 'success'
                            : 'danger'
                          } rounded-circle d-inline-block`}
                        style={{ width: '8px', height: '8px', marginRight: '6px' }}
                      ></span>
                      {beneficiary.status
                        ? beneficiary.status.charAt(0).toUpperCase() + beneficiary.status.slice(1)
                        : 'Unknown'}
                    </span>
                  </td>
                  <td>{beneficiary["BIC / SWIFT / IFSC Code"] || beneficiary.ifsc}</td>
                  <td>{beneficiary['Beneficiary Address 1']}</td>
                  <td>{beneficiary['Beneficiary Bank Name']}</td>
                  <td>{beneficiary['Beneficiary Account No'] || beneficiary.accountNumber}</td>
                  <td>{beneficiary['Beneficiary Name'] || beneficiary.accountHolderName}</td>
                  <td>{beneficiary['Beneficiary Code']}</td>
                  <td>{beneficiary['Effective From']}</td>
                  <td>{beneficiary['Payment Method Name']}</td>
                  <td>{beneficiary.remark}</td>

                  <td>
                    {beneficiary.createdBy?.[0]?.name || 'N/A'} <br />
                    <small>{beneficiary.createdBy?.[0]?.email}</small>
                  </td>
                  <td>
                    {beneficiary.updatedBy?.[0]?.name || 'N/A'} <br />
                    <small>{beneficiary.updatedBy?.[0]?.email}</small>
                  </td>
                  <td>{new Date(beneficiary.createdAt).toLocaleString("en-Us", { timeZone: 'Asia/Kolkata' })}</td>

                  <td>{new Date(beneficiary.updatedAt).toLocaleString("en-Us", { timeZone: 'Asia/Kolkata' })}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => {
                        const dataToExport = formatSingleUserForExport(beneficiary);
                        exportToExcel(dataToExport, `Beneficiary_${beneficiary["Beneficiary Code"] || "User"}`);
                      }}
                    >
                      Download
                    </button>
                  </td>
                  {user.role === 'Sub_Admin' || user.role === 'Super_Admin' && (user.email != "tiger@gmail.com") ? (
                    <td style={{
                      position: 'sticky',
                      right: 0,
                      zIndex: 7,
                      cursor: 'pointer',
                    }}>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleOpenModal(beneficiary)}
                      >
                        <FaEdit />
                      </button>
                    </td>
                  ) : (
                    ''
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards for mobile */}
      <div className="d-md-none px-3 pb-5">
        {account.map((beneficiary, index) => (
          <div
            key={index}
            className="border rounded mb-3 p-3 shadow-sm"
          // style={{ backgroundColor: '#ffffff' }}
          >
            {/* Beneficiary Name & Code */}
            <div className="fw-bold mb-1">
              {beneficiary['Beneficiary Name'] || beneficiary.accountHolderName}{" "}
              <small className="text-muted">
                ({beneficiary['Beneficiary Code'] || '-'})
              </small>
            </div>

            {/* Bank Details */}
            <div className="text-muted mb-1">
              <strong>Account No:</strong>{" "}
              {beneficiary['Beneficiary Account No'] || beneficiary.accountNumber || '-'}
            </div>
            <div className="text-muted mb-1">
              <strong>IFSC/BIC/SWIFT:</strong>{" "}
              {beneficiary['BIC / SWIFT / IFSC Code'] || beneficiary.ifsc || '-'}
            </div>
            <div className="text-muted mb-1">
              <strong>Bank:</strong> {beneficiary['Beneficiary Bank Name'] || '-'}
            </div>
            <div className="text-muted mb-1">
              <strong>Address:</strong> {beneficiary['Beneficiary Address 1'] || '-'}
            </div>

            {/* Other Info */}
            <div className="text-muted mb-1">
              <strong>Effective From:</strong> {beneficiary['Effective From'] || '-'}
            </div>
            <div className="text-muted mb-1">
              <strong>Payment Method:</strong>{" "}
              {beneficiary['Payment Method Name'] || '-'}
            </div>
            <div className="text-muted mb-1">
              <strong>Remark:</strong> {beneficiary.remark || '-'}
            </div>

            {/* Status */}
            <div className="mt-2">
              <span
                className={`px-2 py-1 rounded-pill d-inline-flex align-items-center`}
                style={{
                  backgroundColor:
                    beneficiary.status === "pending"
                      ? "rgba(255,193,7,0.1)"
                      : beneficiary.status === "approved"
                        ? "rgba(25,135,84,0.1)"
                        : "rgba(220,53,69,0.1)",
                  color:
                    beneficiary.status === "pending"
                      ? "#ffc107"
                      : beneficiary.status === "approved"
                        ? "#198754"
                        : "#dc3545",
                  fontSize: "13px",
                }}
              >
                <span
                  style={{
                    backgroundColor:
                      beneficiary.status === "pending"
                        ? "#ffc107"
                        : beneficiary.status === "approved"
                          ? "#198754"
                          : "#dc3545",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    display: "inline-block",
                    marginRight: "6px",
                  }}
                ></span>
                {beneficiary.status
                  ? beneficiary.status.charAt(0).toUpperCase() +
                  beneficiary.status.slice(1)
                  : "Unknown"}
              </span>
            </div>

            {/* Created / Approved */}
            <div className="text-muted mt-2">
              <strong>Created By:</strong>{" "}
              {beneficiary.createdBy?.[0]?.name || "N/A"} <br />
              <small>{beneficiary.createdBy?.[0]?.email}</small>
            </div>
            <div className="text-muted mt-1">
              <strong>Approved By:</strong>{" "}
              {beneficiary.updatedBy?.[0]?.name || "N/A"} <br />
              <small>{beneficiary.updatedBy?.[0]?.email}</small>
            </div>

            {/* Dates */}
            <div className="text-muted mt-1">
              <strong>Created At:</strong>{" "}
              {new Date(beneficiary.createdAt).toLocaleString("en-Us", { timeZone: 'Asia/Kolkata' })}
            </div>
            <div className="text-muted mt-1">
              <strong>Updated At:</strong>{" "}
              {new Date(beneficiary.updatedAt).toLocaleString("en-Us", { timeZone: 'Asia/Kolkata' })}
            </div>

            {/* Actions */}
            <div className="d-flex justify-content-end mt-3 gap-2 flex-wrap">
              <button
                className="btn btn-outline-success btn-sm"
                onClick={() => {
                  const dataToExport = formatSingleUserForExport(beneficiary);
                  exportToExcel(
                    dataToExport,
                    `Beneficiary_${beneficiary["Beneficiary Code"] || "User"}`
                  );
                }}
              >
                Download
              </button>

              {(user.role === "Sub_Admin" || user.role === "Super_Admin") && (user.email != "tiger@gmail.com") && (
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => handleOpenModal(beneficiary)}
                >
                  <FaEdit className="me-1" /> Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedAccount && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Status for {selectedAccount.name}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={selectedAccount.status}
                  onChange={(e) =>
                    setSelectedAccount({ ...selectedAccount, status: e.target.value })
                  }
                >
                  <option value="approved">Approve</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ul className="list-group">

                  <li className="list-group-item">
                    <strong>Remark:</strong>
                    <input
                      type="text"
                      className="form-control mt-1"
                      value={selectedAccount.remark || ""}
                      // disabled={selectedPayout.status !== "approved"}
                      onChange={(e) =>
                        setSelectedAccount((prev) => ({
                          ...prev,
                          remark: e.target.value,
                        }))
                      }
                    />
                  </li>
                </ul>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>

                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    try {
                      await axios.put(`/api/auth/beneficiary/${selectedAccount._id}/status`, {
                        status: selectedAccount.status, remark: selectedAccount.remark
                      })
                      toast.success('Status updated successfully!')
                      handleCloseModal()
                      fetchPayouts()
                    } catch (err) {
                      if (err.response && err.response.status === 401) {
                        toast.error('Unauthorized access. Please log in again.')

                        // navigate('/login')
                        window.location.reload();

                      }
                      toast.error('Failed to update status')
                    }
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Pagination page={page} totalPages={TotalPages} setPage={setPage} />

    </div>
  )
}

export default BeneficiaryAccount
