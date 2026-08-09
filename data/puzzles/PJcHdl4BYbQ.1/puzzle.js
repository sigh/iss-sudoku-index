// Title: 8/25/22: Yippee Ki Yay, Y'all
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=PJcHdl4BYbQ
// Source: https://tinyurl.com/2p94fndu

// Normal sudoku rules apply (default row/column/box AllDifferent).
// Each of the 5 cages below is a killer cage with no printed total: digits
// inside a cage cannot repeat, and read left-to-right along a cage row and
// top-to-bottom along a cage column they must strictly increase.
//
// No-repeat is AllDifferent over the cage's cells. The increase rule is only
// ever stated between grid-adjacent cage cells (row-neighbours and
// column-neighbours), so it is encoded with one GreaterThan per cage: the
// cage's own cells, reordered so that for any two grid-adjacent cells the one
// further down-and-right (whichever is greater under (row+col)) comes first
// in the list. GreaterThan enforces "a cell is greater than any later
// adjacent cell" over its argument list, so with this ordering every
// horizontal edge yields right > left and every vertical edge yields
// bottom > top -- i.e. strictly increasing left-to-right and top-to-bottom.
// Diagonal cage neighbours (e.g. the two cells with the same row+col) are not
// grid-adjacent, so GreaterThan does not relate them; AllDifferent still
// forbids them repeating.

const cages = [
  ['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6'],
  ['R1C6', 'R1C7', 'R1C8', 'R2C6', 'R2C7', 'R2C8', 'R3C6', 'R3C7', 'R3C8'],
  ['R6C7', 'R6C8', 'R6C9', 'R7C7', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R8C9'],
  ['R7C2', 'R7C3', 'R7C4', 'R8C2', 'R8C3', 'R8C4', 'R9C2', 'R9C3', 'R9C4'],
  ['R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3', 'R4C1', 'R4C2', 'R4C3'],
];

// Order each cage's cells by (row + col) descending so GreaterThan's
// "earlier > later adjacent" semantics produce the increasing rule (see
// comment above).
const orderForIncrease = (cells) =>
  [...cells].sort((a, b) => {
    const pa = parseCellId(a);
    const pb = parseCellId(b);
    return (pb.row + pb.col) - (pa.row + pa.col);
  });

// Cage #0 (R4C4..R6C6) is exactly the center box, so its own AllDifferent
// would duplicate the engine's default box constraint; every other cage is
// offset from the box grid and needs its own AllDifferent.
const cageConstraints = cages.flatMap((cells, i) => [
  ...(i === 0 ? [] : [new AllDifferent(...cells)]),
  new GreaterThan(...orderForIncrease(cells)),
]);

return [
  new Shape('9x9'),

  new Given('R1C4', 5),
  new Given('R2C4', 8),
  new Given('R3C5', 6),
  new Given('R4C8', 3),
  new Given('R4C9', 5),
  new Given('R5C3', 1),
  new Given('R5C7', 9),
  new Given('R6C1', 5),
  new Given('R6C2', 7),
  new Given('R7C5', 4),
  new Given('R8C6', 2),
  new Given('R9C6', 5),

  ...cageConstraints,
];
