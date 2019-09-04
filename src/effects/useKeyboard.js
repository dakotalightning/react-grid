import { useEffect, useState } from "react";

export default () => {
  const [keyPressed, setKeyPressed] = useState(null);
  const [isKeyDown, setKeyDown] = useState(false);
  // const [isKeyUp, setKeyUp] = useState(false);

  useEffect(() => {
    const handleKeyDown = ({ code }) => {
      setKeyDown(true);
      setKeyPressed(code);
      // setKeyUp(false);
    };

    const handleKeyUp = () => {
      setKeyPressed(null);
      setKeyDown(false);
      // setKeyUp(true);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [keyPressed, isKeyDown]);

  const collectedProps = {
    keyPressed,
    isKeyDown
  };

  return [collectedProps];
};
