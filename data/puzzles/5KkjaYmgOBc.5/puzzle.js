// Title: February 26, 2022: Box Battle
// Author: clover!
// Video: https://www.youtube.com/watch?v=5KkjaYmgOBc
// Source: https://tinyurl.com/4aeyfhan

// Normal sudoku rules apply.
//
// At each border between two orthogonally adjacent 3x3 boxes there are three
// pairs of cells straddling it (one row-pair per row of a vertical border,
// one column-pair per column of a horizontal border). The rules give an
// inequality sign per border: the greater box has the bigger digit in at
// least two of the three pairs (not necessarily all three). Every
// straddling pair shares a row or a column, so the built-in row/column
// all-different rule already rules out a tie within any pair.
//
// Sign direction: an unrotated glyph reads directly (`>` = left bigger); a
// glyph rotated 90 degrees has its tip pointing at the smaller box.
// Resolving all twelve drawn signs gives:
//   Box1>Box2, Box2>Box3, Box4>Box5, Box5>Box6, Box7>Box8, Box8>Box9,
//   Box1>Box4, Box7>Box4, Box5>Box2, Box5>Box8, Box3>Box6, Box6>Box9.

const givens = [
  ['R1C3', 1], ['R1C7', 4],
  ['R2C4', 8], ['R2C6', 2],
  ['R3C1', 5], ['R3C3', 2], ['R3C7', 9], ['R3C9', 7],
  ['R4C4', 9], ['R4C6', 3],
  ['R5C3', 3], ['R5C7', 6],
  ['R6C4', 7], ['R6C6', 4],
  ['R7C1', 2], ['R7C3', 4], ['R7C7', 7], ['R7C9', 6],
  ['R8C4', 6], ['R8C6', 1],
  ['R9C3', 5], ['R9C7', 8],
].map(([cell, value]) => new Given(cell, value));

// "At least 2 of 3 pairs favour the bigger side" == at least one of the
// three ways to pick 2-of-3 pairs both favour it (true for 2 or for all 3).
function regionBeats(biggerCells, smallerCells) {
  const gt = biggerCells.map((b, i) => new GreaterThan(b, smallerCells[i]));
  return new Or([
    new And([gt[0], gt[1]]),
    new And([gt[0], gt[2]]),
    new And([gt[1], gt[2]]),
  ]);
}

const borders = [
  // Vertical borders (unrotated glyph, all drawn '>'): left box bigger.
  [['R1C3', 'R2C3', 'R3C3'], ['R1C4', 'R2C4', 'R3C4']], // Box1 > Box2
  [['R1C6', 'R2C6', 'R3C6'], ['R1C7', 'R2C7', 'R3C7']], // Box2 > Box3
  [['R4C3', 'R5C3', 'R6C3'], ['R4C4', 'R5C4', 'R6C4']], // Box4 > Box5
  [['R4C6', 'R5C6', 'R6C6'], ['R4C7', 'R5C7', 'R6C7']], // Box5 > Box6
  [['R7C3', 'R8C3', 'R9C3'], ['R7C4', 'R8C4', 'R9C4']], // Box7 > Box8
  [['R7C6', 'R8C6', 'R9C6'], ['R7C7', 'R8C7', 'R9C7']], // Box8 > Box9
  // Horizontal borders (angle 90 glyph): tip points at the smaller box.
  [['R3C1', 'R3C2', 'R3C3'], ['R4C1', 'R4C2', 'R4C3']], // Box1 > Box4 ('>' tip down)
  [['R7C1', 'R7C2', 'R7C3'], ['R6C1', 'R6C2', 'R6C3']], // Box7 > Box4 ('<' tip up)
  [['R4C4', 'R4C5', 'R4C6'], ['R3C4', 'R3C5', 'R3C6']], // Box5 > Box2 ('<' tip up)
  [['R6C4', 'R6C5', 'R6C6'], ['R7C4', 'R7C5', 'R7C6']], // Box5 > Box8 ('>' tip down)
  [['R3C7', 'R3C8', 'R3C9'], ['R4C7', 'R4C8', 'R4C9']], // Box3 > Box6 ('>' tip down)
  [['R6C7', 'R6C8', 'R6C9'], ['R7C7', 'R7C8', 'R7C9']], // Box6 > Box9 ('>' tip down)
];

return [
  new Shape('9x9'),
  ...givens,
  ...borders.map(([bigger, smaller]) => regionBeats(bigger, smaller)),
];
