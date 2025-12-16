import React, { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { FaChevronLeft, FaList, FaPlusCircle } from 'react-icons/fa' // Import icons for better consistency

function CreateSubAdmin() {
  const navigate = useNavigate()
  const ACCENT_COLOR = 'rgb(255, 102, 178)'
  const ACCENT_COLOR_DARK = '#cc4a92'

  // --- DARK MODE THEME COLORS ---
  const DARK_BG = '#121212' // Main background
  const CARD_BG = '#1e1e1e' // Card/Form background
  const DARK_TEXT = '#e0e0e0' // Light text color
  const MUTED_TEXT = '#9e9e9e' // Muted text color
  const INPUT_BG = '#282828' // Input field background
  const INPUT_BORDER = '#444' // Input border color
  // --- END DARK MODE THEME COLORS ---

  const permissionLabels = [
    'Dashboard',
    'User',
    'Create User',
    'View User',
    'Edit User',
    'Money Transfer',
    'Send Money',
    'View Transaction',
    'Multiple Payments',
  ].filter((v, i, a) => a.indexOf(v) === i)

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

  const validateForm = () => {
    const newErrors = {}
    if (!formData.Name.trim()) newErrors.Name = 'Name is required'
    if (!formData.User_name.trim()) newErrors.User_name = 'Username is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format'
    if (!formData.Phone.trim()) newErrors.Phone = 'Phone number is required'
    else if (!/^\d{10}$/.test(formData.Phone)) newErrors.Phone = 'Phone must be 10 digits'
    if (!formData.Password) newErrors.Password = 'Password is required'
    else if (formData.Password.length < 8) newErrors.Password = 'Password must be at least 8 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please correct the form errors')
      return
    }

    try {
      await axios.post('/api/auth/Create_Subadmin', formData, {
        withCredentials: true,
      })
      toast.success('Sub Admin created successfully!')
      navigate('/viewCoAdmin')
    } catch (err) {
      if (err.response && err.response.status === 401) {
        toast.error('Unauthorized access. Please log in again.')
        window.location.reload()
      }
      toast.error(err.response?.data?.message || 'Something went wrong')
    }
  }


  return (
    // Apply main dark background
    <div className="container py-5" style={{ backgroundColor: DARK_BG, minHeight: '100vh', color: DARK_TEXT }}>
      {/* HEADER */}
      <div
        className="rounded-3 shadow-lg mb-4"
        style={{
          borderBottom: `3px solid ${ACCENT_COLOR}`,
          backgroundColor: CARD_BG, // Dark header background
        }}
      >
        <header className="d-flex align-items-center justify-content-between px-4 py-3">
          <div className="d-flex align-items-center">
            {/* Back Button - Dark Mode Style */}
            <Link
              to="/viewCoAdmin"
              className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{
                width: '40px',
                height: '40px',
                borderColor: MUTED_TEXT,
                color: DARK_TEXT,
              }}
            >
              <FaChevronLeft />
            </Link>
            <h1 className="h4 fw-bold mb-0" style={{ color: DARK_TEXT }}>
              Create Co-Admin User
            </h1>
          </div>
          {/* View Co-Admin Button - Dark Mode Style */}
          <Link
            to="/viewCoAdmin"
            className="btn px-4 py-2 fw-semibold rounded-pill"
            style={{
              backgroundColor: INPUT_BG,
              color: DARK_TEXT,
              borderColor: INPUT_BORDER,
              border: '1px solid',
            }}
          >
            <FaList className="me-2" /> View Co-Admin
          </Link>
        </header>
      </div>

      {/* FORM */}
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <form
            className="p-5 rounded-4 shadow-lg"
            onSubmit={handleSubmit}
            style={{
              backgroundColor: CARD_BG, // Dark form background
              border: `1px solid ${INPUT_BORDER}`,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)', // Deeper shadow
              color: DARK_TEXT,
            }}
          >
            <div className="row g-4">
              <div className="col-12 mb-4">
                <h5 className="text-uppercase fw-bold border-bottom pb-2 mb-3" style={{ color: MUTED_TEXT, borderColor: INPUT_BORDER }}>
                  Login and Contact Information
                </h5>
              </div>

              {/* DYNAMIC INPUTS */}
              {[
                { id: 'Name', label: 'Full Name' },
                { id: 'User_name', label: 'Username' },
                { id: 'email', label: 'Email Address', type: 'email' },
                { id: 'Phone', label: 'Phone Number' },
                { id: 'Password', label: 'Password', type: 'password' },
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
                        height: '56px',
                        backgroundColor: INPUT_BG, // Dark input background
                        color: DARK_TEXT, // Light text color
                        borderColor: INPUT_BORDER,
                      }}
                    />
                    <label htmlFor={id} style={{ color: MUTED_TEXT }}>{label}</label>
                    {errors[id] && <div className="invalid-feedback">{errors[id]}</div>}
                  </div>
                </div>
              ))}

              {/* PERMISSIONS */}
              <div className="col-12 pt-5">
                <h5
                  className="text-uppercase fw-bold pb-3"
                  style={{ color: ACCENT_COLOR, borderBottom: `2px solid ${ACCENT_COLOR}33` }}
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
                            borderColor: isSelected ? ACCENT_COLOR : MUTED_TEXT,
                            backgroundColor: isSelected ? ACCENT_COLOR : INPUT_BG, // Dark background when unselected
                            color: isSelected ? 'white' : DARK_TEXT, // Light text when unselected
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
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = ACCENT_COLOR_DARK)}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = ACCENT_COLOR)}
                >
                  <FaPlusCircle className="me-2" /> Confirm and Create Co Admin
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateSubAdmin