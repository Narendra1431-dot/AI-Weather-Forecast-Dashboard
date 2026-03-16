import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeaderLogo = ({ size = 'large' }) => {
  const navigate = useNavigate();

  const containerStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  };

  const iconContainerStyles = {
    width: size === 'large' ? '56px' : '40px',
    height: size === 'large' ? '56px' : '40px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    borderRadius: size === 'large' ? '16px' : '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
  };

  const textStyles = {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: size === 'large' ? '2rem' : '1.25rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  const handleClick = () => {
    navigate('/dashboard');
  };

  return (
    <div 
      style={containerStyles} 
      onClick={handleClick}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div style={iconContainerStyles}>
        <svg 
          width={size === 'large' ? '28' : '22'} 
          height={size === 'large' ? '28' : '22'} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M12 3V5M5.636 5.636L7.05 7.05M3 12H5M5.636 18.364L7.05 16.95M12 19V21M16.95 16.95L18.364 18.364M19 12H21M16.95 7.05L18.364 5.636" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="4" fill="white"/>
        </svg>
      </div>
      <span style={textStyles}>WeatherAI</span>
    </div>
  );
};

export default HeaderLogo;
