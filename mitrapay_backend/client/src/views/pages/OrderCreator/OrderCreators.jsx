import React from 'react'
import { FaSearch, FaPlus, FaEdit } from 'react-icons/fa'
import { Link } from 'react-router-dom'

function OrderCreators() {
  const creators = [
    { name: 'S TEST ACCOUNT', username: 'stestac', email: 'stestac@gmail.com' },
    { name: 'Sky', username: 'sky', email: 'skyoc@gmail.com' },
    { name: '1x', username: '1x', email: '1xoc@gmail.com' },
    { name: 'Ganeshoc', username: 'gnoc', email: 'gnoc@gmail.com' },
    { name: 'pd25', username: 'pd25', email: 'pd25@gmail.com' },
    { name: 'pd24', username: 'pd24', email: 'pd24@gmail.com' },
    { name: 'pd23', username: 'pd23', email: 'pd23@gmail.com' },
    { name: 'pd22', username: 'pd22', email: 'pd22@gmail.com' },
    { name: 'pd21', username: 'pd21', email: 'pd21@gmail.com' },
  ]

  return (
    <div className="bg-white text-dark min-vh-100 m-0 p-0">
      {/* Header */}
      <header className="border-bottom px-4 px-md-5 py-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <h2 className="fw-semibold mb-0">Order Creators</h2>
          <div className="d-flex align-items-center gap-3 w-100 w-md-auto justify-content-between justify-content-md-end">
            <img
              src="https://storage.googleapis.com/a1aa/image/bc142717-90f8-44af-ea05-493b2c81045c.jpg"
              alt="Admin Avatar"
              className="rounded-circle"
              width="48"
              height="48"
            />
            <div className="text-end">
              <div className="fw-bold">Admin</div>
              <div className="text-muted small">Unit 4</div>
              <div className="fw-bold">
                Balance: <span className="text-success">₹45000</span>
              </div>
            </div>
          </div>
        </div>
      </header>

    
  {/* 🔹 Desktop View Controls */}
<div className="d-none d-md-flex flex-row justify-content-between align-items-center gap-3 px-5 pt-4 pb-3">
  {/* Website Filter */}
  <div className="d-flex align-items-center">
    <label className="me-2 fw-semibold mb-0">Website:</label>
    <select className="form-select form-select-sm">
      <option>All sdfgrt</option>
    </select>
  </div>

  {/* Search */}
  <div className="input-group" style={{ maxWidth: '300px' }}>
    <span className="input-group-text bg-white border-end-0 text-dark">
      <FaSearch />
    </span>
    <input
      type="text"
      className="form-control border-start-0"
      placeholder="Search"
    />
  </div>

  {/* Create Button */}
  <Link
    to="/createOrderCreator"
    className="btn btn-primary"
    style={{ minWidth: 'fit-content', whiteSpace: 'nowrap' }}
  >
    <FaPlus className="me-2" />
    New Order Creator
  </Link>
</div>

{/* 🔹 Mobile View Controls */}
<div className="d-flex d-md-none flex-column gap-3 px-4 pt-4 pb-3">
  {/* Website Filter */}
   <Link
    to="/createOrderCreator"
    className="btn btn-primary w-100"
  >
    <FaPlus className="me-2" />
    New Order Creator
  </Link>

  <div>
    <label className="fw-semibold">Website:</label>
    <select className="form-select form-select-sm w-100 mt-1">
      <option>All sdfgrt</option>
    </select>
  </div>

  {/* Search */}
  <div>
    <div className="input-group">
      <span className="input-group-text bg-white border-end-0 text-dark">
        <FaSearch />
      </span>
      <input
        type="text"
        className="form-control border-start-0"
        placeholder="Search"
      />
    </div>
  </div>
 
</div>

      {/* Content Section */}
      <div className="px-4 px-md-5 pb-5">
        {/* Desktop Table */}
        <div className="table-responsive d-none d-md-block border rounded shadow-sm">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Name</th>
                <th>User Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {creators.map((user, index) => (
                <tr key={index}>
                  <td className="ps-4 p-3">{user.name}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className="badge bg-light text-success d-inline-flex align-items-center gap-1">
                      <span
                        className="bg-success rounded-circle d-inline-block"
                        style={{ width: '8px', height: '8px' }}
                      ></span>
                      Active
                    </span>
                  </td>
                  <td>
                    <Link to={`/editOrderCreator/${user.username}`}>
                      <FaEdit className="text-muted" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="d-md-none">
          {creators.map((user, index) => (
            <div
              key={index}
              className="border rounded mb-3 p-3 shadow-sm"
              style={{ backgroundColor: '#ffffff' }}
            >
              <div className="fw-bold mb-1">{user.name}</div>
              <div><strong>Username:</strong> {user.username}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div className="mt-2">
                <span
                  className="px-2 py-1 rounded-pill d-inline-flex align-items-center"
                  style={{
                    backgroundColor: 'rgba(25,135,84,0.1)',
                    color: '#198754',
                    fontSize: '13px',
                  }}
                >
                  <span
                    style={{
                      backgroundColor: '#198754',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      display: 'inline-block',
                      marginRight: '6px',
                    }}
                  ></span>
                  Active
                </span>
              </div>
              <div className="d-flex justify-content-end mt-2">
                <Link
                  to={`/editOrderCreator/${user.username}`}
                  className="btn btn-outline-secondary btn-sm"
                >
                  <FaEdit className="me-1" /> Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OrderCreators
