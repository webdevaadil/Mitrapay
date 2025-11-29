import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useSelector } from 'react-redux' // Assuming this is needed for user state

function EditUser() {
  const { id } = useParams()
  const navigate = useNavigate()
  // Assuming this is used, keeping it here.
  const { user } = useSelector((state) => state.user) 

  const ACCENT_COLOR = 'rgb(255, 102, 0)' // #ff6600
  const ACCENT_COLOR_DARK = '#cc5200'

  const permissionLabels = [
    'Dashboard',
    'Send Money',
    'View Transaction',
    'Multiple Payments',
  ]

  const [formData, setFormData] = useState({
    Name: '',
    User_name: '',
    email: '',
    Phone: '',
    Status: 'Active',
    role: 'User',
    Pages: [],
    Subadmin: '',
  })

  const [errors, setErrors] = useState({})
  const [subadminName, setSubadminName] = useState('')

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get(`/api/auth/Edit_user/${id}`, {
          withCredentials: true,
        })

        const userData = userRes.data

        setFormData({
          Name: userData.Name || '',
          User_name: userData.User_name || '',
          email: userData.email || '',
          Phone: userData.Phone || '',
          Status: userData.status || 'Active',
          role: userData.role || 'User',
          Pages: userData.Pages || [],
          Subadmin: userData.Subadmin?._id || userData.Subadmin || '',
        })

        setSubadminName(userData.Subadmin?.Name || 'Unknown')
      } catch (err) {
        toast.error('Failed to load user data')
        if (err.response && err.response.status === 401) {
          toast.error('Unauthorized access. Please log in again.')
          window.location.reload()
        }
      }
    }

    fetchData()
  }, [id, user])

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handlePermissionChange = (label) => {
    const Pages = formData.Pages.includes(label)
      ? formData.Pages.filter((item) => item !== label)
      : [...formData.Pages, label]

    setFormData({ ...formData, Pages })
  }

  // --- Validation ---
  const validateForm = () => {
    const newErrors = {}

    if (!formData.Name.trim()) newErrors.Name = 'Name is required'
    if (!formData.User_name.trim()) newErrors.User_name = 'Username is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.Phone.trim()) {
      newErrors.Phone = 'Phone number is required'
    } else if (!/^\d{10}$/.test(formData.Phone)) {
      newErrors.Phone = 'Phone must be 10 digits'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // --- Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the validation errors')
      return
    }

    const payload = {
      ...formData,
      id,
    }

    try {
      await axios.put('/api/auth/Update_user', payload, {
        withCredentials: true,
      })
      toast.success('User updated successfully! 🎉')
      navigate('/viewUser')
    } catch (err) {
      toast.error(err.response?.data || 'Update failed')
      if (err.response && err.response.status === 401) {
        toast.error('Unauthorized access. Please log in again.')
        window.location.reload()
      }
    }
  }

  // --- Render ---
  return (
    <div className="container py-5">
      {/* HEADER */}
      <div
        className="rounded-3 shadow-sm mb-4 bg-white"
        style={{ borderBottom: `3px solid ${ACCENT_COLOR}` }}
      >
        <header className="d-flex align-items-center justify-content-between px-4 py-3">
          <div className="d-flex align-items-center">
            <Link
              to="/viewUser"
              className="btn btn-outline-dark rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{ width: '40px', height: '40px', borderColor: '#343a40' }}
            >
              <i className="fas fa-chevron-left"></i>
            </Link>
            <h1 className="h4 fw-bold mb-0 text-dark">Edit User: {formData.User_name}</h1>
          </div>
          <Link
            to="/viewUser"
            className="btn btn-outline-secondary px-4 py-2 fw-semibold rounded-pill"
          >
            <i className="fas fa-list me-2"></i> View All Users
          </Link>
        </header>
      </div>

      {/* FORM */}
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <form
            className="p-5 rounded-4 shadow-2xl"
            onSubmit={handleSubmit}
            style={{
              backgroundColor: 'white',
              border: '1px solid #eee',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="row g-4">
              <div className="col-12 mb-4">
                <h5 className="text-uppercase fw-bold text-muted border-bottom pb-2 mb-3">
                  User Details
                </h5>
              </div>

              {/* Subadmin and Status */}
              <div className="col-md-6">
                <div className="form-floating">
                  <p
                    className="form-control"
                    style={{
                      borderRadius: '8px',
                      borderColor: '#ddd',
                      height: '56px',
                      paddingTop: '1.625rem',
                      paddingBottom: '0.625rem',
                    }}
                  >
                    {subadminName}
                  </p>
                  <label htmlFor="Subadmin" className="text-secondary">
                    Managed By (Subadmin)
                  </label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                  <select
                    name="Status"
                    id="Status"
                    className="form-select"
                    value={formData.Status}
                    onChange={handleChange}
                    style={{
                      borderRadius: '8px',
                      borderColor: '#ddd',
                      height: '56px',
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <label htmlFor="Status" className="text-secondary">
                    Status
                  </label>
                </div>
              </div>

              {/* DYNAMIC INPUTS */}
              {[
                { id: 'Name', label: 'Full Name' },
                { id: 'User_name', label: 'Username' },
                { id: 'email', label: 'Email Address', type: 'email' },
                { id: 'Phone', label: 'Phone Number' },
              ].map(({ id, label, type = 'text' }) => (
                <div className="col-md-6" key={id}>
                  <div className="form-floating">
                    <input
                      type={type}
                      name={id}
                      id={id}
                      className={`form-control ${errors[id] ? 'is-invalid' : ''}`}
                      placeholder={label}
                      value={formData[id]}
                      onChange={handleChange}
                      style={{
                        borderRadius: '8px',
                        borderColor: '#ddd',
                        height: '56px',
                      }}
                    />
                    <label htmlFor={id} className="text-secondary">
                      {label}
                    </label>
                    {errors[id] && <div className="invalid-feedback">{errors[id]}</div>}
                  </div>
                </div>
              ))}

              {/* PERMISSIONS */}
              <div className="col-12 pt-5">
                <h5
                  className="text-uppercase fw-bold pb-3"
                  style={{
                    color: ACCENT_COLOR_DARK,
                    borderBottom: `2px solid ${ACCENT_COLOR_DARK}33`,
                  }}
                >
                  Page Access Permissions
                </h5>
                <div className="row g-2 pt-3">
                  {permissionLabels.map((label) => {
                    const isSelected = formData.Pages.includes(label)
                    return (
                      <div className="col-auto" key={label}>
                        <div
                          className="px-3 py-2 rounded-pill border fw-medium user-select-none"
                          style={{
                            borderColor: isSelected ? ACCENT_COLOR : '#ccc',
                            backgroundColor: isSelected ? ACCENT_COLOR : '#f8f9fa',
                            color: isSelected ? 'white' : '#333',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease-in-out',
                            boxShadow: isSelected ? `0 2px 5px ${ACCENT_COLOR}33` : 'none',
                          }}
                          onClick={() => handlePermissionChange(label)}
                        >
                          {label}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="col-12 text-center mt-5">
                <button
                  type="submit"
                  className="btn btn-lg px-5 py-3 fw-bold rounded-pill"
                  style={{
                    backgroundColor: ACCENT_COLOR,
                    color: 'white',
                    boxShadow: `0 10px 30px ${ACCENT_COLOR}66`,
                    transition: 'background-color 0.2s, transform 0.2s',
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = ACCENT_COLOR_DARK)
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = ACCENT_COLOR)
                  }
                >
                  <i className="fas fa-edit me-2"></i> Update User Details
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditUser