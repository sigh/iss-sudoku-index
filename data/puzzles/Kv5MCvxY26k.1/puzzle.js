// Title: August 16, 2021: Slot Machine
// Author: clover!
// Video: https://www.youtube.com/watch?v=Kv5MCvxY26k
// Source: https://tinyurl.com/n65xuz5d

// Normal sudoku rules apply (default row/column/box groups).
// The "slot machine": columns 2, 5 and 8, each read top-to-bottom and
// wrapped cyclically, all show the same 9-digit sequence, only possibly
// started at a different point (cyclicMatch below). The shaded #D0D0FF
// stripe cells carry no independent all-different content -- each stripe
// is already a full grid column.

const graph = cellGraph('9x9');

const col2 = graph.column(2);
const col5 = graph.column(5);
const col8 = graph.column(8);

// colA read top-to-bottom must equal colB read top-to-bottom for SOME
// cyclic rotation k (colA[r] == colB[(r+k) mod 9] for every row r). Built as
// Or over the 9 candidate rotations, each an And of 9 cell-equality
// constraints (one per row); SameValues(2, a, b) forces two single cells
// equal (the catalog's "clone cells" idiom). Matching col2 against both col5
// and col8 is enough: rotation is transitive (composing two rotations of the
// same base column yields a rotation between the other two), so col5 and
// col8 are automatically related without a third Or.
const cyclicMatch = (colA, colB) => new Or(
  Array.from({ length: 9 }, (_, k) => new And(
    colA.map((cell, r) => new SameValues(2, cell, colB[(r + k) % 9]))
  ))
);

const slotMachine = [
  cyclicMatch(col2, col5),
  cyclicMatch(col2, col8),
];

// Givens, transcribed from the source's printed grid.
const givens = [
  new Given('R1C1', 2), new Given('R1C3', 3), new Given('R1C6', 1),
  new Given('R2C4', 2), new Given('R2C8', 8),
  new Given('R3C1', 1),
  new Given('R4C2', 4), new Given('R4C6', 6), new Given('R4C9', 8),
  new Given('R5C3', 5), new Given('R5C7', 6),
  new Given('R6C1', 6), new Given('R6C4', 8), new Given('R6C8', 4),
  new Given('R7C9', 7),
  new Given('R8C2', 9), new Given('R8C6', 3),
  new Given('R9C4', 7), new Given('R9C7', 5), new Given('R9C9', 6),
];

return [
  new Shape('9x9'),
  ...givens,
  ...slotMachine,
];
