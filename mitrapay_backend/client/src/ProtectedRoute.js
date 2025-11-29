import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.user);

  if (loading) return <div>Loading...</div>;


  return isAuthenticated == true ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
