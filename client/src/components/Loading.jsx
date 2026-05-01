import { FiShoppingBag } from 'react-icons/fi';
import './Loading.css';
import React from 'react';
const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader-content">
        <div className="icon-pulse">
          {/* Am mărit puțin dimensiunea pentru impact vizual */}
          <FiShoppingBag size={60} color="#3b82f6" strokeWidth={1.5} />
        </div>
        
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
        
        <p>Se pregătește experiența premium</p>
      </div>
    </div>
  );
};

export default Loader;