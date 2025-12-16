import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { FaPlus, FaArrowLeft } from 'react-icons/fa'
import Select from 'react-select'
import { loaduser } from '../../../actions/userAction'
import {
  CSpinner,
  CModal,
  CModalBody,
  CModalHeader,
  CButton
} from '@coreui/react'

// 🎨 DARK MODE COLOR PALETTE
const PRIMARY_COLOR = "rgb(255, 102, 178)"; // Pink for primary actions (updated)
const DARK_BG = "#1e1e1e"; // Main background
const CARD_BG = "#2c2c2c"; // Card/Container background
const LIGHT_BG = "#383838"; // Lighter dark for subtle contrast/hover
const TEXT_COLOR_LIGHT = "#ffffff"; // Light text for readability
const TEXT_COLOR_MUTED = "#b3b3b3"; // Muted text
const INPUT_BORDER_COLOR = "#555555"; // Input border in dark mode
const LIGHT_ORANGE_DARK_MODE = "rgba(255, 102, 178, 0.2)"; // Light pink tint for dark mode

// Initial state (kept for functionality)
const initialBeneficiaryState = {
  beneficiaryCode: '',
  beneficiaryName: '',
  beneficiaryAddress: '',
  beneficiaryaccountNumber: '',
  ifsc: '',
  bankName: '',
  paymentMethod: '',
}

function CreatePayout() {
  const { user } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [pinModal, setPinModal] = useState(false)
  const [pin, setPin] = useState('')

  const [formData, setFormData] = useState({
    ...initialBeneficiaryState,
    Amount: '',
    remark: '',
    key: '',
  })

  const [errors, setErrors] = useState({})
  const [account, setAccount] = useState([])
  const [useExisting, setUseExisting] = useState(true)

  // ------------------- Fetch Beneficiaries -------------------
  const fetchPayouts = async () => {
    try {
      const endpoint = `/api/auth/View_account?status=approved&all=true`
      const res = await axios.get(endpoint, { withCredentials: true })
      setAccount((res.data.BeneficiaryAccounts || []).map((payout) => ({ ...payout })))
    } catch (err) {
      console.log(err, "error in beneficiary account")
      toast.error('Failed to fetch beneficiary accounts')
    }
  }

  useEffect(() => {
    fetchPayouts()
  }, [])

  // ------------------- Input Change -------------------
  const handleChange = (e) => {
    const { id, value } = e.target
    if (id === 'key') {
      setFormData({ ...formData, key: value })
      setPin(value);
    } else {
      setFormData({ ...formData, [id]: value })
    }
    setErrors((prev) => ({ ...prev, [id]: '' }))
  }

  // ------------------- Validation -------------------
  const validateForm = () => {
    const newErrors = {}

    if (!formData.Amount.trim()) {
      newErrors.Amount = "Amount is required"
    } else if (isNaN(formData.Amount) || Number(formData.Amount) <= 0) {
      newErrors.Amount = "Amount must be a positive number"
    }
    if (!formData.remark.trim()) {
      newErrors.remark = "Remark is required"
    }

    if (useExisting && !formData.beneficiaryaccountNumber) {
      newErrors.beneficiarySelection = "Please select a beneficiary account to proceed."
    }

    if (!useExisting) {
      if (!formData.beneficiaryName.trim()) newErrors.beneficiaryName = "Beneficiary Name is required"
      if (!formData.beneficiaryaccountNumber.trim()) newErrors.beneficiaryaccountNumber = "Account Number is required"
      if (!formData.ifsc.trim()) newErrors.ifsc = "IFSC Code is required"
      if (!formData.bankName.trim()) newErrors.bankName = "Bank Name is required"
      if (!formData.paymentMethod.trim()) newErrors.paymentMethod = "Payment Method is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ------------------- Form Submit -------------------
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    if (user.role !== 'Super_Admin' && user.credit < Number(formData.Amount)) {
      toast.error("Insufficient credit to Send Money")
      return
    }

    setFormData(prev => ({ ...prev, key: '' }));
    setPinModal(true)
  }

  // ------------------- Final Submit with PIN -------------------
  const confirmPayout = async () => {
    if (!formData.key.trim()) {
      toast.error('T PIN is required.')
      return
    }

    try {
      setLoading(true)
      const payload = { ...formData, pin: formData.key }
      await axios.post('/api/auth/Create_payout', payload, { withCredentials: true })

      toast.success('Payout created successfully')
      setPinModal(false)
      navigate("/ViewTransactions")
      dispatch(loaduser())
    } catch (err) {
      console.log(err)
      toast.error(err.response?.data.message || 'Failed to Send Money')
    } finally {
      setLoading(false)
    }
  }

  // ------------------- Options for existing beneficiaries -------------------
  const options = account.map((user) => {
    return {
      value: user._id,
      label: `${user['Beneficiary Name'] || user.accountHolderName} (${user['Beneficiary Account No'] || user.accountNumber})`,
      'BIC / SWIFT / IFSC Code': user['BIC / SWIFT / IFSC Code'],
      'Beneficiary Account No': user['Beneficiary Account No'],
      'Beneficiary Address 1': user['Beneficiary Address 1'],
      'Beneficiary Bank Name': user['Beneficiary Bank Name'],
      'Beneficiary Code': user['Beneficiary Code'],
      'Beneficiary Name': user['Beneficiary Name'],
      'Payment Method Name': user['Payment Method Name'],
    }
  })

  // ------------------- Handle Beneficiary Selection -------------------
  const handleSelectChange = (selectedOption) => {
    if (!selectedOption) {
      setFormData(prev => ({
        ...prev,
        ...initialBeneficiaryState,
      }))
      return;
    }
    setFormData(prev => ({
      ...prev,
      'ifsc': selectedOption['BIC / SWIFT / IFSC Code'] || '',
      'beneficiaryaccountNumber': selectedOption['Beneficiary Account No'] || '',
      'beneficiaryAddress': selectedOption['Beneficiary Address 1'] || '',
      'bankName': selectedOption['Beneficiary Bank Name'] || '',
      'beneficiaryCode': selectedOption['Beneficiary Code'] || '',
      'beneficiaryName': selectedOption['Beneficiary Name'] || '',
      'paymentMethod': selectedOption['Payment Method Name'] || '',
    }))
  }

  // ------------------- Toggle Existing/New Beneficiary Mode -------------------
  const handleUseExistingToggle = (isExisting) => {
    setUseExisting(isExisting);
    setFormData(prev => ({
      ...prev,
      ...initialBeneficiaryState,
    }));
    setErrors({});
  };

  // ------------------- UI (Dark Mode Redesign) -------------------
  return (
    <div className="container py-5" style={{ minHeight: '100vh', backgroundColor: DARK_BG, color: TEXT_COLOR_LIGHT }}>
      <div className="row justify-content-center">
        <div className="col-md-9 col-lg-7">

          {/* Header Card - Dark */}
          <div className="rounded-xl shadow-sm mb-5 p-4 border-bottom" style={{ backgroundColor: CARD_BG, borderColor: PRIMARY_COLOR }}>
            <header className="d-flex align-items-center justify-content-between">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-circle"
                style={{ width: '40px', height: '40px', border: `1px solid ${INPUT_BORDER_COLOR}`, color: TEXT_COLOR_LIGHT }}
                onClick={() => navigate(-1)}
                title="Go Back"
              >
                <FaArrowLeft className="fs-6" style={{ color: TEXT_COLOR_LIGHT }} />
              </button>
              <h1 className="h4 fw-bolder flex-grow-1 ms-4 mb-0" style={{ color: TEXT_COLOR_LIGHT }}>New Transaction Request</h1>
            </header>
          </div>

          {/* Payout Form Container - Main Card Dark */}
          <div className="p-4 p-md-5 rounded-lg border shadow-lg" style={{ backgroundColor: CARD_BG, borderColor: INPUT_BORDER_COLOR }}>

            {/* Toggle Select OR New - Pill/Tab Design Dark */}
            <div className="d-flex justify-content-center mb-4 p-1 rounded-pill" style={{ backgroundColor: LIGHT_BG }}>
              <button
                type="button"
                className={`btn flex-grow-1 rounded-pill fw-semibold py-2 ${useExisting ? 'text-white shadow-sm' : 'text-light'}`}
                style={useExisting ? { backgroundColor: PRIMARY_COLOR, transition: 'all 0.3s', border: 'none' } : { backgroundColor: 'transparent', transition: 'all 0.3s' }}
                onClick={() => handleUseExistingToggle(true)}
              >
                Use Existing Account
              </button>
              <button
                type="button"
                className={`btn flex-grow-1 rounded-pill fw-semibold py-2 ${!useExisting ? 'text-white shadow-sm' : 'text-light'}`}
                style={!useExisting ? { backgroundColor: PRIMARY_COLOR, transition: 'all 0.3s', border: 'none' } : { backgroundColor: 'transparent', transition: 'all 0.3s' }}
                onClick={() => handleUseExistingToggle(false)}
              >
                Manual Entry
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {loading ? (
                <div className="text-center py-5">
                  <CSpinner color="primary" style={{ width: "3rem", height: "3rem", color: PRIMARY_COLOR }} />
                </div>
              ) : (
                <div className="row g-4">

                  {/* Beneficiary Fields Section */}
                  <div className="col-12 border-bottom pb-4 mb-4" style={{ borderColor: INPUT_BORDER_COLOR }}>
                    <h5 className='fw-bold mb-3' style={{ color: PRIMARY_COLOR }}>Account Details</h5>
                    {useExisting ? (
                      <>
                        <label className="form-label fw-semibold small mb-2" style={{ color: TEXT_COLOR_LIGHT }}>Select Approved Beneficiary <span className='text-danger'>*</span></label>
                        <Select
                          options={options}
                          placeholder="Search & Select Beneficiary Account..."
                          isSearchable
                          isClearable
                          onChange={handleSelectChange}
                          classNamePrefix="react-select-dark" // Custom prefix for dark mode styling
                          styles={{
                            // Custom styles for dark mode in react-select
                            control: (base, state) => ({
                              ...base,
                              minHeight: '45px',
                              backgroundColor: LIGHT_BG,
                              color: TEXT_COLOR_LIGHT,
                              borderColor: errors.beneficiarySelection ? 'red' : state.isFocused ? PRIMARY_COLOR : INPUT_BORDER_COLOR,
                              boxShadow: state.isFocused ? `0 0 0 0.2rem ${LIGHT_ORANGE_DARK_MODE}` : 'none',
                              '&:hover': { borderColor: PRIMARY_COLOR },
                            }),
                            singleValue: (base) => ({ ...base, color: TEXT_COLOR_LIGHT }),
                            input: (base) => ({ ...base, color: TEXT_COLOR_LIGHT }),
                            placeholder: (base) => ({ ...base, color: TEXT_COLOR_MUTED }),
                            menu: (base) => ({ ...base, backgroundColor: LIGHT_BG }),
                            option: (base, state) => ({
                              ...base,
                              backgroundColor: state.isFocused ? LIGHT_BG : CARD_BG,
                              color: TEXT_COLOR_LIGHT,
                              '&:active': { backgroundColor: PRIMARY_COLOR },
                            }),
                          }}
                        />
                        {errors.beneficiarySelection && (
                          <small className="text-danger mt-1 d-block">{errors.beneficiarySelection}</small>
                        )}
                        {/* {formData.beneficiaryName && (
                          <div className="p-3 mt-3 border rounded small" style={{ backgroundColor: LIGHT_ORANGE_DARK_MODE, color: TEXT_COLOR_LIGHT, borderColor: PRIMARY_COLOR }}>
                            <span className='fw-bold'>Selected:</span> {formData.beneficiaryName} ({formData.beneficiaryaccountNumber})
                          </div>
                        )} */}
                      </>
                    ) : (
                      <div className="row g-3">
                        {/* New beneficiary input fields */}
                        {[
                          { id: 'beneficiaryName', label: 'Beneficiary Name', type: 'text', required: true, col: 12 },
                          { id: 'beneficiaryaccountNumber', label: 'Account Number', type: 'text', required: true, col: 12 },
                          { id: 'ifsc', label: 'IFSC Code', type: 'text', required: true, col: 6 },
                          { id: 'bankName', label: 'Bank Name', type: 'text', required: true, col: 6 },
                          { id: 'paymentMethod', label: 'Payment Method', type: 'text', required: true, col: 6 },
                          { id: 'beneficiaryCode', label: 'Beneficiary Code', type: 'text', required: false, col: 6 },
                          { id: 'beneficiaryAddress', label: 'Beneficiary Address', type: 'text', required: false, col: 12 },
                        ].map((field) => (
                          <div key={field.id} className={`col-md-${field.col}`}>
                            <label htmlFor={field.id} className="form-label fw-semibold small mb-1" style={{ color: TEXT_COLOR_LIGHT }}>
                              {field.label} {field.required && <span className='text-danger'>*</span>}
                            </label>
                            <input
                              type={field.type}
                              id={field.id}
                              value={formData[field.id] || ""}
                              onChange={handleChange}
                              className={`form-control p-2 border rounded-md shadow-sm ${errors[field.id] ? 'is-invalid' : ''}`}
                              placeholder={`Enter ${field.label}`}
                              style={{
                                backgroundColor: LIGHT_BG,
                                color: TEXT_COLOR_LIGHT,
                                borderColor: errors[field.id] ? 'red' : INPUT_BORDER_COLOR
                              }}
                            />
                            {errors[field.id] && (
                              <small className="text-danger">{errors[field.id]}</small>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Transaction Fields Section */}
                  <div className="col-12">
                    <h5 className='fw-bold mb-3' style={{ color: PRIMARY_COLOR }}>Transfer Details</h5>
                    <div className="row g-3">
                      {[
                        { id: 'Amount', label: 'Amount', type: 'number', required: true },
                        { id: 'remark', label: 'Remark', type: 'text', required: true },
                      ].map((field) => (
                        <div key={field.id} className="col-12">
                          <label htmlFor={field.id} className="form-label fw-semibold small mb-1" style={{ color: TEXT_COLOR_LIGHT }}>
                            {field.label} <span className='text-danger'>*</span>
                          </label>
                          <input
                            type={field.type}
                            id={field.id}
                            value={formData[field.id] || ""}
                            onChange={handleChange}
                            className={`form-control p-2 border rounded-md shadow-sm ${errors[field.id] ? 'is-invalid' : ''}`}
                            placeholder={`Enter ${field.label}`}
                            style={{
                              backgroundColor: LIGHT_BG,
                              color: TEXT_COLOR_LIGHT,
                              borderColor: errors[field.id] ? 'red' : INPUT_BORDER_COLOR
                            }}
                          />
                          {errors[field.id] && (
                            <small className="text-danger">{errors[field.id]}</small>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-12 text-center mt-5">
                    <button type="submit" className="btn btn-lg w-100 text-white fw-bold shadow-lg py-3" style={{ backgroundColor: PRIMARY_COLOR, border: "none", transition: 'background-color 0.3s', borderRadius: '8px' }}>
                      Proceed to Transaction
                    </button>
                    {user.role !== 'Super_Admin' && (
                      <p className="mt-3 small" style={{ color: TEXT_COLOR_MUTED }}>
                        Available Credit: <span className="fw-bold" style={{ color: PRIMARY_COLOR }}>₹{user.credit}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* 🔑 PIN Modal (Dark Mode Styled) */}
      <CModal visible={pinModal} onClose={() => setPinModal(false)} centered contentClassName="dark-modal" backdropClassName="dark-modal-backdrop">
        {/* Injecting inline styles for CModal components as they are not standard bootstrap classes */}
        <div style={{ backgroundColor: CARD_BG, color: TEXT_COLOR_LIGHT }}>
          <CModalHeader style={{ borderBottom: `1px solid ${INPUT_BORDER_COLOR}` }}>
            <h5 className="modal-title fw-bold" style={{ color: TEXT_COLOR_LIGHT }}>Confirm Transaction</h5>
          </CModalHeader>
          <CModalBody className="p-4">
            <p className="small" style={{ color: TEXT_COLOR_MUTED }}>
              Confirm payout of **₹{formData.Amount}** to **{formData.beneficiaryName || 'the selected account'}** by entering your Transaction PIN.
            </p>
            <input
              type="password"
              className="form-control form-control-lg mb-4"
              placeholder="Enter T PIN"
              value={formData['key']}
              onChange={handleChange}
              id="key"
              maxLength="6"
              style={{
                textAlign: 'center',
                letterSpacing: '0.3em',
                backgroundColor: LIGHT_BG,
                color: TEXT_COLOR_LIGHT,
                border: `1px solid ${PRIMARY_COLOR}`
              }}
            />
            <div className="d-flex justify-content-end">
              <CButton
                className="me-2"
                onClick={() => setPinModal(false)}
                style={{ backgroundColor: INPUT_BORDER_COLOR, color: TEXT_COLOR_LIGHT, border: "none" }}
              >
                Cancel
              </CButton>
              <CButton
                className="text-white fw-bold"
                onClick={confirmPayout}
                disabled={loading || !formData.key.trim()}
                style={{ backgroundColor: PRIMARY_COLOR, border: "none" }}
              >
                {loading ? <CSpinner size="sm" color="white" /> : "Confirm Payout"}
              </CButton>
            </div>
          </CModalBody>
        </div>
      </CModal>
    </div>
  )
}

export default CreatePayout