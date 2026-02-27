import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const PageTransition = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setIsVisible(true);
  }, [location.pathname]);

  return (
    <div className={`transition-opacity duration-200 ${isVisible ? "opacity-100" : "opacity-95"}`}>
      {children}
    </div>
  );
};

export default PageTransition;
