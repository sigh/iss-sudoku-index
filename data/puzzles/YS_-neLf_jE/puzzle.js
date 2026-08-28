// Title: Cyclic Killer Columns
// Author: Unknown
// Video: https://www.youtube.com/watch?v=YS_-neLf_jE
// Source: https://cracking-the-cryptic.web.app/sudoku/h4mgpnQmJj

// Normal sudoku (default 9x9 rows/cols/boxes; the drawn regions match the
// default boxes exactly). Eight killer cages (distinct digits, sum to the
// printed total). Columns 1, 5 and 9 are the puzzle's only shaded (grey)
// cells: per the rule text, reading each grey column top-to-bottom as a
// 9-digit string and allowing it to wrap from row 9 back to row 1, all
// three columns hold the same cyclic string, differing only in which row
// each one starts at. Encoded as: for each pair of grey columns, a
// disjunction over the 9 possible relative rotations, each rotation an
// AND of 9 per-row SameValues(2, ...) cell equalities. The rotation
// between the third pair (column 5 vs column 9) is forced automatically by
// the other two (rotation composition), so it needs no separate clause.
const graph = cellGraph('9x9');
const col1 = graph.column('R1C1');
const col5 = graph.column('R1C5');
const col9 = graph.column('R1C9');

const cyclicMatch = (colA, colB) => {
  const rotations = [];
  for (let k = 0; k < 9; k++) {
    const equalities = [];
    for (let i = 0; i < 9; i++) {
      equalities.push(new SameValues(2, colA[i], colB[(i + k) % 9]));
    }
    rotations.push(new And(equalities));
  }
  return new Or(rotations);
};

return [
  new Shape('9x9'),

  new Given('R1C6', 3),
  new Given('R3C4', 2),
  new Given('R3C6', 9),
  new Given('R4C7', 7),
  new Given('R5C2', 4),
  new Given('R5C8', 8),
  new Given('R6C3', 5),
  new Given('R7C4', 6),
  new Given('R7C6', 1),
  new Given('R9C4', 3),

  // Killer cages: one per drawn dashed cage, sum shown top-left.
  new Cage(42, 'R1C1', 'R1C2', 'R1C3', 'R2C1', 'R3C1', 'R3C2', 'R3C3'),
  new Cage(29, 'R7C1', 'R7C2', 'R7C3', 'R8C1', 'R9C1', 'R9C2', 'R9C3'),
  new Cage(35, 'R1C7', 'R1C8', 'R1C9', 'R2C7', 'R3C7', 'R3C8', 'R3C9'),
  new Cage(34, 'R7C7', 'R7C8', 'R7C9', 'R8C7', 'R9C7', 'R9C8', 'R9C9'),
  new Cage(23, 'R4C8', 'R4C9', 'R5C9', 'R6C8', 'R6C9'),
  new Cage(25, 'R4C1', 'R4C2', 'R5C1', 'R6C1', 'R6C2'),
  new Cage(21, 'R2C4', 'R2C5', 'R2C6', 'R3C5'),
  new Cage(19, 'R7C5', 'R8C4', 'R8C5', 'R8C6'),

  cyclicMatch(col1, col5),
  cyclicMatch(col1, col9),
];
