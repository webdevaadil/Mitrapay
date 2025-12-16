import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CRow,
  // CoreUI Modal Imports
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';
import { clearErrors, login, verifyOtp } from '../../../actions/userAction';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import TIGER_PAY_LOGO from '../../../assets/images/tigerpay.png'

// Placeholder for the uploaded logo image. 
import imgforlogog from "../../../assets/images/licensed-image.jpg"

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  // 🆕 NEW STATE FOR OTP VERIFICATION
  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  // ----------------------------------

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { error, isAuthenticated,loading } = useSelector((state) => state.user);

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!Password.trim()) {
      newErrors.Password = 'Password is required';
    } else if (Password.length < 6) {
      newErrors.Password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleLogin = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    // Dispatching login. Backend should send the OTP and return a specific message.
    dispatch(login(email, Password));

  };

  // 🆕 NEW FUNCTION: Handle OTP submission and verification
  const handleOtpVerification = (e) => {

    e.preventDefault();
    setOtpError('');

    // Simple client-side validation
    if (otp.length !== 6 || isNaN(Number(otp))) {
      setOtpError('OTP must be a 6-digit number.');
      return;
    }
    dispatch(verifyOtp(email, otp));

  };
  // -----------------------------------------------------

useEffect(() => {
  if (error) {
    if (error === 'Session expired') {
      toast.error(error);
    } else if (error === 'Invalid password' || error === 'Invalid email') {
      toast.error("Invalid Email or Password");
    } else if (error.includes('OTP sent to your registered')) {
      // Show OTP modal
      toast.success(error);
      setIsOtpModalVisible(true);
    } else {
      setErrors((prev) => ({ ...prev, backend: error }));
    }
    dispatch(clearErrors());
  }

  if (isAuthenticated) {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
    return () => clearTimeout(timer);
  }
}, [error, isAuthenticated, navigate, dispatch]);
  const placeholderStyle = `
    input::placeholder {
      color: rgba(255, 255, 255, 0.7) !important;
      opacity: 1;
    }
  `;
  console.log(loading);

  return (
    <>
      <style>{placeholderStyle}</style>
      <div
        className="min-vh-100 d-flex justify-content-center align-items-center"
        style={{
          background: 'linear-gradient(135deg, #0f0a1f, #1a1a2e, #0f0a1f)',
          backgroundSize: '400% 400%',
          animation: 'gradientAnimation 15s ease infinite',
          minHeight: '100vh',
        }}
      >
        <style>
          {`
            @keyframes gradientAnimation {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}
        </style>

        <CContainer>
          <CRow className="justify-content-center align-items-stretch" style={{ minHeight: '80vh' }}>

            {/* Image Column (Left Side) */}
            <CCol md={6} className="d-none d-md-flex align-items-center justify-content-center"
              style={{
                borderRadius: '1.5rem 0 0 1.5rem',
                overflow: 'hidden',
                backgroundColor: '#1a1a2e',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRight: 'none',
              }}
            >
              <img
                src={imgforlogog}
                alt="Abstract background art"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '1.5rem 0 0 1.5rem',
                }}
              />
            </CCol>

            {/* Login Form Column (Right Side) */}
            <CCol md={6}>
              <CCard
                className="text-center p-4 shadow-lg h-100 d-flex flex-column justify-content-center"
                style={{
                  borderRadius: '0 1.5rem 1.5rem 0',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderLeft: 'none',
                  color: 'white',
                }}
              >
                <CCardBody>
                  <div className="d-flex justify-content-center mb-4">
                    {/* <img
                      src={TIGER_PAY_LOGO}
                      alt="Tiger Pay Logo"
                      style={{
                        width: '150px',
                        height: 'auto',
                        objectFit: 'contain',
                      }} 
                    /> */}
                      <h1
                        style={{
                          fontSize: "28px",
                          fontWeight: "800",
                          background: "linear-gradient(90deg, #ff7b00, #ff007f)",
                          WebkitBackgroundClip: "text",
                          color: "transparent",
                          letterSpacing: "1px",
                          transition: "0.3s ease",
                        }}
                        className="hover:scale-105 hover:tracking-wider"
                      >
                        Mitra Pay
                      </h1>
                  </div>
                  <h4 className="fw-bold mb-4" style={{ color: 'linear-gradient(90deg, #ff7b00, #ff007f)#ff9800' }}>Login to Mitra Pay</h4>
                  <CForm onSubmit={handleLogin}>

                    {/* Email Input */}
                    <div style={{ position: 'relative', marginBottom: '1rem', marginTop: '3rem' }}>
                      <CIcon
                        icon={cilUser}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '15px',
                          transform: 'translateY(-50%)',
                          color: 'rgba(255, 255, 255, 0.7)',
                          zIndex: 1,
                        }}
                      />
                      <CFormInput
                        placeholder="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-pill ps-5"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          fontWeight: 'normal',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: 'white',
                          paddingTop: '0.75rem',
                          paddingBottom: '0.75rem',
                        }}
                        required
                      />
                      {errors.email && (
                        <div className="text-warning small text-start ps-2">{errors.email}</div>
                      )}
                    </div>

                    {/* Password Input */}
                    <div style={{ marginBottom: '2rem' }}>
                      <div style={{ position: 'relative' }}>
                        <CIcon
                          icon={cilLockLocked}
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '15px',
                            transform: 'translateY(-50%)',
                            color: 'rgba(255, 255, 255, 0.7)',
                            zIndex: 1,
                          }}
                        />
                        <CFormInput
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Password"
                          value={Password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="rounded-pill ps-5 pe-5"
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            fontWeight: 'normal',
                            paddingTop: '0.75rem',
                            paddingBottom: '0.75rem',
                          }}
                          required
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
                            color: '#ff9800',
                            zIndex: 1,
                          }}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </span>
                      </div>
                      {errors.Password && (
                        <div className="text-warning small text-start ps-2 mt-2">
                          {errors.Password}
                        </div>
                      )}
                    </div>

                    {/* Backend Error */}
                    {errors.backend && (
                      <div className="text-danger small text-center mb-3">
                        {errors.backend}
                      </div>
                    )}

                    {/* Login Button */}
                    <CButton
                      type="submit"
                      className="w-100 rounded-pill mb-3"
                      style={{
                        background: 'linear-gradient(90deg, #ff9800, #ff5722)',
                        border: 'none',
                        color: 'white',
                        padding: '10px 0',
                        fontWeight: 'bold',
                        fontSize: '20px',
                        boxShadow: '0 4px 15px rgba(255, 152, 0, 0.4)',
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {loading ? <CSpinner size="sm" color="white" /> : "Login"}
                    </CButton>

                    {/* Forgot Link */}
                    <div className="text-center">
                      <p className="small mb-0">
                        <Link to="/forgot-Password" className="text-decoration-none" style={{ color: '#ff9800' }}>
                          Forgot Username / Password?
                        </Link>
                      </p>
                    </div>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CContainer>

        {/* 🚀 OTP Verification Modal 🚀 */}
        <CModal
          visible={isOtpModalVisible}
          onClose={() => setIsOtpModalVisible(false)}
          aria-labelledby="OTPModalLabel"
          className="otp-modal"
          alignment="center"
        >
          <CModalHeader onClose={() => setIsOtpModalVisible(false)}>
            <CModalTitle id="OTPModalLabel">Verify One-Time Password</CModalTitle>
          </CModalHeader>
          <CForm onSubmit={handleOtpVerification}>
            <CModalBody>
              <p className="text-center mb-4">
                An OTP has been sent to your registered mobile number.
                <br />
                Please enter the 6-digit code below.
              </p>

              <CFormInput
                type="text"
                maxLength="6"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="text-center fs-3"
                style={{ letterSpacing: '0.5rem' }}
                required
              />

              {otpError && (
                <div className="text-danger small text-center mt-2">{otpError}</div>
              )}
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setIsOtpModalVisible(false)}>
                Cancel
              </CButton>
              <CButton
                type="submit"
                style={{
                  backgroundColor: '#ff9800',
                  borderColor: '#ff9800',
                  color: 'white'
                }}
              >
                {loading ? <CSpinner size="sm" color="white" /> : " Verify & Login"}
              </CButton>
            </CModalFooter>
          </CForm>
        </CModal>
        {/* ------------------------------------- */}

      </div>
    </>
  );
};

export default Login;