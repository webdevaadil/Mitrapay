
import { Link } from 'react-router-dom'

function CreateApiKey() {
  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded shadow-sm mb-3">
        <header className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
          <Link
           to={"/apilist"}
            className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: '40px',
              height: '40px',
              border: '1px solid #dee2e6',
            }}
            aria-label="Back"
          >
            <i className="fas fa-arrow-left fs-5 text-dark"></i>
          </Link>
          <h1 className="h5 fw-bold flex-grow-1 ms-2 mb-0">Create API Key</h1>
          <Link to="/apilist" className="btn btn-primary px-4 py-2 shadow-sm">
            Save
          </Link>
        </header>
      </div>

      {/* Form Section */}
      <form className="bg-white px-5 py-4 rounded border shadow-sm">
        <div className="col-12 py-4">
          <h6 className="form-label-small mb-2 fw-bold text-uppercase text-primary">Details</h6>
          <p className="form-text-xs mb-0 text-muted">
            This is info about the gaming website. You can share the redirect URL with the developer
            to forward payment requests.
          </p>
        </div>

        <div className="row g-4">
          {[
            { label: 'Name', type: 'text', placeholder: 'Enter Name' },
            { label: 'Username', type: 'text', placeholder: 'Enter Username' },
            { label: 'Email', type: 'email', placeholder: 'Enter Email' },
            { label: 'Phone', type: 'number', placeholder: 'Enter Phone' },
            { label: 'Password', type: 'password', placeholder: 'Enter Password' },
          ].map((field, index) => (
            <div className="col-12 col-md-6" key={index}>
              <label className="form-label fw-semibold small text-dark mb-1">{field.label}</label>
              <input
                type={field.type}
                className="form-control form-control-sm p-2 border rounded shadow-sm"
                placeholder={field.placeholder}
              />
            </div>
          ))}

          <div className="row g-3">
            {['Status', 'Skip Decimal', 'Payin', 'Pay Out', 'Sub Admin Approve'].map((label, idx) => (
              <div className="col-12 col-md-6" key={idx}>
                <div className="d-flex justify-content-between align-items-center bg-white px-3 py-2 rounded border">
                  <span className="form-label-small text-dark">{label}</span>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`switch-${idx}`}
                      style={{ transform: 'scale(1.3)', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {[
            { label: 'Payout Method', type: 'select', options: ['Bank Transfer', 'UPI', 'Wallet'] },
            { label: 'Pay In Commission (%)', type: 'number', placeholder: 'Enter Pay In Commission' },
            { label: 'Pay Out Commission (%)', type: 'number', placeholder: 'Enter Pay Out Commission' },
            { label: 'Cash Charge', type: 'number', placeholder: 'Enter Cash Charge' },
            { label: 'Website', type: 'url', placeholder: 'Enter Website URL' },
            { label: 'Wallet Callback URL (Payin)', type: 'url', placeholder: 'Enter Payin Callback URL' },
            { label: 'Wallet Callback URL (Payout)', type: 'url', placeholder: 'Enter Payout Callback URL' },
            { label: 'Return Redirect URL', type: 'url', placeholder: 'Enter Redirect URL' },
          ].map((field, index) => (
            <div className="col-12 col-md-6" key={index}>
              <label className="form-label fw-semibold small text-dark mb-1">{field.label}</label>
              {field.type === 'select' ? (
                <select className="form-select form-select-sm p-2 border rounded shadow-sm">
                  <option value="">Select Method</option>
                  {field.options.map((opt, idx) => (
                    <option value={opt.toLowerCase()} key={idx}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  className="form-control form-control-sm p-2 border rounded shadow-sm"
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}
        </div>

        {/* Permissions */}
        <div className="mt-5">
          <h6 className="form-label-small pt-4 fw-bold text-uppercase text-primary">Permissions</h6>
          <p className="form-text-xs text-muted">
            This section contains the account and UPI details to receive payments.
          </p>
          <div className="row g-3">
            {[
              'View Dashboard',
              'View Payin',
              'Approve Payin',
              'View Pay Out',
              'Approve Pay Out',
              'View Created By',
              'View Order Creator',
              'Create Order Creator',
              'Edit Order Creator',
              'View All Users Filter',
              'View Order Creators Filter',
              'View Claim',
            ].map((label, idx) => (
              <div className="col-12 col-md-6" key={idx}>
                <div className="d-flex justify-content-between align-items-center bg-white px-3 py-2 rounded border">
                  <span className="form-label-small text-dark">{label}</span>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`perm-switch-${idx}`}
                      style={{ transform: 'scale(1.3)', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  )
}

export default CreateApiKey
