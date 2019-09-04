import { useEffect, useState } from "react";

import { debounce } from "lodash";

export default () => {
  const [windowSize, setWindowSize] = useState({
    height: window.innerHeight,
    width: window.innerWidth
  });

  useEffect(() => {
    const handleWindowSize = () => {
      setWindowSize({ height: window.innerHeight, width: window.innerWidth });
    };
    const debouncehHndleWindowSize = debounce(handleWindowSize, 200);
    document.addEventListener("resize", debouncehHndleWindowSize);
    return () => {
      debouncehHndleWindowSize.cancel();
      document.removeEventListener("resize", debouncehHndleWindowSize);
    };
  }, []);

  return [windowSize];
};
