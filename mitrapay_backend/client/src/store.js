import { legacy_createStore as createStore, combineReducers, applyMiddleware } from 'redux'
import { thunk } from "redux-thunk"
import { composeWithDevTools } from "redux-devtools-extension"
import { userReducer } from "./reducers/userReducer.js"
// import { apiReducer } from "./reducers/apiReducer.js"


const initialState = {
  sidebarShow: true,
  theme: 'dark',
  isAuthenticated: false,
  user: null,
  loading: true,
}

const middleware = [thunk]
const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }
    default:
      return state
  }
}
const reducer = combineReducers({
  changeState,
  user: userReducer,
  // apidata: apiReducer

})
const store = createStore(reducer,
  composeWithDevTools(applyMiddleware(...middleware))
)
export default store
