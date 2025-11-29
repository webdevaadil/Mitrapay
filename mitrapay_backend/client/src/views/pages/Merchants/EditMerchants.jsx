import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

function EditMerchants() {
  const { username } = useParams()

  // Sample: Fetching merchant data (replace with actual API call)
  const [merchantData, setMerchantData] = useState(null)

  useEffect(() => {
    // Simulated API response
    const mockData = {
      subadmin: 'STEST',
      name: 'S TEST ACCOUNT',
      username: username,
      email: `${username}@gmail.com`,
      phone: '74561239877',
      password: '*****',
    }

    setMerchantData(mockData)
  }, [username])

  if (!merchantData) return <div>Loading...</div>

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded shadow-sm mb-3">
        <header className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
          <Link
            to="/merchantslist"
            className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '40px', height: '40px', border: '1px solid #dee2e6' }}
            aria-label="Back"
          >
            <i className="fas fa-arrow-left fs-5 text-dark"></i>
          </Link>
          <h1 className="h5 fw-bold flex-grow-1 ms-2 mb-0 text-dark">Edit Merchant</h1>
          <Link to="/merchantslist" className="btn btn-primary px-4 py-2 shadow-sm">
            Update
          </Link>
        </header>
      </div>

      {/* Form */}
      <div className="row align-items-start">
        <div className="col-12">
          <form className="bg-white px-5 py-4 rounded border shadow-sm">
            <div className="col-12 py-4">
              <h6 className="form-label-small mb-2 fw-bold text-uppercase text-primary">Details</h6>
              <p className="form-text-xs mb-0 text-muted">
                Edit merchant info like email, phone, and permissions.
              </p>
            </div>

            <div className="row g-4">
              {[
                { id: 'subadmin', label: 'Sub Admin', type: 'select', value: merchantData.subadmin },
                { id: 'name', label: 'Name', type: 'text', value: merchantData.name },
                { id: 'username', label: 'Username', type: 'text', value: merchantData.username },
                { id: 'email', label: 'Email', type: 'email', value: merchantData.email },
                { id: 'phone', label: 'Phone', type: 'text', value: merchantData.phone },
                { id: 'password', label: 'Password', type: 'password', value: merchantData.password },
              ].map((field) => (
                <div className="col-12 col-md-6" key={field.id}>
                  <label htmlFor={field.id} className="form-label fw-semibold small text-dark mb-1">
                    {field.label}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      id={field.id}
                      className="form-select form-select-sm p-2 border rounded shadow-sm"
                      defaultValue={field.value}
                    >
                      <option>{field.value}</option>
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      id={field.id}
                      defaultValue={field.value}
                      className="form-control form-control-sm p-2 border rounded shadow-sm"
                    />
                  )}
                </div>
              ))}

              {/* Permissions Section */}
              <div className="col-12 pt-4">
                <h6 className="form-label-small fw-bold text-uppercase text-primary">Permissions</h6>
                <p className="form-text-xs text-muted">Control access to merchant features.</p>

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
                            id={`switch-${idx}`}
                            style={{ transform: 'scale(1.3)', cursor: 'pointer' }}
                            defaultChecked={true}
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

export default EditMerchants
