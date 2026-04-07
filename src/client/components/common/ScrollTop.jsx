import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const ScrollTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant'}, [pathname]);
        return null;
    })
}

export default ScrollTop;
