import React from 'react';
import './Header.css';
// If you have an SVG logo you can import it this way and then set its fill:
// import { ReactComponent as Logo } from './Logo.svg';
import logo from './Logo.png';

function Header({ logoSize = '300px', logoColor }) {
  // For PNG images, you can only resize the logo.
  // For SVGs, you could pass the logoColor as a fill (see commented example below).
  const logoStyle = {
    width: logoSize,
    height: 'auto'
  };

  return (
    <header className="header">
      {/* If using an SVG:
            <Logo
              className="header-logo"
              style={{ width: logoSize, height: 'auto', fill: logoColor || '#000' }}
            />
      */}
      <img
        src={logo}
        alt="My App Logo"
        className="header-logo"
        style={logoStyle}
      />
    </header>
  );
}

export default Header;