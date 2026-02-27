import './AuthCard.css';

const AuthCard = ({ title, subtitle, children }) => (
  <div className="auth-wrapper">
    <div className="auth-card">
      <div className="auth-brand">
        <span className="brand-icon">₹</span>
        <span className="brand-name">NiveshNidhi</span>
      </div>
      <h2 className="auth-title">{title}</h2>
      {subtitle && <p className="auth-subtitle">{subtitle}</p>}
      {children}
    </div>
  </div>
);

export default AuthCard;
