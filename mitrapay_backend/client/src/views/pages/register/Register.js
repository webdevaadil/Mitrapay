// import React from 'react'
// import {
//   CButton,
//   CCard,
//   CCardBody,
//   CCol,
//   CContainer,
//   CForm,
//   CFormInput,
//   CInputGroup,
//   CInputGroupText,
//   CRow,
// } from '@coreui/react'
// import CIcon from '@coreui/icons-react'
// import { cilLockLocked, cilUser } from '@coreui/icons'

// const Register = () => {
//   return (
//     <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
//       <CContainer>
//         <CRow className="justify-content-center">
//           <CCol md={9} lg={7} xl={6}>
//             <CCard className="mx-4">
//               <CCardBody className="p-4">
//                 <CForm>
//                   <h1>Register</h1>
//                   <p className="text-body-secondary">Create your account</p>
//                   <CInputGroup className="mb-3">
//                     <CInputGroupText>
//                       <CIcon icon={cilUser} />
//                     </CInputGroupText>
//                     <CFormInput placeholder="Username" autoComplete="username" />
//                   </CInputGroup>
//                   <CInputGroup className="mb-3">
//                     <CInputGroupText>@</CInputGroupText>
//                     <CFormInput placeholder="Email" autoComplete="email" />
//                   </CInputGroup>
//                   <CInputGroup className="mb-3">
//                     <CInputGroupText>
//                       <CIcon icon={cilLockLocked} />
//                     </CInputGroupText>
//                     <CFormInput
//                       type="password"
//                       placeholder="Password"
//                       autoComplete="new-password"
//                     />
//                   </CInputGroup>
//                   <CInputGroup className="mb-4">
//                     <CInputGroupText>
//                       <CIcon icon={cilLockLocked} />
//                     </CInputGroupText>
//                     <CFormInput
//                       type="password"
//                       placeholder="Repeat password"
//                       autoComplete="new-password"
//                     />
//                   </CInputGroup>
//                   <div className="d-grid">
//                     <CButton color="success">Create Account</CButton>
//                   </div>
//                 </CForm>
//               </CCardBody>
//             </CCard>
//           </CCol>
//         </CRow>
//       </CContainer>
//     </div>
//   )
// }

// export default Register

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CButton, CCard, CCardBody, CCol, CContainer, CForm, CFormInput, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)

  const placeholderStyle = `
    input::placeholder {
      color: #6c757d !important;
      opacity: 1;
    }
  `

  return (
    <>
      <style>{placeholderStyle}</style>

      <div
        className="min-vh-100 d-flex justify-content-center align-items-center"
        style={{
          background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
          backgroundSize: 'cover',
        }}
      >
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={6} lg={5}>
              <CCard className="text-center p-4 shadow-lg" style={{ borderRadius: '1.5rem' }}>
                <CCardBody>
                  <div className="d-flex justify-content-center">
                    <img
                      src="https://randomuser.me/portraits/men/45.jpg"
                      alt="Profile"
                      className="rounded-circle mb-3"
                      width="80"
                      height="80"
                    />
                  </div>
                  <h4 className="fw-bold mb-4">Register</h4>

                  <CForm>
                    {/* Username */}
                    <div style={{ position: 'relative', marginBottom: '1rem', marginTop: '2rem' }}>
                      <CIcon
                        icon={cilUser}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '15px',
                          transform: 'translateY(-50%)',
                          color: '#6c757d',
                          zIndex: 1,
                          fontWeight: 'bold',
                        }}
                      />
                      <CFormInput
                        placeholder="Username"
                        autoComplete="username"
                        className="rounded-pill ps-5"
                        style={{
                          backgroundColor: '#f1f1f1',
                          border: 'none',
                          color: '#6c757d',
                          fontWeight: 'bold',
                          paddingTop: '0.75rem',
                          paddingBottom: '0.75rem',
                        }}
                      />
                    </div>

                    {/* Email */}
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                      <span
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '15px',
                          transform: 'translateY(-50%)',
                          color: '#6c757d',
                          zIndex: 1,
                          fontWeight: 'bold',
                        }}
                      >
                        @
                      </span>
                      <CFormInput
                        placeholder="Email"
                        autoComplete="email"
                        className="rounded-pill ps-5"
                        style={{
                          backgroundColor: '#f1f1f1',
                          border: 'none',
                          color: '#6c757d',
                          fontWeight: 'bold',
                          paddingTop: '0.75rem',
                          paddingBottom: '0.75rem',
                        }}
                      />
                    </div>

                    {/* Password */}
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                      <CIcon
                        icon={cilLockLocked}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '15px',
                          transform: 'translateY(-50%)',
                          color: '#6c757d',
                          zIndex: 1,
                        }}
                      />
                      <CFormInput
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        autoComplete="new-password"
                        className="rounded-pill ps-5 pe-5"
                        style={{
                          backgroundColor: '#f1f1f1',
                          border: 'none',
                          color: '#6c757d',
                          fontWeight: 'bold',
                          paddingTop: '0.75rem',
                          paddingBottom: '0.75rem',
                        }}
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          right: '15px',
                          transform: 'translateY(-50%)',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          color: '#007bff',
                          zIndex: 1,
                        }}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </span>
                    </div>

                    {/* Repeat Password */}
                    <div style={{ position: 'relative', marginBottom: '2rem' }}>
                      <CIcon
                        icon={cilLockLocked}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '15px',
                          transform: 'translateY(-50%)',
                          color: '#6c757d',
                          zIndex: 1,
                        }}
                      />
                      <CFormInput
                        type="password"
                        placeholder="Repeat Password"
                        autoComplete="new-password"
                        className="rounded-pill ps-5"
                        style={{
                          backgroundColor: '#f1f1f1',
                          border: 'none',
                          color: '#6c757d',
                          fontWeight: 'bold',
                          paddingTop: '0.75rem',
                          paddingBottom: '0.75rem',
                        }}
                      />
                    </div>

                    {/* Button */}
                    <CButton
                      className="w-100 rounded-pill mb-3"
                      style={{
                        backgroundColor: '#343a40', 
                        border: 'none',
                        color: 'white',
                        padding: '10px 0',
                        fontWeight: 'bold',
                        fontSize: '20px',
                        boxShadow: 'none',
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      Create Account
                    </CButton>

                    {/* Link to Login */}
                    <div className="text-center">
                      <p className="text-light small mt-2">
                        Already have an account?{' '}
                        <Link to="/login" className="fw-bold text-decoration-none ">
                          Login here
                        </Link>
                      </p>
                    </div>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CContainer>
      </div>
    </>
  )
}

export default Register
