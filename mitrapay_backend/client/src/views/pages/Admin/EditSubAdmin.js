import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
// Note: CModal components are imported but not used in the final JSX, 
// as the request was only for color and design changes without a modal/canvas.
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader } from '@coreui/react'

function EditSubAdmin() {
  const { id } = useParams()
  const navigate = useNavigate()

  const ACCENT_COLOR = 'rgb(255, 102, 0)' // #ff6600
  const ACCENT_COLOR_DARK = '#cc5200'

  const permissionLabels = [
    'Dashboard',
    'User',
    'Create User',
    'View User',
    'Edit User',
    'Money Transfer', // Added for consistency with CreateSubAdmin
    'Send Money',
    'View Transaction',
    'Multiple Payments',
  ].filter((v, i, a) => a.indexOf(v) === i) // Ensure unique labels

  const [formData, setFormData] = useState({
    Name: '',
    User_name: '',
    email: '',
    Phone: '',
    Status: 'Active',
    Password: '',
    role: 'Sub_Admin',
    Pages: [],
    CreatedBy: 'Super_Admin',
  })

  const [errors, setErrors] = useState({})

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchSubAdmin = async () => {
      try {
        const res = await axios.get(`/api/auth/edit_subadmin/${id}`, {
          withCredentials: true,
        })
        const data = res.data
        setFormData({
          Name: data.Name || '',
          User_name: data.User_name || '',
          email: data.email || '',
          Phone: data.Phone || '',
          Status: data.Status || 'Active',
          Password: '', // don't prefill password
          role: data.role || 'Sub_Admin',
          Pages: data.Pages || [],
          CreatedBy: data.CreatedBy || 'Super_Admin',
        })
      } catch (err) {
        toast.error('Failed to fetch subadmin details')
        if (err.response && err.response.status === 401) {
          toast.error('Unauthorized access. Please log in again.')
          window.location.reload()
        }
      }
    }

    fetchSubAdmin()
  }, [id])

  // --- Handlers ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
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

    if (formData.Password && formData.Password.length < 8) {
      newErrors.Password = 'Password must be at least 8 characters'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix the validation errors')
      return false
    }

    return true
  }

  // --- Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await axios.put(
        `/api/auth/update_subadmin`,
        { ...formData, id }, // pass id with body
        { withCredentials: true },
      )
      toast.success('Co Admin updated successfully! 🎉')
      navigate('/viewCoAdmin')
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
              to="/viewCoAdmin"
              className="btn btn-outline-dark rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{ width: '40px', height: '40px', borderColor: '#343a40' }}
            >
              <i className="fas fa-chevron-left"></i>
            </Link>
            <h1 className="h4 fw-bold mb-0 text-dark">
              Edit Co-Admin User: {formData.User_name}
            </h1>
          </div>
          <Link
            to="/viewCoAdmin"
            className="btn btn-outline-secondary px-4 py-2 fw-semibold rounded-pill"
          >
            <i className="fas fa-list me-2"></i> View Co-Admin
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
                  Login and Contact Information
                </h5>
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

              {/* Password (Optional) */}
              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="password"
                    name="Password"
                    id="Password"
                    className={`form-control ${errors.Password ? 'is-invalid' : ''}`}
                    placeholder="Password (Leave blank to keep current)"
                    value={formData.Password}
                    onChange={handleChange}
                    style={{
                      borderRadius: '8px',
                      borderColor: '#ddd',
                      height: '56px',
                    }}
                  />
                  <label htmlFor="Password" className="text-secondary">
                    New Password (Optional)
                  </label>
                  {errors.Password && (
                    <div className="invalid-feedback">{errors.Password}</div>
                  )}
                </div>
              </div>

              {/* Status Select */}
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
                    Account Status
                  </label>
                </div>
              </div>

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
                            boxShadow: isSelected
                              ? `0 2px 5px ${ACCENT_COLOR}33`
                              : 'none',
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
                  <i className="fas fa-edit me-2"></i> Update Co Admin Details
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditSubAdmin