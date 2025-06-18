import { useState, useEffect } from 'react';


const getIsMobile = () => {
    return window.innerWidth < 480;
}

const useIsMobile = () => {
  // Based on https://stackoverflow.com/a/36862446
  const [isMobile, setIsMobile] = useState(getIsMobile());

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(getIsMobile());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

export { useIsMobile };