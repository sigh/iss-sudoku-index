// Title: Revolver
// Author: Myxo
// Video: https://www.youtube.com/watch?v=YIj_OjeNiu0
// Source: https://app.crackingthecryptic.com/sudoku/QQdj4f9nrP

// Normal sudoku rules apply; the nine listed regions are the usual 3x3 boxes,
// so no extra region constraint is needed. Every drawn cage sums to its
// corner total with no repeated digit (Cage). Every digit except the one at
// the centre (R5C5) has an unknown "partner digit" that always sits in the
// cell 180-degree rotationally opposite its own; which digits pair up is for
// the solver to deduce (the rules' own worked example treats the relation as
// a mutual pair: "if 1 and 2 turned out to be a rotational pair").
//
// `partner` is a 9-cell Var, one slot per digit 1-9, holding that digit's
// partner digit -- a digit maps to itself exactly when it has "no partner".
// For every grid cell (including R5C5, its own 180-degree opposite),
// `pairedWith(cell, opposite)` requires opposite's value to equal
// partner[cell's value], selecting the partner slot via cell's actual digit.
const partner = new Var('P', "digit's rotational partner digit", 9);

const pairedWith = (cell, opposite) => new Or(
  Array.from({ length: 9 }, (_, i) => i + 1).map(d => new And([
    new Given(cell, d),
    new SameValues(2, opposite, partner.cell(d)),
  ]))
);

const allCells = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    allCells.push(makeCellId(r, c));
  }
}
const oppositeOf = (cellId) => {
  const { row, col } = parseCellId(cellId);
  return makeCellId(10 - row, 10 - col);
};

// Cage cells, transcribed from the drawn cage boundaries (`cages` in the
// source payload); each entry is [total, ...cells].
const cages = [
  [10, 'R4C1', 'R5C1', 'R6C1'],
  [10, 'R1C4', 'R1C5', 'R1C6'],
  [22, 'R4C9', 'R5C9', 'R6C9'],
  [8, 'R9C4', 'R9C5', 'R9C6'],
  [11, 'R5C4', 'R6C4', 'R6C5'],
  [12, 'R4C5', 'R4C6', 'R5C6'],
  [22, 'R1C2', 'R1C3', 'R2C3'],
  [22, 'R8C7', 'R9C7', 'R9C8'],
  [36, 'R5C8', 'R5C7', 'R6C7', 'R7C7', 'R7C6', 'R7C5', 'R8C5'],
  [18, 'R6C2', 'R7C2', 'R8C2', 'R8C3', 'R8C4'],
  [10, 'R4C3', 'R3C3', 'R3C4'],
  [10, 'R2C7', 'R2C8', 'R3C8'],
];

return [
  new Shape('9x9'),

  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),

  partner,
  ...allCells.map(cell => pairedWith(cell, oppositeOf(cell))),
];
