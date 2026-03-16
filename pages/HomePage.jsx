import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderLogo from '../components/HeaderLogo';
import Footer from '../components/Footer';

const HomePage = () => {
  const navigate = useNavigate();

  const pageStyles = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#0b0f17',
    fontFamily: "'Inter', system-ui, sans-serif",
  };

  const heroStyles = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
    position: 'relative',
    overflow: 'hidden',
  };

  const backgroundStyles = {
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.15), transparent),
      radial-gradient(ellipse 60% 40% at 80% 60%, rgba(6, 182, 212, 0.1), transparent),
      radial-gradient(ellipse 50% 30% at 20% 80%, rgba(59, 130, 246, 0.08), transparent)
    `,
    zIndex: 0,
  };

  const gridPatternStyles = {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
    zIndex: 0,
  };

  const contentStyles = {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    maxWidth: '800px',
  };

  const titleStyles = {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 'clamp(2.5rem, 6vw, 4rem)',
    fontWeight: '700',
    lineHeight: '1.1',
    marginBottom: '24px',
    background: 'linear-gradient(135deg, #fff 0%, #60a5fa 50%, #06b6d4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    animation: 'fadeInUp 0.6s ease forwards',
  };

  const subtitleStyles = {
    fontSize: '1.25rem',
    color: '#9ca3af',
    marginBottom: '16px',
    lineHeight: '1.7',
    maxWidth: '600px',
    margin: '0 auto 16px',
  };

  const descriptionStyles = {
    fontSize: '1rem',
    color: '#6b7280',
    marginBottom: '48px',
    lineHeight: '1.6',
  };

  const buttonStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    padding: '18px 48px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: 'white',
    fontSize: '1.125rem',
    fontWeight: '600',
    textDecoration: 'none',
    borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(59, 130, 246, 0.4)',
    transition: 'all 0.3s ease',
    border: 'none',
    cursor: 'pointer',
  };

  const handleEnterDashboard = () => {
    const dashboard = document.getElementById('dashboard-content');
    if (dashboard) {
      dashboard.style.opacity = '0';
      dashboard.style.transform = 'translateY(20px)';
    }
    setTimeout(() => {
      navigate('/dashboard');
    }, 300);
  };

  const statsStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '32px',
    marginTop: '80px',
    paddingTop: '48px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    maxWidth: '600px',
    margin: '80px auto 0',
  };

  const statItemStyles = {
    textAlign: 'center',
  };

  const statValueStyles = {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '2rem',
    fontWeight: '700',
    color: '#60a5fa',
    marginBottom: '4px',
  };

  const statLabelStyles = {
    fontSize: '0.875rem',
    color: '#6b7280',
  };

  return (
    <div style={pageStyles}>
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .enter-button:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 32px rgba(59, 130, 246, 0.5) !important;
          }
          .enter-button:active {
            transform: translateY(0) !important;
          }
        `}
      </style>

      <div style={heroStyles}>
        <div style={backgroundStyles}></div>
        <div style={gridPatternStyles}></div>

        <div style={contentStyles}>
          {/* Header Logo */}
          <div style={{ marginBottom: '48px', animation: 'fadeInUp 0.6s ease forwards' }}>
            <HeaderLogo size="large" />
          </div>

          <h1 style={titleStyles}>
            WeatherAI Dashboard
          </h1>
          
          <p style={subtitleStyles}>
            AI Powered Weather Forecast and Environmental Monitoring Platform
          </p>
          
          <p style={descriptionStyles}>
            Get real-time weather predictions, air quality monitoring, and environmental insights 
            powered by advanced AI algorithms. Experience the future of weather forecasting today.
          </p>

          <button 
            className="enter-button"
            style={buttonStyles}
            onClick={handleEnterDashboard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(59, 130, 246, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(59, 130, 246, 0.4)';
            }}
          >
            Enter Dashboard
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>

          <div style={statsStyles}>
            <div style={statItemStyles}>
              <div style={statValueStyles}>150+</div>
              <div style={statLabelStyles}>Countries</div>
            </div>
            <div style={statItemStyles}>
              <div style={statValueStyles}>99.9%</div>
              <div style={statLabelStyles}>Uptime</div>
            </div>
            <div style={statItemStyles}>
              <div style={statValueStyles}>24/7</div>
              <div style={statLabelStyles}>Support</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
