import React, { useEffect, useState, useCallback, useMemo } from "react";
import { render } from "react-dom";
import { Stage, Layer, Rect, Path } from "react-konva";

import useMouse from "./effects/useMouse";
import useKeyboard from "./effects/useKeyboard";
import useWindow from "./effects/useWindow";

import "./style.scss";

const NODE_SIZE = 30;
const WIDTH = 30;
const HEIGHT = 30;
const id = ({ col, row }) => `col${col}row${row}`;

const createGrid = (width = WIDTH, height = HEIGHT, nodeSize = NODE_SIZE) =>
  [...Array(width)]
    .map((_, col) =>
      [...Array(height)].map((_, row) => ({
        col,
        row,
        x: col * nodeSize,
        y: row * nodeSize,
        fill: "#fff"
      }))
    )
    .reduce((p, c) => [...p, ...c]);

function ddaAsPoint(x0, y0, x1, y1) {
  const dx = x1 - x0,
    dy = y1 - y0,
    s = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy),
    xi = (dx * 1.0) / s,
    yi = (dy * 1.0) / s;

  var x = x0,
    y = y0,
    out = [];

  out.push({ x: x0, y: y0 });

  for (var i = 0; i < s; i++) {
    x += xi;
    y += yi;
    out.push({ x: x, y: y });
  }

  return out;
}

const App = () => {
  const defaultGrid = useCallback(createGrid(), []);

  const [grid, setGrid] = useState([]);
  useEffect(() => {
    setGrid(defaultGrid);
  }, [defaultGrid]);

  const [highlights, setHighlights] = useState([]);
  const [hitNodes, setHitNodes] = useState([]);
  const [straightLine, setStraightLine] = useState([]);
  const [straightOpLine, setStraightOpLine] = useState([]);
  const [windowSize] = useWindow();

  const [direction, setDirection] = useState(null);
  const [last, setLast] = useState({});

  const [{ currentMousePosition, mousePositions }] = useMouse({
    onMouseDown() {
      setHitNodes([]);
      setHighlights([]);
      setStraightLine([]);
      setStraightOpLine([]);
      setGrid(defaultGrid);
      setDirection(null);
      setLast({});
    }
  });

  const userOffset = {
    x: 0,
    y: 0
  };

  const gridWidth = WIDTH * NODE_SIZE;
  const gridHeight = HEIGHT * NODE_SIZE;

  const gridLeftOffset = windowSize.width / 2 - gridWidth / 2 + userOffset.x;
  const gridTopOffset = windowSize.height / 2 - gridHeight / 2 + userOffset.y;

  const xWithOffset = x => x - gridLeftOffset;
  const yWithOffset = y => y - gridTopOffset;

  const xToCol = x => Math.floor(xWithOffset(x) / NODE_SIZE);
  const yToRow = y => Math.floor(yWithOffset(y) / NODE_SIZE);

  const rowToY = row => row * NODE_SIZE;
  const colToX = col => col * NODE_SIZE;

  useEffect(() => {
    if (direction) return;
    const first = highlights[0] || {};
    const next = highlights[1] || {};
    if (
      typeof first.col === "number" &&
      typeof first.row === "number" &&
      typeof next.row === "number" &&
      typeof next.col === "number"
    ) {
      if (first.col < next.col || first.col > next.col) {
        setDirection(1);
        setLast({
          ...next,
          col: first.col
        });
      } else if (first.row < next.row || first.row > next.row) {
        setDirection(0);
        setLast({
          ...next,
          row: first.row
        });
      }
    }
  }, [highlights, direction]);

  useEffect(() => {
    if (direction === 0) {
      setStraightLine(
        highlights.map(s => ({
          ...s,
          col: last.col
        }))
      );
      setStraightOpLine(
        highlights.map(s => ({
          ...s,
          row: last.row
        }))
      );
    } else if (direction === 1) {
      setStraightLine(
        highlights.map(s => ({
          ...s,
          row: last.row
        }))
      );
      setStraightOpLine(
        highlights.map(s => ({
          ...s,
          col: last.col
        }))
      );
    }
  }, [direction, last.col, last.row, highlights]);

  useEffect(() => {
    if (currentMousePosition.x && currentMousePosition.y) {
      setHitNodes(hitNodes => {
        return [
          ...hitNodes,
          {
            col: xToCol(currentMousePosition.x),
            row: yToRow(currentMousePosition.y)
          }
        ];
      });
    }
  }, [mousePositions, currentMousePosition]);

  useEffect(() => {
    const segments = mousePositions
      .map((v, i, a) => {
        const s = [v, a[i + 1] || v];
        return ddaAsPoint(s[0].x, s[0].y, s[1].x, s[1].y);
      })
      .reduce((acc, curr) => [...acc, ...curr], [])
      .map(v => ({
        col: xToCol(v.x),
        row: yToRow(v.y)
      }));

    const result = [];
    const map = new Map();

    segments.forEach(item => {
      if (!map.has(id(item))) {
        map.set(id(item), true);
        result.push(item);
      }
    });
    setHighlights(result);
  }, [mousePositions]);

  // useEffect(() => {
  //   console.log(straightLine);
  // }, [straightLine]);

  const style = useMemo(
    () => ({
      top: gridTopOffset,
      left: gridLeftOffset,
      position: "absolute"
    }),
    [gridTopOffset, gridLeftOffset]
  );

  return (
    <Stage style={style} width={gridWidth} height={gridHeight}>
      <Layer>
        {Object.values(grid).map((n, i) => (
          <Rect
            key={i}
            x={n.x}
            y={n.y}
            width={NODE_SIZE}
            height={NODE_SIZE}
            fill={n.fill}
            stroke="#EEEEF4"
          />
        ))}
      </Layer>
      <Layer>
        {highlights.map((n, i) => (
          <Rect
            key={i}
            x={colToX(n.col)}
            y={rowToY(n.row)}
            width={NODE_SIZE}
            height={NODE_SIZE}
            fill="#5579C6"
            stroke="#EEEEF4"
          />
        ))}
        {hitNodes.map((n, i) => (
          <Rect
            key={i}
            x={colToX(n.col)}
            y={rowToY(n.row)}
            width={NODE_SIZE}
            height={NODE_SIZE}
            fill="#c7c7db"
            stroke="#EEEEF4"
          />
        ))}
      </Layer>
      <Layer>
        <Path
          sceneFunc={(context, shape) => {
            context.beginPath();
            highlights.forEach(e => {
              context.lineTo(
                Math.floor(colToX(e.col) + NODE_SIZE / 2),
                Math.floor(rowToY(e.row) + NODE_SIZE / 2)
              );
              context.strokeStyle = "#000";
              context.lineWidth = 2;
            });
            context.stroke();
            context.closePath();
          }}
        />
        <Path
          sceneFunc={(context, shape) => {
            context.beginPath();
            mousePositions.forEach(e => {
              context.lineTo(xWithOffset(e.x), yWithOffset(e.y));
            });
            context.strokeStyle = "#ff4dff";
            context.lineWidth = 1;
            context.stroke();
            context.closePath();
          }}
        />
        <Path
          sceneFunc={(context, shape) => {
            context.beginPath();
            straightLine.forEach(e => {
              context.lineTo(
                Math.floor(colToX(e.col) + NODE_SIZE / 2),
                Math.floor(rowToY(e.row) + NODE_SIZE / 2)
              );
              context.strokeStyle = "red";
              context.lineWidth = 2;
            });
            context.stroke();
            context.closePath();
          }}
        />
        <Path
          sceneFunc={(context, shape) => {
            context.beginPath();
            straightOpLine.forEach(e => {
              context.lineTo(
                Math.floor(colToX(e.col) + NODE_SIZE / 2),
                Math.floor(rowToY(e.row) + NODE_SIZE / 2)
              );
              context.strokeStyle = "red";
              context.lineWidth = 2;
            });
            context.stroke();
            context.closePath();
          }}
        />
      </Layer>
    </Stage>
  );
};

render(<App />, document.getElementById("root"));
