import React from 'react';

const Footer = () => {
  const footerStyles = {
    background: 'rgba(17, 24, 39, 0.95)',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    padding: '48px 24px 24px',
    marginTop: 'auto',
  };

  const containerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '32px',
    marginBottom: '32px',
  };

  const columnTitleStyles = {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#f9fafb',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '16px',
  };

  const linkStyles = {
    color: '#9ca3af',
    textDecoration: 'none',
    fontSize: '0.9375rem',
    display: 'block',
    marginBottom: '8px',
    transition: 'color 0.2s ease',
  };

  const copyrightStyles = {
    borderTop: '1px solid rgba(255,255,255,0.08)',
    paddingTop: '24px',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '0.875rem',
  };

  return (
    <footer style={footerStyles}>
      <div style={containerStyles}>
        <div style={gridStyles}>
          {/* Services */}
          <div>
            <h4 style={columnTitleStyles}>Services</h4>
            <a href="#" style={linkStyles}>Weather Forecast</a>
            <a href="#" style={linkStyles}>Air Quality Monitoring</a>
            <a href="#" style={linkStyles}>Environmental Insights</a>
            <a href="#" style={linkStyles}>Climate Analytics</a>
          </div>

          {/* Company */}
          <div>
            <h4 style={columnTitleStyles}>Company</h4>
            <a href="about.html" style={linkStyles}>About Us</a>
            <a href="#" style={linkStyles}>Contact</a>
            <a href="#" style={linkStyles}>Support</a>
          </div>

          {/* Legal */}
          <div>
            <h4 style={columnTitleStyles}>Legal</h4>
            <a href="privacy.html" style={linkStyles}>Privacy Policy</a>
            <a href="terms.html" style={linkStyles}>Terms & Conditions</a>
            <a href="#" style={linkStyles}>Data Usage Policy</a>
          </div>

          {/* Technology */}
          <div>
            <h4 style={columnTitleStyles}>Technology</h4>
            <a href="#" style={linkStyles}>AI Powered Prediction</a>
            <a href="#" style={linkStyles}>Real-time Weather APIs</a>
            <a href="#" style={linkStyles}>Environmental Monitoring</a>
          </div>
        </div>

        <div style={copyrightStyles}>
          © 2026 WeatherAI Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
