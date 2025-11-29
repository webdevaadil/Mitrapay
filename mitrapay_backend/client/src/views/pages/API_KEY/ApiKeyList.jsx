import React from 'react'
import { FaSearch, FaEye } from 'react-icons/fa'
import { Link } from 'react-router-dom'

function ApiKeyList() {
  const apiKeys = [
    {
      srNo: 1,
      name: 'STEST – subadmin',
      username: 'STEST',
      website: 'https://opensea.io',
      phone: '7894561239',
      status: 'Active',
    },
    {
      srNo: 2,
      name: 'jewel247 – subadmin',
      username: 'jewel247',
      website: 'https://www.google.com/',
      phone: '879786532357',
      status: 'Active',
    },
    {
      srNo: 3,
      name: 'aura – subadmin',
      username: 'aura',
      website: 'https://www.google.com/',
      phone: '9786434735277',
      status: 'Inactive',
    },
    {
      srNo: 4,
      name: 'jewel365 – subadmin',
      username: 'jewel365',
      website: 'https://www.google.com/',
      phone: '988435786747',
      status: 'Inactive',
    },
    {
      srNo: 5,
      name: 'Mainpayout – subadmin',
      username: 'Mainpayout',
      website: 'https://www.mp.com/',
      phone: '123456543234',
      status: 'Active',
    },
    {
      srNo: 6,
      name: 'Ganesh – subadmin',
      username: 'Ganesh',
      website: 'https://www.google.co.uk/',
      phone: '12345676543',
      status: 'Inactive',
    },
    {
      srNo: 7,
      name: 'Mor Pay – subadmin',
      username: 'Mor Pay',
      website: 'https://morpay.b2cmode.net',
      phone: '12223423423',
      status: 'Active',
    },
    {
      srNo: 8,
      name: '1xbook – subadmin',
      username: '1xbook',
      website: 'https://www.1x.com/',
      phone: '875135765377',
      status: 'Active',
    },
    {
      srNo: 9,
      name: 'ABC Money – subadmin',
      username: 'ABC Money',
      website: 'https://www.abc.com/',
      phone: '1217138283',
      status: 'Inactive',
    },
    {
      srNo: 10,
      name: 'brother247 – subadmin',
      username: 'brother247',
      website: 'https://www.google.com/',
      phone: '8735513573557',
      status: 'Inactive',
    },
  ]

  return (
    <div style={{ backgroundColor: '#ffffff' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center border-bottom px-4 py-4">
        <h2 className="fw-semibold mb-0">API Key List</h2>
        <Link to="/apiCreate" className="btn btn-primary">
          Create Api Key
        </Link>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="input-group" style={{ maxWidth: '300px' }}>
          <span className="input-group-text bg-white border-end-0">
            <FaSearch />
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search"
            style={{ backgroundColor: '#ffffff' }}
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="px-4 pb-5 d-none d-md-block">
        <div className="table-responsive border rounded shadow-sm">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th>Sr. No</th>
                <th>Name</th>
                <th>User Name</th>
                <th>Website</th>
                <th>Phone Number</th>
                <th>Status</th>
                <th>User Assignment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((api, index) => (
                <tr key={index}>
                  <td>{api.srNo}</td>
                  <td>{api.name}</td>
                  <td>{api.username}</td>
                  <td>
                    <a href={api.website} target="_blank" rel="noopener noreferrer">
                      {api.website}
                    </a>
                  </td>
                  <td>{api.phone}</td>
                  <td>
                    <span
                      className="px-2 py-1 rounded-pill d-inline-flex align-items-center"
                      style={{
                        backgroundColor:
                          api.status === 'Active' ? 'rgba(25,135,84,0.1)' : 'rgba(220,53,69,0.1)',
                        color: api.status === 'Active' ? '#198754' : '#dc3545',
                        fontSize: '13px',
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: api.status === 'Active' ? '#198754' : '#dc3545',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          display: 'inline-block',
                          marginRight: '6px',
                        }}
                      ></span>
                      {api.status}
                    </span>
                  </td>
                  <td>
                    <i className="fas fa-user text-muted" />
                  </td>
                  <td>
                    <Link to={`/apiDetails/${api.username}`} className="text-muted">
                      <FaEye />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="d-block d-md-none px-3 pb-4">
        {apiKeys.map((api, index) => (
          <div key={index} className="border rounded shadow-sm p-3 mb-3">
            <div className="fw-semibold">{api.name}</div>
            <div className="text-muted small mb-2">@{api.username}</div>
            <div className="mb-1">
              <strong>Website:</strong>{' '}
              <a href={api.website} target="_blank" rel="noopener noreferrer">
                {api.website}
              </a>
            </div>
            <div className="mb-1">
              <strong>Phone:</strong> {api.phone}
            </div>
            <div className="mb-2">
              <strong>Status:</strong>{' '}
              <span
                className="px-2 py-1 rounded-pill"
                style={{
                  backgroundColor:
                    api.status === 'Active' ? 'rgba(25,135,84,0.1)' : 'rgba(220,53,69,0.1)',
                  color: api.status === 'Active' ? '#198754' : '#dc3545',
                  fontSize: '13px',
                }}
              >
                {api.status}
              </span>
            </div>
            <div className="d-flex justify-content-end">
              <Link to={`/apiDetails/${api.username}`} className="btn btn-sm btn-outline-secondary">
                <FaEye className="me-1" /> View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ApiKeyList
