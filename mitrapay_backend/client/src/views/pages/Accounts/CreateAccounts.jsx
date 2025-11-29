import axios from 'axios'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function CreateAccounts() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    beneficiaryCode: '',
    beneficiaryName: '',
    beneficiaryAddress: '',
    ifsc: '',
    bankName: '',
    paymentMethod: '',
    effectiveFrom: '',
    beneficiaryaccountNumber: '',
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (formData.beneficiaryCode.trim()!==formData.beneficiaryName.trim()) newErrors.beneficiaryCode = 'Beneficiary Name and Code should be same.'
    if (!formData.beneficiaryCode.trim()) newErrors.beneficiaryCode = 'beneficiary Code is required'
    if (!formData.beneficiaryName.trim()) newErrors.beneficiaryName = 'beneficiary Name is required'
    // if (!formData.beneficiaryAddress.trim()) newErrors.beneficiaryAddress = 'beneficiary Address is required'
    if (!formData.beneficiaryaccountNumber.trim()) newErrors.beneficiaryaccountNumber = 'beneficiary Account is required'
    if (!formData.ifsc.trim()) newErrors.ifsc = 'beneficiary Ifsc is required'
    if (!formData.bankName.trim()) newErrors.bankName = 'beneficiary bankName is required'
    if (!formData.paymentMethod.trim()) newErrors.paymentMethod = 'beneficiary paymentMethod is required'
    // if (!formData.effectiveFrom.trim()) newErrors.effectiveFrom = 'beneficiary effectiveFrom is required'


    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      try {
        const response = await axios.post(
          '/api/auth/Create_account', // 🔁 Replace with your actual API endpoint
          formData,
        )

        if (response.status === 200 || response.status === 201) {
          toast.success('Account created successfully!')
          // Optionally reset form or redirect
          setFormData({
            beneficiaryCode: '',
            beneficiaryName: '',
            beneficiaryAddress: '',
            ifsc: '',
            bankName: '',
            paymentMethod: '',
            effectiveFrom: '',
            beneficiaryaccountNumber: '',
          });
        } else {
          toast.error('Failed to create account. Please try again.')
        }
      } catch (error) {
        console.error('API error:', error)
        if (error.response && error.response.status === 401) {
          toast.error('Unauthorized access. Please log in again.')

          window.location.reload();

        }
        toast.error(error.response?.data?.message || 'Something went wrong with the API.')
      }
    } else {
      toast.error('Please fix the errors in the form.')
    }
  }
  console.log(errors)

  return (
    <div className="container py-4">
      <div className="rounded shadow-sm mb-3">
        <header className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
          <Link
            to="/BeneficiaryAccount"
            className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '40px', height: '40px', border: '1px solid #dee2e6' }}
          >
            <i className="fas fa-arrow-left fs-5 text-dark"></i>
          </Link>
          <h1 className="h5 fw-bold flex-grow-1 ms-2 mb-0 text-dark">Add Beneficiary</h1>
          <button onClick={handleSubmit} className="btn btn-primary px-4 py-2 shadow-sm">
            Save
          </button>
        </header>
      </div>

      <form className="px-5 py-4 rounded border shadow-sm">
        <div className="row g-4">
          {/* Basic Fields */}
          {[
            { id: 'beneficiaryCode', label: 'Beneficiary Code' },
            { id: 'beneficiaryName', label: 'Beneficiary Name', type: 'email' },
            { id: 'beneficiaryAddress', label: 'Beneficiary Address' },
            { id: 'beneficiaryaccountNumber', label: 'Beneficiary Account Number' },
            { id: 'ifsc', label: 'IFSC' },
            { id: 'bankName', label: 'Bank Name' },
            { id: 'paymentMethod', label: 'Payment Method' },
            { id: 'effectiveFrom', label: 'Effective From' },
          ].map(({ id, label, type = 'text' }) => (
            <div className="col-md-6" key={id}>
              <label className="form-label">{label}</label>
              <input
                type={type}
                name={id}
                className={`form-control ${errors[id] ? 'is-invalid' : ''}`}
                value={formData[id]}
                onChange={handleChange}
              />
              {errors[id] && <div className="invalid-feedback">{errors[id]}</div>}
            </div>
          ))}


        </div>
      </form>
    </div>
  )
}

export default CreateAccounts
