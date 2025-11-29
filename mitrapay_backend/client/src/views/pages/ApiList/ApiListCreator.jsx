import React from 'react'
import { Link } from 'react-router-dom'

function ApilistCreator() {
  return (
    <div>
      <div className="bg-white rounded mb-3">
        <header className="d-flex align-items-center justify-content-between py-4 px-3">
          <button
            type="button"
            className="btn btn-light rounded-md d-flex align-items-center justify-content-center"
            style={{
              width: '40px',
              height: '40px',
              border: '1px solid #dee2e6',
            }}
            aria-label="Back"
          >
            <i className="fas fa-arrow-left fs-5 text-dark"></i>
          </button>
          <h1 className="h5 fw-semibold flex-grow-1 ms-2 mb-0 fw-bold">Api Creator</h1>
          <Link to={"/apilist"} type="button" className="btn btn-primary px-4 py-2">
            Save
          </Link>
        </header>
      </div>

      {/* Section 1: Info + Form Inputs */}
      <div className="row align-items-start">
        <div className="col-12 col-lg-5">
          <div className="bg-light px-3 rounded">
            <h6 className="form-label-small mb-2 fw-bold">Details</h6>
            <p className="form-text-xs mb-0">
              This info about gaming website, you can share redirect url to website developer for
              forwarding for payment request.
            </p>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <form className="bg-light px-4 rounded">
            {[
              { id: 'subadmin', label: 'Sub Admin', type: 'select', value: 'STEST' },
              { id: 'name', label: 'Name', type: 'text', value: 'S TEST ACCOUNT' },
              { id: 'username', label: 'Username', type: 'text', value: 'stestac' },
              { id: 'email', label: 'Email', type: 'email', value: 'stestac@gmail.com' },
              { id: 'phone', label: 'Phone', type: 'text', value: '74561239877' },
              { id: 'password', label: 'Password', type: 'password', value: '*****' },
            ].map((field) => (
              <div className="mb-3" key={field.id}>
                <label htmlFor={field.id} className="form-label fw-bold form-label-small">
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    id={field.id}
                    className="form-select form-select-sm p-2 rounded"
                    defaultValue={field.value}
                  >
                    <option>{field.value}</option>
                  </select>
                ) : (
                  <input
                    type={field.type}
                    id={field.id}
                    defaultValue={field.value}
                    className="form-control form-control-sm p-2 rounded"
                  />
                )}
              </div>
            ))}
          </form>
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-lg-5"></div>

        <div className="col-12 col-lg-7">
          <div className="bg-light px-3 rounded d-flex align-items-center justify-content-between">
            <label htmlFor="status" className="form-label-small mb-0 fw-bold">
              Status
            </label>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                style={{ transform: 'scale(1.4)', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      </div>
      <hr />
      <div className="row g-4">
        <div className="col-12 col-lg-5">
          <div className="bg-light p-3 rounded">
            <h6 className="form-label-small mb-2 fw-bold">Permissions</h6>
            <p className="form-text-xs mb-0">
              This is account and UPI details to receive payments.
            </p>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="bg-light p-4 rounded d-flex flex-column gap-3">
            {['View Dashboard', 'View Payin', 'View Pay Out', 'Create Manual Pay In'].map(
              (label, idx) => (
                <div key={idx} className="d-flex align-items-center justify-content-between">
                  <span className="form-label-small">{label}</span>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`switch-${idx}`}
                      style={{ transform: 'scale(1.4)', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApilistCreator
