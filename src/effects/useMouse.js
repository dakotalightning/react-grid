import { useEffect, useState } from "react";
import { throttle, debounce } from "lodash";

export default options => {
  const events = {
    onMouseMove: () => {},
    onMouseDown: () => {},
    onMouseUp: () => {},
    onMouseOut: () => {},
    ...options
  };
  const [currentMousePosition, setCurrentMousePosition] = useState({});

  const [mousePositions, setMousePositions] = useState([]);
  const [isMouseDown, setMouseDown] = useState(false);
  const [isMouseMoving, setMouseMoving] = useState(false);
  const [mouseButton, setMouseButton] = useState(-1);

  useEffect(() => {
    const handleMouseDown = ({ button, clientX, clientY }) => {
      setMouseButton(button);
      setMouseDown(true);
      setMousePositions([{ x: clientX, y: clientY }]);

      setCurrentMousePosition({ x: clientX, y: clientY });

      events.onMouseDown({ button, x: clientX, y: clientY });
    };

    const handleMouseMove = ({ clientX, clientY, pageX }) => {
      if (!isMouseDown) return;
      setMouseMoving(true);
      setMousePositions(p => [...p, { x: clientX, y: clientY }]);

      setCurrentMousePosition({ x: clientX, y: clientY });

      events.onMouseMove({ x: clientX, y: clientY });
    };

    const handleMouseUp = ({ clientX, clientY }) => {
      setMouseDown(false);
      setMouseMoving(false);

      events.onMouseUp({ x: clientX, y: clientY });
    };

    const handleMouseOut = ({ clientX, clientY }) => {
      setMouseDown(false);
      setMouseMoving(false);
      events.onMouseOut({ x: clientX, y: clientY });
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseout", handleMouseOut);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [isMouseDown, isMouseMoving, events]);

  const collectedProps = {
    mouseButton,
    isMouseDown,
    isMouseMoving,
    mousePositions,
    currentMousePosition
  };

  return [collectedProps];
};
