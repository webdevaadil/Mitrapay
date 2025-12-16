import React, { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CNavLink,
  CNavItem,
  useColorModes,
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilContrast, cilMoon, cilSun, cilDollar, cilMenu } from '@coreui/icons'
import { useSelector } from 'react-redux'
import navigation from '../_nav'
import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import logo from '../assets/images/tigerpay.png'

// --- Design Constants ---
const CUSTOM_PRIMARY = '#ff66b2'
const TEXT_ACCENT = '#cc4a92' 

const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('dark')
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useSelector((state) => state.user)

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    const handleScroll = () => {
      headerRef.current?.classList.toggle('shadow-lg', document.documentElement.scrollTop > 0)
    }
    document.addEventListener('scroll', handleScroll)
    return () => document.removeEventListener('scroll', handleScroll)
  }, [])

  const displayBalance = user && user.role !== 'Super_Admin' && user.credit !== undefined
  const balanceClass = user?.credit > 100 ? 'text-success' : 'text-warning'

  const allowedPages = user?.Pages || []
  const role = user?.role

  const filteredNavigation = navigation.filter((route) => {
    if (!route.name || !allowedPages.includes(route.name)) return false
    return ['Super_Admin', 'Sub_Admin', 'User'].includes(role)
  })

  const linkStyle = ({ isActive }) => ({
    color: isActive ? 'white' : '#dededeff',
    fontWeight: isActive ? '600' : '500',
    borderBottom: isActive ? `2px solid ${CUSTOM_PRIMARY}` : '2px solid transparent',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
  })

  const dropdownToggleStyle = {
    color: 'white',
    fontWeight: '500',
    padding: '0.4rem 0.8rem',
    backgroundColor: 'transparent',
    border: 'none',
  }

  const dropdownItemStyle = ({ isActive }) => ({
    color: isActive ? 'white' : '#dededeff',
    backgroundColor: isActive ? CUSTOM_PRIMARY : 'transparent',
    transition: 'all 0.2s ease',
  })
  console.log("nav:", filteredNavigation);
  return (
    <CHeader position="sticky" className="mb-4 shadow-sm " ref={headerRef}>
      {/* --- MAIN HEADER --- */}
      <CContainer
        fluid
        className="px-3 py-2 d-flex justify-content-between align-items-center"
        style={{
          borderBottom: `2px solid ${CUSTOM_PRIMARY}`,
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}
      >
        {/* --- Left: Logo --- */}
        <div className="d-flex align-items-center gap-3">
          <NavLink to="/dashboard">
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
          </NavLink>
        </div>

        {/* --- Center: Navigation (hidden on mobile) --- */}
        <CHeaderNav
          className="d-none d-md-flex align-items-center justify-content-center flex-grow-1"
          style={{ gap: '1.2rem' }}
        >
          {filteredNavigation.map((item, index) =>
            item.items && item.items.length > 0 ? (
              <CDropdown key={index} variant="nav-item" alignment="start">
                <CDropdownToggle className="nav-link" style={dropdownToggleStyle}>
                  {item.label || item.name}
                </CDropdownToggle>
                <CDropdownMenu className="pt-0 shadow-sm border-0 rounded-3">
                  {item.items.map((subItem, subIndex) => (
                    <CDropdownItem
                      key={subIndex}
                      as={NavLink}
                      to={subItem.to}
                      style={({ isActive }) => dropdownItemStyle({ isActive })}
                    >
                      {subItem.label || subItem.name}
                    </CDropdownItem>
                  ))}
                </CDropdownMenu>
              </CDropdown>
            ) : (
              item.to && (
                <CNavItem key={index} style={dropdownToggleStyle}>
                  <CNavLink as={NavLink} to={item.to} style={linkStyle}>
                    {item.name}
                  </CNavLink>
                </CNavItem>
              )
            )
          )}
        </CHeaderNav>

        {/* --- Right Section --- */}
        <CHeaderNav className="align-items-center gap-2">
          {displayBalance && (
            <CNavItem className="d-none d-sm-flex align-items-center px-2">
              <CIcon  className={`me-1 ${balanceClass}`} style={{ color: TEXT_ACCENT }} />
              <span className={`fw-semibold ${balanceClass}`}>₹{user.credit?.toFixed(2) || '0.00'}</span>
            </CNavItem>
          )}

          {/* --- Theme --- */}
          {/* <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle caret={false} className="border-0 bg-transparent" style={{ color: TEXT_ACCENT }}>
              {colorMode === 'dark' ? (
                <CIcon icon={cilMoon} size="lg" />
              ) : colorMode === 'auto' ? (
                <CIcon icon={cilContrast} size="lg" />
              ) : (
                <CIcon icon={cilSun} size="lg" />
              )}
            </CDropdownToggle>
            <CDropdownMenu className="border-0 shadow-sm">
              <CDropdownItem active={colorMode === 'light'} onClick={() => setColorMode('light')}>
                <CIcon className="me-2" icon={cilSun} size="lg" /> Light
              </CDropdownItem>
              <CDropdownItem active={colorMode === 'dark'} onClick={() => setColorMode('dark')}>
                <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
              </CDropdownItem>
              <CDropdownItem active={colorMode === 'auto'} onClick={() => setColorMode('auto')}>
                <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown> */}

          {/* --- Mobile Menu Button --- */}
          <CButton
            className="d-md-none border-0 bg-transparent "
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <CIcon icon={cilMenu} size="lg" />
          </CButton>

          {/* --- User Dropdown --- */}
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>

      {/* --- Mobile Dropdown Menu --- */}
      {menuOpen && (
        <div
          className="d-md-none border-top shadow-sm py-2"
          style={{ animation: 'fadeIn 0.3s ease' }}
        >
          {filteredNavigation.map((item, index) =>
            item.items && item.items.length > 0 ? (
              <div key={index}>
                <div className="fw-semibold px-3 py-2">{item.name}</div>
                {item.items.map((subItem, subIndex) => (
                  <NavLink
                    key={subIndex}
                    to={subItem.to}
                    className="d-block px-4 py-2  text-decoration-none"
                    onClick={() => setMenuOpen(false)}
                    //  style={{color: '#bfbebe'}}
                      style={({ isActive }) => dropdownItemStyle({ isActive })}

                  >
                    {subItem.name}
                  </NavLink>
                ))}
              </div>
            ) : (
              item.to && (
                <NavLink
                  key={index}
                  to={item.to}
                  className="d-block px-3 py-2  text-decoration-none"
                  onClick={() => setMenuOpen(false)}
                    style={dropdownToggleStyle}
                  
                >
                  {item.name}
                </NavLink>
              )
            )
          )}
        </div>
      )}

      {/* --- Breadcrumb --- */}
      <CContainer className="px-4 py-2 border-top" fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
