import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const ScrollTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
};

export default ScrollTop;
