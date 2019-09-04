import React, { useEffect, useState, useCallback } from "react";
import { render } from "react-dom";
import { Stage, Layer, Rect, Path } from "react-konva";

import useMouse from "./effects/useMouse";
import useKeyboard from "./effects/useKeyboard";

import "./style.scss";

const NODE_SIZE = 30;
const WIDTH = Math.ceil(window.innerWidth / NODE_SIZE);
const HEIGHT = Math.ceil(window.innerHeight / NODE_SIZE);
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

function digitaldifferentialanalyzer(x0, y0, x1, y1) {
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

const reduceIfNotPrev = (acc, curr, index) => {
  if (index === 0) {
    return [curr];
  }
  const p = acc[acc.length - 1] || {};
  if (p.col === curr.col && p.row === curr.row) {
    return acc;
  }
  return [...acc, curr];
};

const App = () => {
  const defaultGrid = useCallback(createGrid(), []);

  const [grid, setGrid] = useState([]);
  useEffect(() => {
    setGrid(defaultGrid);
  }, [defaultGrid]);

  const [highlights, setHighlights] = useState([]);
  const [hitNodes, setHitNodes] = useState([]);

  const [{ currentMousePosition, mousePositions }] = useMouse({
    onMouseDown() {
      setHitNodes([]);
      setHighlights([]);
      setGrid(defaultGrid);
    }
  });

  useEffect(() => {
    const hit = mousePositions
      .map(e => ({
        col: Math.floor(e.x / NODE_SIZE),
        row: Math.floor(e.y / NODE_SIZE)
      }))
      .reduce(reduceIfNotPrev, []);

    setHitNodes(hit);
  }, [mousePositions]);

  useEffect(() => {
    const sm = mousePositions
      .map(e => ({
        col: Math.floor(e.x / NODE_SIZE),
        row: Math.floor(e.y / NODE_SIZE)
      }))
      .reduce(reduceIfNotPrev, []);

    const segments = mousePositions
      .map((v, i, a) => {
        const s = [v, a[i + 1] || v];
        return digitaldifferentialanalyzer(s[0].x, s[0].y, s[1].x, s[1].y);
      })
      .reduce((acc, curr) => [...acc, ...curr], [])
      .map(v => ({
        col: Math.floor(v.x / NODE_SIZE),
        row: Math.floor(v.y / NODE_SIZE)
      }));

    const result = [];
    const map = new Map();

    for (const item of segments) {
      if (!map.has(id(item))) {
        map.set(id(item), true);
        result.push(item);
      }
    }
    // setHighlights(result);
  }, [mousePositions]);

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
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
            x={n.col * NODE_SIZE}
            y={n.row * NODE_SIZE}
            width={NODE_SIZE}
            height={NODE_SIZE}
            fill="#ff00bf"
            stroke="#EEEEF4"
          />
        ))}
        {hitNodes.map((n, i) => (
          <Rect
            key={i}
            x={n.col * NODE_SIZE}
            y={n.row * NODE_SIZE}
            width={NODE_SIZE}
            height={NODE_SIZE}
            fill="#7700b3"
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
                Math.floor(e.col * NODE_SIZE + NODE_SIZE / 2),
                Math.floor(e.row * NODE_SIZE + NODE_SIZE / 2)
              );
              context.strokeStyle = "#000";
              context.lineWidth = 2;
            });
            context.stroke();
            context.closePath();
          }}
        />
      </Layer>
      <Layer>
        <Path
          sceneFunc={(context, shape) => {
            context.beginPath();
            mousePositions.forEach(e => {
              context.lineTo(Math.floor(e.x), Math.floor(e.y));
              context.strokeStyle = "#51efe2";
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
