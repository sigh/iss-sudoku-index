// Title: Cloister
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=r-T6gROn-tQ
// Source: https://sudokupad.app/xd3kuyn90z

// Normal 9x9 sudoku rules apply; no given digits.
// Chess sums: a digit on a chess-piece cell equals the sum of the digits in
// all cells that piece could move to in one move. Bishops and the king only
// move within their own 3x3 box; knights may jump into other boxes.
// Dynamic fog is presentation-only reveal behavior and is not encoded.

const pieces = [
  { type: "bishop", cell: "R7C3" },
  { type: "bishop", cell: "R7C7" },
  { type: "knight", cell: "R9C1" },
  { type: "knight", cell: "R9C9" },
  { type: "bishop", cell: "R7C5" },
  { type: "bishop", cell: "R5C7" },
  { type: "bishop", cell: "R3C7" },
  { type: "knight", cell: "R1C9" },
  { type: "knight", cell: "R3C2" },
  { type: "bishop", cell: "R4C5" },
  { type: "king", cell: "R4C1" },
];

const inGrid = ({ row, col }) => row >= 1 && row <= 9 && col >= 1 && col <= 9;
const sameBox = (a, b) =>
  Math.floor((a.row - 1) / 3) === Math.floor((b.row - 1) / 3) &&
  Math.floor((a.col - 1) / 3) === Math.floor((b.col - 1) / 3);
const step = ({ row, col }, [dr, dc]) => ({ row: row + dr, col: col + dc });
const cellId = ({ row, col }) => makeCellId(row, col);

function destinations(type, cell) {
  const start = parseCellId(cell);

  if (type === "knight") {
    return [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ]
      .map(delta => step(start, delta))
      .filter(inGrid)
      .map(cellId);
  }

  if (type === "king") {
    const cells = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) {
          continue;
        }
        const next = step(start, [dr, dc]);
        if (inGrid(next) && sameBox(start, next)) {
          cells.push(cellId(next));
        }
      }
    }
    return cells;
  }

  const cells = [];
  for (const delta of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
    let next = step(start, delta);
    while (inGrid(next) && sameBox(start, next)) {
      cells.push(cellId(next));
      next = step(next, delta);
    }
  }
  return cells;
}

function chessSum({ type, cell }) {
  const targets = destinations(type, cell);
  return new EqualSum([cell], targets);
}

return [
  new Shape("9x9"),
  ...pieces.map(chessSum),
];
