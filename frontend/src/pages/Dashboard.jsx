import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-wrapper">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <span className="brand-icon-sm">₹</span>
          <span className="nav-brand-name">NiveshNidhi</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </nav>

      <main className="dashboard-main">
        <div className="welcome-card">
          <div className="avatar">{user?.name?.[0]?.toUpperCase() ?? 'U'}</div>
          <div>
            <h1>Welcome, {user?.name ?? 'Investor'}!</h1>
            <p>{user?.email}</p>
            <span className={`kyc-badge ${user?.isKycVerified ? 'kyc-verified' : 'kyc-pending'}`}>
              {user?.isKycVerified ? '✓ KYC Verified' : '⏳ KYC Pending'}
            </span>
          </div>
        </div>

        <div className="placeholder-grid">
          {['Portfolio', 'Investments', 'Transactions', 'KYC Status'].map((item) => (
            <div key={item} className="placeholder-card">
              <span>{item}</span>
              <p>Coming soon</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
