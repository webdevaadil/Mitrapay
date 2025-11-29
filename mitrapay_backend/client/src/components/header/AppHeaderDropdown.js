import React from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilLockLocked,
  cilSettings,
  cilUser,
  // Imported other common icons for potential future use or better design
  cilCreditCard,
  cilFile,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

// import avatar8 from './../../assets/images/avatars/8.jpg' // Removed unused asset import
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../actions/userAction'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  // Assuming user object has Name and Email/Role
  const { user } = useSelector((state) => state.user)

  // Use Name if available, otherwise fall back to user's first initial if it exists, else 'U'
  const initials = user?.Name?.split(' ').map(name => name.charAt(0)).join('').substring(0, 2).toUpperCase() || (user?.email?.charAt(0) || 'U').toUpperCase()

  const handleLogout = async (e) => {
    e.preventDefault(); // Prevent default link behavior
    await dispatch(logout());
    toast.success('Logout successful');
    navigate('/login', { replace: true });
  };

  return (
    <CDropdown variant="nav-item">
      {/* Custom Avatar Toggle: Using initials within a styled CAvatar equivalent div */}
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0 border-0 bg-transparent" caret={false}>
        <div
          // Using Bootstrap/CoreUI utility classes for styling (bg-primary, text-white, rounded-circle, d-flex, align-items-center, justify-content-center, fw-bold)
          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
          style={{ width: '36px', height: '36px', fontSize: '1rem', textTransform: 'uppercase' }}
        >
          {initials}
        </div>
      </CDropdownToggle>

      <CDropdownMenu className="pt-0" placement="bottom-end">
        {/* User Information Header */}
        <CDropdownHeader className="bg-light fw-semibold py-2">
          {/* Display Name and Role/Email */}
          <div className="fw-bold">{user?.Name || 'User Name'}</div>
          <small className="text-muted">{user?.role || user?.email || 'N/A'}</small>
        </CDropdownHeader>

        {/* --- Account Actions --- */}
        
        <CDropdownItem href="#" className="d-flex align-items-center">
          <CIcon icon={cilUser} className="me-3" />
          Profile
        </CDropdownItem>
        
        <CDropdownItem href="#" className="d-flex align-items-center">
          <CIcon icon={cilSettings} className="me-3" />
          Settings
        </CDropdownItem>

        <CDropdownItem href="#" className="d-flex align-items-center">
          <CIcon icon={cilCreditCard} className="me-3" />
          Payments
        </CDropdownItem>

        <CDropdownItem href="#" className="d-flex align-items-center">
          <CIcon icon={cilFile} className="me-3" />
          Invoices
        </CDropdownItem>
        
        <CDropdownDivider />

        {/* --- Logout --- */}
        <CDropdownItem onClick={handleLogout} className="text-danger d-flex align-items-center">
          <CIcon icon={cilLockLocked} className="me-3" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown