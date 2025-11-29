import axios from 'axios'
import {
  CLEAR_ERRORS,
  DETAIL_USER_FAIL,
  DETAIL_USER_REQUEST,
  DETAIL_USER_SUCCESS,
  LOGIN_FAIL,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
} from '../constants/userConstants'
import { toast } from 'react-toastify';
// export const loaduser = () => async (dispatch) => {
//   try {
//     dispatch({ type: DETAIL_USER_REQUEST })
//     const { data } = await axios.get(`/api/auth/me`, { withCredentials: true })

//     dispatch({ type: DETAIL_USER_SUCCESS, payload: data.user })

//     console.log(data.user)
//   } catch (error) {
//     console.log(error);

//     dispatch({
//       type: DETAIL_USER_FAIL,
//       payload: error.response?.data?.message || 'Session expired',
//     })
//   }
// }
export const loaduser = () => async (dispatch) => {
  try {
    dispatch({ type: DETAIL_USER_REQUEST });

    const { data } = await axios.get(`/api/auth/me`, { withCredentials: true })

    dispatch({ type: DETAIL_USER_SUCCESS, payload: data.user, server: data.server });
  } catch (error) {
    // if session expired, try refresh
    if (error.response?.status === 401) {
      try {

        // retry load user
        const { data } = await axios.get(`/api/auth/me`, { withCredentials: true })
        dispatch({ type: DETAIL_USER_SUCCESS, payload: data.user, server: data.server });
        return;
      } catch (refreshError) {
        dispatch({
          type: DETAIL_USER_FAIL,
          payload: refreshError.response?.data?.message || "Session expired",
        });
      }
    } else {
      dispatch({
        type: DETAIL_USER_FAIL,
        payload: error.response?.data?.message || "Session expired",
      });
    }
  }
};

export const login = (email, Password) => async (dispatch, getState) => {
  try {
    dispatch({ type: LOGIN_REQUEST, loading: true, isAuthenticated: false });

    // 1. Make the initial API call to log in (which now generates and sends the OTP)
    const { data } = await axios.post(
      `/api/auth/login`,
      { email, Password },
      { withCredentials: true },
    );
    // 2. 🚨 CRITICAL CHANGE: Check the message from the backend. 
    // The backend in the previous step was designed to return a message like 
    // "OTP sent to your registered mobile number."
    dispatch({
      type: LOGIN_FAIL, // Use FAIL to stop navigation, but use the success message
      payload: data.message,
      loading: false,
    });
    // If the backend returns a *message* indicating OTP was sent, it's NOT a full success.
    if (data.message && data.message.includes("OTP sent to your registered")) {

      // Dispatch a LOGIN_FAIL, but pass the SUCCESS MESSAGE as the payload. 
      // This is a common pattern to pass an intermediate success message 
      // through the error Redux state to trigger UI changes (the modal).
      dispatch({
        type: LOGIN_FAIL, // Use FAIL to stop navigation, but use the success message
        payload: data.message,
        loading: false,
      });

    } else {
      // 3. If no OTP message is found, assume full login success (e.g., if 2FA is off)
      dispatch({ type: LOGIN_SUCCESS, payload: data.user, loading: false  });
    }

  } catch (error) {
    console.log(error);
    if (error.response && error.response.status === 401) {
      toast.error('Unauthorized access. Please log in again.');
      window.location.reload();
    }

    // Dispatch a standard LOGIN_FAIL for true errors (Invalid credentials, etc.)
    dispatch({
      type: LOGIN_FAIL,
      payload: error.response?.data?.message || 'Login failed'
    });

    console.log(error);
  }
}
export const verifyOtp = (email, otp) => async (dispatch) => {
  try {
    // 1. Dispatch request (can reuse LOGIN_REQUEST or create a specific VERIFY_OTP_REQUEST)
    dispatch({ type: LOGIN_REQUEST, loading: true });

    // 2. Make the API call to your new verification endpoint
    const { data } = await axios.post(
      `/api/auth/verifyotp`, // 🎯 Your new backend endpoint
      { email, otp },
      { withCredentials: true },
    );
    console.log(data);
    // 3. Dispatch success: The backend sends the full user object and token upon successful verification.
    dispatch({ type: LOGIN_SUCCESS, payload: data.user, loading: false });

    // Optional: Show a success toast, as the component's useEffect will now handle navigation
    toast.success('Login Successful! Welcome.');

  } catch (error) {
    console.log(error);
    // 4. Handle any verification errors (Invalid OTP, OTP Expired, etc.)
    const errorMessage = error.response?.data?.message || 'OTP verification failed';

    dispatch({
      type: LOGIN_FAIL, // Use LOGIN_FAIL to indicate authentication didn't complete
      payload: errorMessage,
      loading: false
    });

    // Show a user-facing error toast for invalid or expired OTP
    toast.error(errorMessage);
  }
};

export const logout = () => async (dispatch) => {
  try {
    await axios.get(`/api/auth/logout`, { withCredentials: true })
    dispatch({ type: 'LOGOUT_SUCCESS' })
  } catch (error) {
    console.log(error)
  }
}
//clearing errors
export const clearErrors = () => async (dispatch) => {
  dispatch({ type: CLEAR_ERRORS })
}
