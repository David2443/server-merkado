import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import React from 'react';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    setTimeout(() => {
      // 1. Fereastra principală cu 'smooth'
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

      // 2. #root
      const rootDiv = document.getElementById('root');
      if (rootDiv) rootDiv.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

      // 3. Wrapper-ul tău principal
      const ecomWrapper = document.querySelector('.general-ecom-wrapper');
      if (ecomWrapper) ecomWrapper.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

      // 4. Body-ul direct
      document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      
    }, 50);
  }, [pathname]);

  return null;
};

export default ScrollToTop;