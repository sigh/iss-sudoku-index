// Title: Clockfaces Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=ceho1f3FBwA
// Source: https://tinyurl.com/yckaeuac

// Normal Sudoku rules apply. Four digits around a white circle are placed in
// increasing order starting from one of the four cells and going clockwise.
// Four digits around a black circle are placed in increasing order starting
// from one of the four cells and going anticlockwise.
//
// Each circle sits at the shared corner of a 2x2 block, so its four edges
// (TL-TR, TR-BR, BR-BL, BL-TL) are all orthogonally adjacent, but which cell
// is the "starting" one is not given. Encode each circle as a disjunction
// (Or) over its 4 possible starting cells: each branch is a Thermo over the
// block's cells in clockwise (white) or anticlockwise (black) reading order
// from that start, i.e. strictly increasing along that reading.

// Circle top-left cell and colour, transcribed from the drawn circle
// geometry (white vs. black fill); each covers the 2x2 block with that
// cell at its top-left corner.
const circles = [
  { tl: 'R1C1', white: true },
  { tl: 'R2C2', white: true },
  { tl: 'R1C2', white: false },
  { tl: 'R2C1', white: false },
  { tl: 'R2C7', white: false },
  { tl: 'R1C8', white: false },
  { tl: 'R1C7', white: true },
  { tl: 'R2C8', white: true },
  { tl: 'R7C7', white: true },
  { tl: 'R8C8', white: true },
  { tl: 'R7C1', white: true },
  { tl: 'R8C2', white: true },
  { tl: 'R7C8', white: false },
  { tl: 'R8C7', white: false },
  { tl: 'R7C2', white: false },
  { tl: 'R8C1', white: false },
  { tl: 'R3C4', white: false },
  { tl: 'R6C5', white: false },
  { tl: 'R5C8', white: false },
  { tl: 'R4C1', white: true },
];

const clockConstraints = circles.map(({ tl, white }) => {
  const { row, col } = parseCellId(tl);
  const TL = makeCellId(row, col);
  const TR = makeCellId(row, col + 1);
  const BR = makeCellId(row + 1, col + 1);
  const BL = makeCellId(row + 1, col);
  // Clockwise reading order for white circles; anticlockwise for black.
  const order = white ? [TL, TR, BR, BL] : [TL, BL, BR, TR];
  const rotations = [0, 1, 2, 3].map(
    i => [...order.slice(i), ...order.slice(0, i)]);
  return new Or(rotations.map(seq => new Thermo(...seq)));
});

return [
  new Shape('9x9'),

  new Given('R1C1', 3), new Given('R1C8', 8), new Given('R1C9', 6),
  new Given('R2C1', 7), new Given('R2C3', 6),
  new Given('R3C3', 1), new Given('R3C7', 3), new Given('R3C8', 9),
  new Given('R4C4', 1), new Given('R4C5', 3), new Given('R4C6', 5),
  new Given('R6C4', 9), new Given('R6C5', 4), new Given('R6C6', 2),
  new Given('R7C1', 2), new Given('R7C2', 6), new Given('R7C7', 1),
  new Given('R8C7', 5), new Given('R8C9', 7),
  new Given('R9C2', 7), new Given('R9C3', 5), new Given('R9C9', 8),

  ...clockConstraints,
];
