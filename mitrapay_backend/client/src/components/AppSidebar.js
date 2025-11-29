import React from 'react'

import {
    CSidebar,
} from '@coreui/react'

// Import components and assets that are no longer needed are removed
// import { AppSidebarNav } from './AppSidebarNav' 
// import navigation from '../_nav'
// import logo from '../assets/images/tigerpay.png'
// import { useSelector } from 'react-redux'

// The component receives props but ignores them since the sidebar is gone
const AppSidebar = ({ sidebarShow, setSidebarShow }) => {
    // The sidebar component now returns nothing, effectively removing it from the DOM.
    return (
        <React.Fragment></React.Fragment>
    )
}

export default React.memo(AppSidebar)