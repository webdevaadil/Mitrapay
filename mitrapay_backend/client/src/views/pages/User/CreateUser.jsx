import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useSelector } from 'react-redux'
import { FaArrowLeft } from 'react-icons/fa'
import { MdOutlineSecurity, MdPersonOutline, MdCheckCircleOutline } from 'react-icons/md'
// import Select from '../../forms/select/Select' // Assuming this is not strictly needed for the theme change

function CreateUser() {
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.user)

    // --- DARK MODE THEME COLORS ---
    const ACCENT_COLOR = 'rgb(255, 102, 178)' // Updated Pink Accent
    const ACCENT_COLOR_LIGHT = 'rgba(255, 102, 178, 0.3)' // Slightly stronger light for contrast on dark BG
    const DARK_BG_PRIMARY = '#121212' // Main background color for a true dark mode
    const DARK_BG_SECONDARY = '#1f1f1f' // Card/form container background
    const DARK_BG_TERTIARY = '#2c2c2c' // Input/inner section background
    const LIGHT_TEXT = '#e0e0e0' // General light text
    const MUTED_TEXT = '#a0a0a0' // Muted text for labels/hints
    const BORDER_COLOR = '#3a3a3a' // Dark mode border color
    // -----------------------------

    const permissionLabels = [
        'Dashboard',
        "Send Money",
        "View Transaction",
        'Money Transfer',
        'Multiple Payments',
    ].filter((v, i, a) => a.indexOf(v) === i)

    const [formData, setFormData] = useState({
        Name: '',
        User_name: '',
        email: '',
        Phone: '',
        status: 'Active',
        Password: '',
        role: 'User',
        Pages: [],
        Subadmin: user?.role === 'Super_Admin' ? '' : user?._id,
        Key: '',
        CreatedBy: '',
    })

    const [errors, setErrors] = useState({})
    const [subadmins, setSubadmins] = useState([])
    const [Selctedsubadmins, setSelctedSubadmins] = useState({
        Name: "", role: "", email: ""
    })

    useEffect(() => {
        if (user?.role === 'Super_Admin') {
            const fetchSubadmins = async () => {
                try {
                    const res = await axios.get('/api/auth/View_subadmin', {
                        withCredentials: true,
                    })
                    setSubadmins(res.data.subadmins || [])
                } catch (error) {
                    if (error.response && error.response.status === 401) {
                        toast.error('Unauthorized access. Please log in again.')
                        window.location.reload()
                    } else {
                        toast.error('Failed to fetch subadmins')
                    }
                }
            }
            fetchSubadmins()
        } else if (user?._id) {
            setSubadmins([{ _id: user._id, Name: user.Name, role: user.role, email: user.email }])
            setFormData((prev) => ({
                ...prev,
                Subadmin: user._id,
                CreatedBy: { email: user.email, Name: user.Name, role: user.role },
            }))
        }
    }, [user?._id, user?.role])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handlePermissionChange = (label) => {
        const Pages = formData.Pages.includes(label)
            ? formData.Pages.filter((item) => item !== label)
            : [...formData.Pages, label]
        setFormData({ ...formData, Pages })
    }

    const validateForm = () => {
        const newErrors = {}
        console.log("selected subadmin:", Selctedsubadmins)
        if (user?.role === 'Super_Admin' && Selctedsubadmins.Name === "" && formData.Subadmin === "") newErrors.SelctedSubadmins = 'Subadmin must be selected'

        if (!formData.Name.trim()) newErrors.Name = 'Name is required'
        if (!formData.User_name.trim()) newErrors.User_name = 'Username is required'

        if (!formData.email.trim()) newErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format'

        if (!formData.Phone.trim()) newErrors.Phone = 'Phone number is required'
        else if (!/^\d{10}$/.test(formData.Phone)) newErrors.Phone = 'Phone must be 10 digits'

        if (!formData.Password) newErrors.Password = 'Password is required'
        else if (formData.Password.length < 8) newErrors.Password = 'Password must be at least 8 characters'

        if (!formData.Key.trim()) newErrors.Key = 'Key is required'

        setErrors(newErrors)

        if (formData.email) formData.email = formData.email.trim().toLowerCase()

        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) {
            toast.error('Please correct the form errors')
            return
        }
        const payload = { ...formData, Subadmin: user?.role == 'Super_Admin' ? formData.Subadmin : user._id }

        try {
            await axios.post('/api/auth/Create_User', payload, { withCredentials: true })
            console.log('User Creation Payload:', payload)
            toast.success('User created successfully!')
            navigate('/viewUser')
        } catch (err) {
            if (err.response && err.response.status === 401) {
                toast.error('Unauthorized access. Please log in again.')
                window.location.reload()
            } else {
                toast.error(err.response?.data?.message || 'Something went wrong')
            }
        }
    }

    const handlesubadminChange = (e) => {
        const { value } = e.target
        const selectedAdmin = subadmins.find((admin) => admin._id === value)
        setSelctedSubadmins(selectedAdmin ? { Name: selectedAdmin.Name, role: selectedAdmin.role, email: selectedAdmin.email } : { Name: "", role: "", email: "" })
        setFormData((prev) => ({
            ...prev,
            Subadmin: value,
            CreatedBy: selectedAdmin ? { email: selectedAdmin.email, Name: selectedAdmin.Name, role: selectedAdmin.role } : '',
        }))
    }

    return (
        <div className="container py-5" style={{ backgroundColor: DARK_BG_PRIMARY, minHeight: '100vh' }}>
            <div className="row justify-content-center">
                <div className="col-lg-9">
                    {/* HEADER */}
                    <header className="d-flex align-items-center justify-content-between mb-4">
                        <div className="d-flex align-items-center">
                            <Link
                                to="/viewUser"
                                className="btn rounded-circle me-3"
                                style={{ width: '40px', height: '40px', border: `1px solid ${BORDER_COLOR}`, backgroundColor: DARK_BG_SECONDARY }}
                            >
                                <FaArrowLeft className="fs-6" style={{ color: LIGHT_TEXT }} />
                            </Link>
                            <h1 className="h4 fw-bold mb-0" style={{ color: LIGHT_TEXT }}>New User Onboarding</h1>
                        </div>
                        <Link
                            to="/viewUser"
                            className="btn px-4 py-2 fw-semibold rounded"
                            style={{
                                backgroundColor: DARK_BG_SECONDARY,
                                color: ACCENT_COLOR,
                                border: `1px solid ${ACCENT_COLOR}`,
                                borderRadius: '8px',
                            }}
                        >
                            View Users
                        </Link>
                    </header>

                    {/* FORM */}
                    <form
                        className="p-4 p-md-5 rounded shadow-lg"
                        onSubmit={handleSubmit}
                        style={{
                            backgroundColor: DARK_BG_SECONDARY,
                            borderRadius: '12px',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)', // Darker shadow for contrast
                        }}
                    >
                        <div className="row g-4">
                            {/* --- ACCOUNT & CONTACT DETAILS --- */}
                            <div className="col-12 mb-3">
                                <h5 className="fw-bold mb-3 d-flex align-items-center" style={{ color: LIGHT_TEXT }}>
                                    <MdPersonOutline className="me-2 fs-4" style={{ color: ACCENT_COLOR }} />
                                    User & Contact Details
                                </h5>

                                <div className="row g-4 border rounded p-4" style={{ borderColor: BORDER_COLOR, backgroundColor: DARK_BG_TERTIARY }}>
                                    {/* Subadmin */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-medium small mb-1" style={{ color: MUTED_TEXT }}>Assigned Co Admin</label>
                                        <select
                                            name="Subadmin"
                                            className={`form-select ${errors.SelctedSubadmins ? 'is-invalid' : ''}`}
                                            onChange={handlesubadminChange}
                                            disabled={user?.role !== 'Super_Admin'}
                                            style={{
                                                borderRadius: '6px',
                                                padding: '10px 12px',
                                                borderColor: errors.SelctedSubadmins ? '#dc3545' : BORDER_COLOR,
                                                backgroundColor: DARK_BG_SECONDARY,
                                                color: LIGHT_TEXT,
                                                transition: 'border-color 0.2s, box-shadow 0.2s',
                                                WebkitAppearance: 'none', // Ensure select looks good
                                                appearance: 'none',
                                            }}
                                        >
                                            <option value="" style={{ backgroundColor: DARK_BG_SECONDARY }}>{user?.role === 'Super_Admin' ? 'Select Co Admin' : user?.Name}</option>
                                            {subadmins.map((admin) => (
                                                <option key={admin._id} value={admin._id} name={admin.Name} style={{ backgroundColor: DARK_BG_SECONDARY }}>
                                                    {admin.Name} ({admin.email})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.SelctedSubadmins && <div className="invalid-feedback">{errors.SelctedSubadmins}</div>}
                                    </div>

                                    {/* Dynamic Inputs */}
                                    {[
                                        { id: 'Name', label: 'Full Name' },
                                        { id: 'User_name', label: 'Username' },
                                        { id: 'email', label: 'Email Address', type: 'email' },
                                        { id: 'Phone', label: 'Phone Number' },
                                    ].map(({ id, label, type = 'text' }) => (
                                        <div className="col-md-6" key={id}>
                                            <label htmlFor={id} className="form-label fw-medium small mb-1" style={{ color: MUTED_TEXT }}>
                                                {label}
                                            </label>
                                            <input
                                                id={id}
                                                name={id}
                                                type={type}
                                                value={formData[id]}
                                                onChange={handleChange}
                                                className={`form-control ${errors[id] ? 'is-invalid' : ''}`}
                                                style={{
                                                    borderRadius: '6px',
                                                    padding: '10px 12px',
                                                    borderColor: errors[id] ? '#dc3545' : BORDER_COLOR,
                                                    backgroundColor: DARK_BG_SECONDARY,
                                                    color: LIGHT_TEXT,
                                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                                }}
                                            />
                                            {errors[id] && <div className="invalid-feedback">{errors[id]}</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* --- SECURITY & CREDENTIALS --- */}
                            <div className="col-12 mb-3">
                                <h5 className="fw-bold mb-3 d-flex align-items-center" style={{ color: LIGHT_TEXT }}>
                                    <MdOutlineSecurity className="me-2 fs-4" style={{ color: ACCENT_COLOR }} />
                                    Security & Credentials
                                </h5>
                                <div className="row g-4 border rounded p-4" style={{ borderColor: BORDER_COLOR, backgroundColor: DARK_BG_TERTIARY }}>
                                    {[
                                        { id: 'Password', label: 'Password', type: 'password' },
                                        { id: 'Key', label: 'API Key / Secret Key', type: 'password' },
                                    ].map(({ id, label, type }) => (
                                        <div className="col-md-6" key={id}>
                                            <label htmlFor={id} className="form-label fw-medium small mb-1" style={{ color: MUTED_TEXT }}>
                                                {label}
                                            </label>
                                            <input
                                                id={id}
                                                name={id}
                                                type={type}
                                                value={formData[id]}
                                                onChange={handleChange}
                                                className={`form-control ${errors[id] ? 'is-invalid' : ''}`}
                                                style={{
                                                    borderRadius: '6px',
                                                    padding: '10px 12px',
                                                    borderColor: errors[id] ? '#dc3545' : BORDER_COLOR,
                                                    backgroundColor: DARK_BG_SECONDARY,
                                                    color: LIGHT_TEXT,
                                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                                }}
                                            />
                                            {errors[id] && <div className="invalid-feedback">{errors[id]}</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* --- PERMISSIONS --- */}
                            <div className="col-12 pt-3">
                                <h5 className="fw-bold mb-3 d-flex align-items-center" style={{ color: LIGHT_TEXT }}>
                                    <MdCheckCircleOutline className="me-2 fs-4" style={{ color: ACCENT_COLOR }} />
                                    Page Access Permissions
                                </h5>
                                <div className="row g-3 border rounded p-4" style={{ borderColor: BORDER_COLOR, backgroundColor: DARK_BG_TERTIARY }}>
                                    {permissionLabels.map((label) => {
                                        const isSelected = formData.Pages.includes(label)
                                        return (
                                            <div className="col-lg-4 col-md-6 col-sm-6" key={label}>
                                                <div
                                                    className="d-flex justify-content-between align-items-center px-3 py-2 rounded-lg user-select-none"
                                                    style={{
                                                        border: `1px solid ${isSelected ? ACCENT_COLOR : BORDER_COLOR}`,
                                                        backgroundColor: isSelected ? ACCENT_COLOR_LIGHT : DARK_BG_SECONDARY,
                                                        transition: 'all 0.2s ease',
                                                        cursor: 'pointer',
                                                        borderRadius: '8px',
                                                        boxShadow: isSelected ? `0 1px 5px ${ACCENT_COLOR_LIGHT}` : 'none',
                                                    }}
                                                    onClick={() => handlePermissionChange(label)}
                                                >
                                                    <span className="fw-medium small" style={{ color: isSelected ? ACCENT_COLOR : LIGHT_TEXT }}>
                                                        {label}
                                                    </span>
                                                    <div className="form-check form-switch m-0">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handlePermissionChange(label)}
                                                            style={{
                                                                backgroundColor: isSelected ? ACCENT_COLOR : MUTED_TEXT,
                                                                borderColor: isSelected ? ACCENT_COLOR : MUTED_TEXT,
                                                                boxShadow: 'none',
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* --- SUBMIT BUTTON --- */}
                            <div className="col-12 text-center mt-5">
                                <button
                                    type="submit"
                                    className="btn btn-lg px-5 py-3 fw-bold rounded-pill shadow"
                                    style={{
                                        backgroundColor: ACCENT_COLOR,
                                        color: 'white',
                                        boxShadow: `0 8px 20px ${ACCENT_COLOR}99`,
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    Confirm and Create User
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateUser