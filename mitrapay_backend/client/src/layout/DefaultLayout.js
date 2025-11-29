import React from 'react'
import { AppContent, AppFooter, AppHeader } from '../components/index' // AppSidebar is removed
import { useSelector } from 'react-redux';

const DefaultLayout = () => {
    // sidebarShow and setSidebarShow state are no longer needed
    const { isAuthenticated, loading } = useSelector((state) => state.user); 

    // console.log("auth:", isAuthenticated, "loading:", loading);

    return (
        <div>
            {/* AppSidebar component is removed */}
            <div className="wrapper d-flex flex-column min-vh-100">
                {/* AppHeader now handles all navigation */}
                <AppHeader /> 
                <div className="body flex-grow-1">
                    <AppContent />
                </div>
                <AppFooter />
            </div>
        </div>
    )
}

export default DefaultLayout