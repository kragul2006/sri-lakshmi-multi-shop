import React from 'react';
import '../styles/Loader.css';

const Loader = ({ size = 'medium', fullScreen = false }) => {
  const sizeClass = {
    small: 'loader-small',
    medium: 'loader-medium',
    large: 'loader-large'
  }[size];

  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <div className={`loader ${sizeClass}`}>
          <div className="loader-spinner"></div>
        </div>
        <p className="loader-text">Loading...</p>
      </div>
    );
  }

  return (
    <div className="loader-container">
      <div className={`loader ${sizeClass}`}>
        <div className="loader-spinner"></div>
      </div>
    </div>
  );
};

export default Loader;