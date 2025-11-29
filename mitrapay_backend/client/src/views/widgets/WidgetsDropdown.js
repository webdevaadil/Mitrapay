import React, { useEffect, useState } from 'react';
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CBadge,
  CButton,
  CCardHeader,
  CTable,
  CTableBody,
  CTableRow,
  CTableDataCell,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilDollar,
  cilCheckCircle,
  cilCloudUpload,
  cilChartPie,
  cilArrowBottom,
  cilArrowTop,
  cilMoney,
} from '@coreui/icons';
import { FaPlus } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

// --- KPI CARD COMPONENT ---
const KpiCard = ({ title, value, icon, color, detail, trend }) => {
  const trendIcon =
    trend === 'up' ? cilArrowTop : trend === 'down' ? cilArrowBottom : null;
  const trendColor =
    trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-muted';

  return (
    <CCard
      className={`mb-4 border-start border-start-${color} border-start-3 shadow-sm`}
      style={{ borderRadius: '0.75rem' }}
    >
      <CCardBody className="p-3">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="text-body-secondary text-uppercase fw-semibold mb-1 small">
              {title}
            </div>
            <div
              className={`fs-3 fw-bold mb-0 ${color === 'warning' ? 'text-dark' : 'text-primary'
                }`}
            >
              {value}
            </div>
          </div>
          <div
            className={`bg-${color} bg-opacity-10 text-${color} p-2 rounded-circle`}
            style={{ fontSize: '1.5rem' }}
          >
            <CIcon icon={icon} size="xl" />
          </div>
        </div>
        <hr className="my-2" />
        <div className={`d-flex align-items-center small ${trendColor}`}>
          {trendIcon && <CIcon icon={trendIcon} className="me-1" />}
          <span className="fw-semibold">{detail}</span>
        </div>
      </CCardBody>
    </CCard>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
const Dashboard = () => {
  const { user } = useSelector((state) => state.user);
  const [dashData, setDashData] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/auth/dashboard_data', { withCredentials: true });
      const data = res.data;

      setDashData(data);
      if (data.recentActivity) setRecentActivity(data.recentActivity);
      if (data.pendingApprovals) setPendingApprovals(data.pendingApprovals);
    } catch (err) {
      toast.error('Failed to load dashboard data.');
      if (err.response && err.response.status === 401) {
        toast.error('Session expired. Please log in again.');
        window.location.reload();
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Dynamic KPI Cards
  const kpiData = [
    {
      title: 'Today Balance',
      value: `₹ ${dashData.today_balance || 0}`,
      icon: cilMoney,
      color: 'primary',
      detail: `₹ ${dashData.total_balance || '-'} Total Balance`,
      trend: dashData.total_balance || 'up',
      role: "Super_Admin"
    },
    {
      title: "Today's Payment",
      value: `₹ ${dashData.today_payout || 0}`,
      icon: cilCheckCircle,
      color: 'success',
      to: "/ViewTransactions",

      detail: `₹ ${dashData.total_payout || 0} Successful Payments`,
      trend: dashData.payoutTrend || 'up',
    },
    {
      title: 'Today Payment Accounts',
      value: `${dashData.today_account || 0}`,
      icon: cilCloudUpload,
      color: 'info',
      detail: `${dashData.total_account || 0} Total Accounts`,
      trend: dashData.total_account || 'flat',
    },
    {
      title: 'Rejected Transactions',
      value: `₹ ${dashData.todalrejectedtransaction || 0}`,
      icon: cilChartPie,
      color: 'warning',
      detail: dashData.toatalrejectedtransaction
        ? `₹ ${dashData.toatalrejectedtransaction} Total Rejected`
        : '-',
      trend: dashData.toatalrejectedtransaction || 'down',
    },
  ];
  const navigate = useNavigate();

  const handleDivClick = (page) => {
    navigate(page);
  };
  return (
    <CContainer fluid className="p-4">
      {/* Header */}
      <CRow className="mb-4 align-items-center">
        <CCol xs={6}>
          <h2 className="mb-0 fw-light">Dashboard Overview</h2>
        </CCol>
        <CCol xs={6} className="text-end">
          <CButton color="primary" className="fw-semibold shadow-sm" as={NavLink} to="/MultiplePayments">
            <FaPlus className="me-2" />
            New Multiple Payments
          </CButton>
     
          {(user.role != "User") && (user.email != "tiger@gmail.com") && <CButton color="primary" className="fw-semibold shadow-sm ms-2" as={NavLink} to="/MultiplePayments">
            <FaPlus className="me-2" />
            Bulk UTR 
          </CButton>}
        </CCol>
      </CRow>

      {/* KPI Cards */}
      <CRow>
        {kpiData.map((kpi, index) => (
          <CCol xs={12} sm={6} lg={3} key={index} onClick={() => handleDivClick(kpi?.to)}>
            <KpiCard {...kpi} />
          </CCol>
        ))}
      </CRow>

      {/* Admin-Specific Data */}
      {user.role == 'aadil' && (
        <CRow className="mt-4">
          {/* Recent Activity */}
          <CCol xs={12} lg={7} className="mb-4">
            <CCard className="shadow-lg border-0" style={{ borderRadius: '0.75rem' }}>
              <CCardHeader className="fw-bold bg-light border-bottom">Recent File Activity</CCardHeader>
              <CCardBody className="p-0">
                <CTable hover responsive className="mb-0 align-middle">
                  <CTableBody>
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity, idx) => {
                        const badgeColor =
                          activity.status === 'Processed'
                            ? 'success'
                            : activity.status === 'Pending'
                              ? 'warning'
                              : 'danger';
                        return (
                          <CTableRow key={idx}>
                            <CTableDataCell className="fw-semibold">
                              {activity.filename}
                            </CTableDataCell>
                            <CTableDataCell>
                              <CBadge
                                color={badgeColor}
                                shape="rounded-pill"
                                className="px-3 fw-normal"
                              >
                                {activity.status}
                              </CBadge>
                            </CTableDataCell>
                            <CTableDataCell className="text-end fw-semibold">
                              {activity.amount}
                            </CTableDataCell>
                            <CTableDataCell className="text-end text-muted small">
                              {activity.date}
                            </CTableDataCell>
                          </CTableRow>
                        );
                      })
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan="4" className="text-center py-4 text-muted">
                          No recent activity available.
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              </CCardBody>
            </CCard>
          </CCol>

          {/* Pending Approvals */}
          <CCol xs={12} lg={5} className="mb-4">
            <CCard className="shadow-lg border-0" style={{ borderRadius: '0.75rem' }}>
              <CCardHeader className="fw-bold bg-light border-bottom text-warning">
                Pending Approvals ({pendingApprovals.length})
              </CCardHeader>
              <CCardBody className="p-3">
                {pendingApprovals.length > 0 ? (
                  <ul className="list-unstyled mb-0">
                    {pendingApprovals.map((item, index) => (
                      <li key={index} className="d-flex align-items-start mb-3 pb-2 border-bottom">
                        <CIcon className="me-3 mt-1 text-warning" size="lg" />
                        <div>
                          <div className="fw-semibold">{item.type}</div>
                          <div className="small text-muted">{item.detail}</div>
                          <div className="small">{item.user} • {item.date}</div>
                        </div>
                        <CButton color="primary" size="sm" className="ms-auto" href="/approvals">
                          Review
                        </CButton>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-muted m-4">✅ All clear!</p>
                )}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}
    </CContainer>
  );
};

export default Dashboard;
