import React from 'react'

// import CreateOrderCreator from ''

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Typography = React.lazy(() => import('./views/theme/typography/Typography'))

// Base
const Accordion = React.lazy(() => import('./views/base/accordion/Accordion'))
const Breadcrumbs = React.lazy(() => import('./views/base/breadcrumbs/Breadcrumbs'))
const Cards = React.lazy(() => import('./views/base/cards/Cards'))
const Carousels = React.lazy(() => import('./views/base/carousels/Carousels'))
const Collapses = React.lazy(() => import('./views/base/collapses/Collapses'))
const ListGroups = React.lazy(() => import('./views/base/list-groups/ListGroups'))
const Navs = React.lazy(() => import('./views/base/navs/Navs'))
const Paginations = React.lazy(() => import('./views/base/paginations/Paginations'))
const Placeholders = React.lazy(() => import('./views/base/placeholders/Placeholders'))
const Popovers = React.lazy(() => import('./views/base/popovers/Popovers'))
const Progress = React.lazy(() => import('./views/base/progress/Progress'))
const Spinners = React.lazy(() => import('./views/base/spinners/Spinners'))
const Tabs = React.lazy(() => import('./views/base/tabs/Tabs'))
const Tables = React.lazy(() => import('./views/base/tables/Tables'))
const Tooltips = React.lazy(() => import('./views/base/tooltips/Tooltips'))

// Buttons
const Buttons = React.lazy(() => import('./views/buttons/buttons/Buttons'))
const ButtonGroups = React.lazy(() => import('./views/buttons/button-groups/ButtonGroups'))
const Dropdowns = React.lazy(() => import('./views/buttons/dropdowns/Dropdowns'))

//Forms
const ChecksRadios = React.lazy(() => import('./views/forms/checks-radios/ChecksRadios'))
const FloatingLabels = React.lazy(() => import('./views/forms/floating-labels/FloatingLabels'))
const FormControl = React.lazy(() => import('./views/forms/form-control/FormControl'))
const InputGroup = React.lazy(() => import('./views/forms/input-group/InputGroup'))
const Layout = React.lazy(() => import('./views/forms/layout/Layout'))
const Range = React.lazy(() => import('./views/forms/range/Range'))
const Select = React.lazy(() => import('./views/forms/select/Select'))
const Validation = React.lazy(() => import('./views/forms/validation/Validation'))

const Charts = React.lazy(() => import('./views/charts/Charts'))

// Icons
const CoreUIIcons = React.lazy(() => import('./views/icons/coreui-icons/CoreUIIcons'))
const Flags = React.lazy(() => import('./views/icons/flags/Flags'))
const Brands = React.lazy(() => import('./views/icons/brands/Brands'))

// Notifications
const Alerts = React.lazy(() => import('./views/notifications/alerts/Alerts'))
const Badges = React.lazy(() => import('./views/notifications/badges/Badges'))
const Modals = React.lazy(() => import('./views/notifications/modals/Modals'))
const Toasts = React.lazy(() => import('./views/notifications/toasts/Toasts'))

const Widgets = React.lazy(() => import('./views/widgets/Widgets'))
const Api_List = React.lazy(() => import('./views/pages/API_KEY/ApiKeyList.jsx'))
const ApilistCreator = React.lazy(() => import('./views/pages/API_KEY/CreateApiKey.jsx'))
const CreateOrderCreator = React.lazy(
  () => import('./views/pages/OrderCreator/CreateOrederCreator'),
)
const EditOrderCreator = React.lazy(() => import('./views/pages/OrderCreator/EditOrderCreator.jsx'))
const OrderCreators = React.lazy(() => import('./views/pages/OrderCreator/OrderCreators.jsx'))
const CreateSubAdmin = React.lazy(() => import('./views/pages/Admin/CreateSubAdmin.js'))
const CreateUser = React.lazy(() => import('./views/pages/User/CreateUser.jsx'))
const ViewUser = React.lazy(() => import('./views/pages/User/ViewUser.jsx'))
const ViewClaim = React.lazy(() => import('./views/pages/Claim/ViewClaim.jsx'))
const CreateMerchants = React.lazy(() => import('./views/pages/Merchants/CreateMerchants.jsx'))
const EditMerchants = React.lazy(() => import('./views/pages/Merchants/EditMerchants.jsx'))
const MerchantList = React.lazy(() => import('./views/pages/Merchants/MerchantList.jsx'))
const CreateApiKey = React.lazy(() => import('./views/pages/API_KEY/CreateApiKey.jsx'))
const ApiKeyList = React.lazy(() => import('./views/pages/API_KEY/ApiKeyList.jsx'))
const CreateAccounts = React.lazy(() => import('./views/pages/Accounts/CreateAccounts.jsx'))
const EditAccounts = React.lazy(() => import('./views/pages/Accounts/EditAccounts.jsx'))
const CreatePayout = React.lazy(() => import('./views/pages/Payout/CreatePayout.jsx'))
const ViewPayout = React.lazy(() => import('./views/pages/Payout/ViewPayout.jsx'))
const Bulkpayout = React.lazy(() => import('./views/pages/Payout/BulkPayout.jsx'))
const BeneficiaryAccount = React.lazy(() => import('./views/pages/Accounts/BeneficiaryAccount.jsx'))
const BulkBeneficiaryAccount = React.lazy(() => import('./views/pages/Accounts/BulkBeneficiaryAccount.jsx'))
const ViewSubAdmin = React.lazy(() => import('./views/pages/Admin/ViewSubAdmin.jsx'))
const EditSubAdmin = React.lazy(() => import('./views/pages/Admin/EditSubAdmin.js'))
const EditUser = React.lazy(() => import('./views/pages/User/EditUser.jsx'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },

  { path: '/SendMoney', name: 'Send Money', element: CreatePayout },
  { path: '/ViewTransactions', name: 'View Transaction', element: ViewPayout },
  { path: '/MultiplePayments', name: 'Multiple Payments', element: Bulkpayout },

  { path: '/createOrderCreator', name: 'Create Order Creator', element: CreateOrderCreator },
  { path: '/editOrderCreator/:username', name: 'Edit Order Creator', element: EditOrderCreator },
  { path: '/orderCreator', name: 'order List', element: OrderCreators },

  { path: '/createAccounts', name: 'Create Accounts', element: CreateAccounts },
  { path: '/editAccounts/:username', name: 'Edit Accounts', element: EditAccounts },
  { path: '/beneficiary-account', name: 'BeneficiaryAccount', element: BeneficiaryAccount },
  { path: '/BulkBenificieryaccount', name: 'Bulk Beneficiary Account', element: BulkBeneficiaryAccount },
  { path: '/merchants', name: 'Create Merchants', element: CreateMerchants },
  { path: '/editmerchant/:username', name: 'Edit Merchants', element: EditMerchants },
  { path: '/merchantslist', name: 'Merchants List', element: MerchantList },
  { path: '/apiCreate', name: 'Create Api Key', element: CreateApiKey },
  { path: '/apilist', name: 'Api Key List', element: ApiKeyList },

  { path: '/CreateCOAdmin', name: 'Create Co Admin', element: CreateSubAdmin },
  { path: '/viewCoAdmin', name: 'View Co Admin', element: ViewSubAdmin },
  { path: '/editCoAdmin/:id', name: 'Edit Co Admin', element: EditSubAdmin },

  { path: '/CreateUser', name: 'Create User', element: CreateUser },
  { path: '/viewUser', name: 'View User', element: ViewUser },
  { path: '/ViewClaim', name: 'View User', element: ViewClaim },
  { path: '/ViewClaim', name: 'View Claim', element: ViewClaim },
  { path: '/editUser/:id', name: 'Edit User', element: EditUser },

  { path: '/apilist/create', name: 'Apilist ccreate', element: ApilistCreator },
  { path: '/theme', name: 'Theme', element: Colors, exact: true },
  { path: '/theme/colors', name: 'Colors', element: Colors },
  { path: '/theme/typography', name: 'Typography', element: Typography },
  { path: '/base', name: 'Base', element: Cards, exact: true },
  { path: '/base/accordion', name: 'Accordion', element: Accordion },
  { path: '/base/breadcrumbs', name: 'Breadcrumbs', element: Breadcrumbs },
  { path: '/base/cards', name: 'Cards', element: Cards },
  { path: '/base/carousels', name: 'Carousel', element: Carousels },
  { path: '/base/collapses', name: 'Collapse', element: Collapses },
  { path: '/base/list-groups', name: 'List Groups', element: ListGroups },
  { path: '/base/navs', name: 'Navs', element: Navs },
  { path: '/base/paginations', name: 'Paginations', element: Paginations },
  { path: '/base/placeholders', name: 'Placeholders', element: Placeholders },
  { path: '/base/popovers', name: 'Popovers', element: Popovers },
  { path: '/base/progress', name: 'Progress', element: Progress },
  { path: '/base/spinners', name: 'Spinners', element: Spinners },
  { path: '/base/tabs', name: 'Tabs', element: Tabs },
  { path: '/base/tables', name: 'Tables', element: Tables },
  { path: '/base/tooltips', name: 'Tooltips', element: Tooltips },
  { path: '/buttons', name: 'Buttons', element: Buttons, exact: true },
  { path: '/buttons/buttons', name: 'Buttons', element: Buttons },
  { path: '/buttons/dropdowns', name: 'Dropdowns', element: Dropdowns },
  { path: '/buttons/button-groups', name: 'Button Groups', element: ButtonGroups },
  { path: '/charts', name: 'Charts', element: Charts },
  { path: '/forms', name: 'Forms', element: FormControl, exact: true },
  { path: '/forms/form-control', name: 'Form Control', element: FormControl },
  { path: '/forms/select', name: 'Select', element: Select },
  { path: '/forms/checks-radios', name: 'Checks & Radios', element: ChecksRadios },
  { path: '/forms/range', name: 'Range', element: Range },
  { path: '/forms/input-group', name: 'Input Group', element: InputGroup },
  { path: '/forms/floating-labels', name: 'Floating Labels', element: FloatingLabels },
  { path: '/forms/layout', name: 'Layout', element: Layout },
  { path: '/forms/validation', name: 'Validation', element: Validation },
  { path: '/icons', exact: true, name: 'Icons', element: CoreUIIcons },
  { path: '/icons/coreui-icons', name: 'CoreUI Icons', element: CoreUIIcons },
  { path: '/icons/flags', name: 'Flags', element: Flags },
  { path: '/icons/brands', name: 'Brands', element: Brands },
  { path: '/notifications', name: 'Notifications', element: Alerts, exact: true },
  { path: '/notifications/alerts', name: 'Alerts', element: Alerts },
  { path: '/notifications/badges', name: 'Badges', element: Badges },
  { path: '/notifications/modals', name: 'Modals', element: Modals },
  { path: '/notifications/toasts', name: 'Toasts', element: Toasts },
  { path: '/widgets', name: 'Widgets', element: Widgets },
]

export default routes
