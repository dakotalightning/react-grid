import * as R from "ramda";

const directions = [
  [-1, -1],
  [0, -1],
  [+1, -1],
  [-1, 0],
  // [col: col, row: row ],
  [+1, 0],
  [-1, +1],
  [0, +1],
  [+1, +1]
];

export const makeId = ({ col, row }) => `col${col}row${row}`;

export const getNeighbours = ({ col, row }) =>
  directions.map((d) => ({
    col: col + d[0],
    row: row + d[1]
  }));

export const createGrid = (width = 10, height = 10, nodeSize = 13) =>
  R.flatten(
    R.range(0, width).map((_, col) =>
      R.range(0, height).map((_, row) => ({
        x: col * nodeSize,
        y: row * nodeSize,
        fill: "#fff"
      }))
    )
  );

export const getDirectionName = (index) => {
  switch (index) {
    case 0:
      return "nw";
    case 1:
      return "n";
    case 2:
      return "ne";
    case 3:
      return "w";
    case 4:
      return "e";
    case 5:
      return "sw";
    case 6:
      return "w";
    case 7:
      return "se";
    default:
      return;
  }
};

export const hasItemInItems = (items) => (i) => {
  return items.filter((r) => r.col === i.col && r.row === i.row).length > 0;
};

export const getItemFromItems = (items) => (i) =>
  items.filter((r) => r.col === i.col && r.row === i.row)[0];
