import React, { useEffect, useState, useCallback, useMemo } from "react";
import { render } from "react-dom";
import { Stage, Layer, Rect, Path } from "react-konva";

import useMouse from "./effects/useMouse";
import useWindow from "./effects/useWindow";

import { segments } from "./data";
import { createGrid, getNeighbours, hasItemInItems, makeId } from "./grid";
import { uniqArray } from "./util";

import dda from "./dda";

import "./style.scss";

const NODE_SIZE = 30;
const WIDTH = 35;
const HEIGHT = 35;

const App = () => {
  const defaultGrid = useCallback(createGrid(WIDTH, HEIGHT, NODE_SIZE), []);

  const [grid, setGrid] = useState([]);
  useEffect(() => {
    setGrid(defaultGrid);
  }, [defaultGrid]);

  const [highlights, setHighlights] = useState([]);
  const [windowSize] = useWindow();

  const plusJoin = "#6049A9";
  const teeJoin = "#5370B8";
  const wall = "#5299C8";
  const corner = "#5BC2D9";
  const end = "#6CEBEA";

  const doTheNeighbourThing = items =>
    items.map((r, i) => {
      const n = getNeighbours(r).map(hasItemInItems(items));
      // # # #   0 1 2
      // # 0 #   3   4
      // # # #   5 6 7
      if (n[1] && n[3] && n[4] && n[6]) {
        // + center
        return {
          ...r,
          type: "plus",
          fill: plusJoin
        };
      }

      if (n[1] && n[6] && n[3]) {
        // left t
        return {
          ...r,
          type: "tee",
          fill: teeJoin
        };
      }
      if (n[1] && n[6] && n[4]) {
        // right t
        return {
          ...r,
          type: "tee",
          fill: teeJoin
        };
      }
      if (n[1] && n[4] && n[3]) {
        // up t
        return {
          ...r,
          type: "tee",
          fill: teeJoin
        };
      }
      if (n[4] && n[6] && n[3]) {
        // bottom t
        return {
          ...r,
          type: "tee",
          fill: teeJoin
        };
      }

      if (n[6] && n[4]) {
        // nw corner
        return {
          ...r,
          type: "corner",
          fill: corner
        };
      }
      if (n[3] && n[1]) {
        // se corner
        return {
          ...r,
          type: "corner",
          fill: corner
        };
      }
      if (n[1] && n[4]) {
        // sw corner
        return {
          ...r,
          type: "corner",
          fill: corner
        };
      }
      if (n[3] && n[6]) {
        // ne corner
        return {
          ...r,
          type: "corner",
          fill: corner
        };
      }

      if (n[3] && n[4]) {
        // horz
        return {
          ...r,
          type: "wall",
          fill: wall
        };
      }
      if (n[1] && n[6]) {
        // vert
        return {
          ...r,
          type: "wall",
          fill: wall
        };
      }

      return {
        ...r,
        type: "end",
        fill: end
      };
    });

  const [{ mousePositions }] = useMouse();

  const userOffset = {
    x: 0,
    y: 0
  };

  const gridWidth = WIDTH * NODE_SIZE;
  const gridHeight = HEIGHT * NODE_SIZE;

  const gridLeftOffset = useMemo(
    () => windowSize.width / 2 - gridWidth / 2 + userOffset.x,
    [gridWidth, windowSize, userOffset]
  );
  const gridTopOffset = useMemo(
    () => windowSize.height / 2 - gridHeight / 2 + userOffset.y,
    [gridHeight, windowSize, userOffset]
  );

  const xWithOffset = useCallback(x => x - gridLeftOffset, [gridLeftOffset]);
  const yWithOffset = useCallback(y => y - gridTopOffset, [gridTopOffset]);

  const xToCol = useCallback(x => Math.floor(xWithOffset(x) / NODE_SIZE), [
    xWithOffset
  ]);
  const yToRow = useCallback(y => Math.floor(yWithOffset(y) / NODE_SIZE), [
    yWithOffset
  ]);

  const rowToY = row => row * NODE_SIZE;
  const colToX = col => col * NODE_SIZE;

  const convertPointToItem = useCallback(
    p => ({
      col: xToCol(p.x),
      row: yToRow(p.y)
    }),
    [xToCol, yToRow]
  );

  useEffect(() => {
    const draw = mousePositions
      .reduce((acc, v, i, a) => {
        const s = [v, a[i + 1] || v];
        return [...acc, ...dda(s[0].x, s[0].y, s[1].x, s[1].y)];
      }, [])
      .map(convertPointToItem);

    // const items = [...uniqArray(draw, makeId), ...segments];
    const items = uniqArray(draw, makeId);

    const result = uniqArray(items, makeId);
    setHighlights(doTheNeighbourThing(result));
  }, [mousePositions, convertPointToItem]);

  const style = useMemo(
    () => ({
      top: gridTopOffset,
      left: gridLeftOffset,
      position: "absolute"
    }),
    [gridTopOffset, gridLeftOffset]
  );

  return (
    <div className="stage">
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
              fill={n.fill}
              stroke="#EEEEF4"
            />
          ))}
        </Layer>
        <Layer>
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
        </Layer>
      </Stage>
    </div>
  );
};

render(<App />, document.getElementById("root"));
