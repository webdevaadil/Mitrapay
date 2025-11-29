import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

function EditAccounts() {
  const { username } = useParams()

  const [account, setAccount] = useState(null)

  useEffect(() => {
    // Replace this with real API fetch
    const fetchedAccount = {
      username: username,
      email: `${username}@gmail.com`,
      phone: '74561239877',
      password: '*****',
      accountNumber: '1234567890',
      accountHolderName: 'Test Holder',
      ifsc: 'ABC123456',
      upiName: 'TestUPI',
      upiId: 'test@upi',
      payoutLimit: 100000,
    }

    setAccount(fetchedAccount)
  }, [username])

  if (!account) return <div>Loading...</div>

  return (
    <div className="container py-4">
      <div className="bg-white rounded shadow-sm mb-3">
        <header className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
          <Link
            to="/accountList"
            className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '40px', height: '40px', border: '1px solid #dee2e6' }}
          >
            <i className="fas fa-arrow-left fs-5 text-dark"></i>
          </Link>
          <h1 className="h5 fw-bold flex-grow-1 ms-2 mb-0 text-dark">Edit Account</h1>
          <Link to="/accountList" className="btn btn-primary px-4 py-2 shadow-sm">
            Update
          </Link>
        </header>
      </div>

      <div className="row justify-content-center">
        <div className="col-12">
          <form className="bg-white px-5 py-4 rounded border shadow-sm">
            {/* Details */}
            <div className="mb-4">
              <h6 className="form-label-small mb-2 fw-bold text-uppercase text-primary">Details</h6>
              <p className="form-text-xs mb-0 text-muted">
                Update the account information for this user.
              </p>
            </div>

            <div className="row g-4">
              {[
                { id: 'username', label: 'Username', type: 'text', value: account.username },
                { id: 'email', label: 'Email', type: 'email', value: account.email },
                { id: 'phone', label: 'Phone', type: 'text', value: account.phone },
                { id: 'password', label: 'Password', type: 'password', value: account.password },
              ].map((field) => (
                <div className="col-12 col-md-6" key={field.id}>
                  <label htmlFor={field.id} className="form-label fw-semibold small text-dark mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    id={field.id}
                    defaultValue={field.value}
                    className="form-control form-control-sm p-2 border rounded shadow-sm"
                  />
                </div>
              ))}

              {/* Status & Logout */}
              {['Status', 'Logout'].map((label, idx) => (
                <div className="col-12 col-md-6" key={idx}>
                  <div className="d-flex justify-content-between align-items-center px-3 py-2 rounded border">
                    <span className="form-label-small text-dark">{label}</span>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`switch-${idx}`}
                        defaultChecked={true}
                        style={{ transform: 'scale(1.3)', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* OR Code Upload */}
              <div className="col-12 pt-4">
                <h6 className="form-label-small fw-bold text-uppercase text-primary">Payment Data</h6>
                <p className="form-text-xs text-muted">
                  This section contains the account and UPI details to receive payments.
                </p>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold small text-dark mb-1">OR Code</label>
                <div
                  className="d-flex flex-column align-items-center justify-content-center border rounded py-4"
                  style={{ borderStyle: 'dashed', borderColor: '#ccc' }}
                >
                  <i className="fas fa-upload fs-2 mb-2 text-secondary"></i>
                  <p className="mb-1 text-dark">
                    <strong>Upload file</strong>{' '}
                    <span className="text-muted">PNG or JPEG</span>{' '}
                    <label htmlFor="orCodeFile" className="text-primary" style={{ cursor: 'pointer' }}>
                      Select file
                    </label>
                  </p>
                  <input type="file" id="orCodeFile" accept="image/png, image/jpeg" className="d-none" />
                </div>
              </div>

              {/* Bank/UPI Details */}
              {[
                { id: 'accountNumber', label: 'Account Number', value: account.accountNumber },
                { id: 'accountHolderName', label: 'Account Holder Name', value: account.accountHolderName },
                { id: 'ifsc', label: 'IFSC Code', value: account.ifsc },
                { id: 'upiName', label: 'UPI Name', value: account.upiName },
                { id: 'upiId', label: 'UPI ID', value: account.upiId },
              ].map((field) => (
                <div className="col-12 col-md-6" key={field.id}>
                  <label htmlFor={field.id} className="form-label fw-semibold small text-dark mb-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    id={field.id}
                    defaultValue={field.value}
                    className="form-control form-control-sm p-2 border rounded shadow-sm"
                  />
                </div>
              ))}

              {/* Payout Limit */}
              <div className="col-12 col-md-6">
                <label htmlFor="payoutLimit" className="form-label fw-semibold small text-dark mb-1">
                  Pay out limit
                </label>
                <input
                  type="number"
                  id="payoutLimit"
                  defaultValue={account.payoutLimit}
                  className="form-control form-control-sm p-2 border rounded shadow-sm"
                />
              </div>

              {/* Permissions */}
              <div className="col-12 pt-4">
                <h6 className="form-label-small fw-bold text-uppercase text-primary">Permissions</h6>
                <p className="form-text-xs text-muted">
                  This section allows access control for various features.
                </p>

                <div className="row g-3">
                  {[
                    'View Dashboard',
                    'View Payin',
                    'View Pay Out',
                    'View Upline Payments',
                    'View Reports',
                    'View Claim',
                    'View Settlement',
                    'Create Manual Pay In',
                  ].map((label, idx) => (
                    <div className="col-12 col-md-6" key={idx}>
                      <div className="d-flex justify-content-between align-items-center px-3 py-2 rounded border">
                        <span className="form-label-small text-dark">{label}</span>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`perm-switch-${idx}`}
                            defaultChecked={true}
                            style={{ transform: 'scale(1.3)', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditAccounts
