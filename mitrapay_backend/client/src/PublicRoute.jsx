import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.user)

  if (loading) return <div>Loading...</div>

  return isAuthenticated ? <Navigate to="/dashboard" /> : children
}

export default PublicRoute