import {
  CLEAR_ERRORS,
  DETAIL_USER_FAIL,
  DETAIL_USER_REQUEST,
  DETAIL_USER_SUCCESS,
  LOGIN_FAIL,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT_USER_FAIL,
  LOGOUT_USER_SUCCESS,
  LOGOUT_SUCCESS,
} from '../constants/userConstants.js'
const INTIAL_STATE = {
  user: {},
  loading: false,
  isAuthenticated: false,
}
export const userReducer = (state = INTIAL_STATE, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      // case REGISTER_USER_REQUEST:
      return {
        loading: true,
        // isAuthenticated: false,
      }

    case LOGIN_SUCCESS:
      // case REGISTER_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload,
      }

    case LOGIN_FAIL:
      // case REGISTER_USER_FAIL:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      }
    case LOGOUT_USER_SUCCESS:
      return {
        loading: false,
        user: null,
        isAuthenticated: false,
      }
    case LOGOUT_USER_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }

    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      }
    case DETAIL_USER_REQUEST:
      return {
        loading: true,
        // isAuthenticated: false,
      }
    case DETAIL_USER_SUCCESS:
      return {
        // ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload,
        server:action.server
      }

    case DETAIL_USER_FAIL:
      return {
        loading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      }

    case LOGOUT_SUCCESS:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      }

    default:
      return state
  }
}
