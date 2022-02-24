import { useEffect, useState } from "react";
import * as R from "ramda";

const defaultEvents = {
  onMouseMove: () => {},
  onMouseDown: () => {},
  onMouseUp: () => {},
  onMouseOut: () => {}
};

export default (options) => {
  const events = Object.assign({}, defaultEvents, options);
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

    const handleMouseMove = ({ clientX, clientY }) => {
      if (!isMouseDown) return;
      setMouseMoving(true);
      setMousePositions((p) => [...R.uniq(p), { x: clientX, y: clientY }]);

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
