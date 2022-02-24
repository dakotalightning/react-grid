import { useEffect, useState } from "react";
import { debounce } from "lodash";

const isClient = typeof window === "object";

const defaultSize = {
  width: isClient ? window.innerWidth : undefined,
  height: isClient ? window.innerHeight : undefined
};

export default () => {
  const [windowSize, setWindowSize] = useState(defaultSize);

  useEffect(() => {
    function getSize() {
      return {
        width: isClient ? window.innerWidth : undefined,
        height: isClient ? window.innerHeight : undefined
      };
    }

    if (!isClient) {
      return false;
    }

    const handleResize = debounce(
      () => {
        setWindowSize(getSize());
      },
      200,
      { leading: false, trailing: true }
    );

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return [windowSize];
};
