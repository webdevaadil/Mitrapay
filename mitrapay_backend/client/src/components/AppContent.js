import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'
import { useSelector } from 'react-redux'
import routes from '../routes'

// --- Theme ---
const CUSTOM_PRIMARY = '#ff6600' // Vibrant Orange

const AppContent = () => {
  const { user, loading } = useSelector((state) => state.user)

  // 🔸 1. Show Spinner During Loading
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          height: '100vh',
          // backgroundColor: '#f9f9f9',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <CSpinner style={{ color: CUSTOM_PRIMARY, width: '4rem', height: '4rem' }} />
        <p style={{ color: '#555', fontWeight: 500, marginTop: '10px' }}>Loading, please wait...</p>
      </div>
    )
  }

  // 🔸 2. Redirect if Not Authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  const { role, Pages: allowedPages = [] } = user

  // 🔸 3. Filter Routes Based on Role and Permissions
  const filteredRoutes = routes.filter((route) => {
    if (!route.name || !allowedPages.includes(route.name)) return false
    return ['Super_Admin', 'Sub_Admin', 'User'].includes(role)
  })

  // 🔸 4. Render Routes
  return (
    <main style={{ minHeight: '100vh' }}>
      <CContainer className="px-4 py-4" lg>
        <Suspense
          fallback={
            <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
              <CSpinner style={{ color: CUSTOM_PRIMARY, width: '3rem', height: '3rem' }} />
            </div>
          }
        >
          <Routes>
            {filteredRoutes.map(
              (route, idx) =>
                route.element && (
                  <Route
                    key={idx}
                    path={route.path}
                    exact={route.exact}
                    name={route.name}
                    element={<route.element />}
                  />
                )
            )}

            {/* Default / Fallback Route */}
            {filteredRoutes.length > 0 ? (
              <Route path="/" element={<Navigate to={filteredRoutes[0].path} replace />} />
            ) : (
              <Route path="*" element={<Navigate to="/login" replace />} />
            )}
          </Routes>
        </Suspense>
      </CContainer>
    </main>
  )
}

export default React.memo(AppContent)
