// Title: Submarine Sandwiches
// Author: Nordy
// Video: https://www.youtube.com/watch?v=gjs_xlF5Aho
// Source: https://app.crackingthecryptic.com/sudoku/m3BfHFrP8D

// Normal sudoku rules apply on the 9x9 grid (rows, columns and boxes are
// all-different). Ten cells outside the 9x9 grid each hold an unknown digit
// 1-9 (outer digits may repeat). Each outer digit equals the sum of the
// digits sandwiched between the 1 and the 9 in its own row or column, so it
// is a sandwich-sum clue whose own printed value is unknown and has to be
// derived along with the grid; the source draws no numeric givens anywhere.
// Adjacent digits along a green line -- including where a line runs through
// an outer cell -- must differ by at least 5.
//
// The ten outer cells and which row/column each belongs to are read from the
// drawn geometry, not stated as text: the source's 11x11 border has 30 cells
// shaded light-grey (decoration) and exactly 10 left unshaded; those 10 are
// precisely the cells the 5 drawn green lines terminate at, which
// corroborates the reading independent of the shading.

const geometry = cellGeometry('9x9');
const rowCells = (r) => Array.from({ length: 9 }, (_, i) => makeCellId(r, i + 1));
const colCells = (c) => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, c));

const outerSpec = [
  // [key, orientation, index, provenance]
  ['row1', 'R', 1, 'unshaded border cell R2C1 (0-idx), green line 1 endpoint'],
  ['row2', 'R', 2, 'unshaded border cell R3C1 (0-idx), green line 1 endpoint'],
  ['row6', 'R', 6, 'unshaded border cell R7C11 (0-idx), green line 3 endpoint'],
  ['row7', 'R', 7, 'unshaded border cell R8C11 (0-idx), green line 3 endpoint'],
  ['row8', 'R', 8, 'unshaded border cell R9C11 (0-idx), green line 3 endpoint'],
  ['col2', 'C', 2, 'unshaded border cell R1C3 (0-idx), green line 2 endpoint'],
  ['col3', 'C', 3, 'unshaded border cell R1C4 (0-idx), green line 2 endpoint'],
  ['col5', 'C', 5, 'unshaded border cell R1C6 (0-idx), green line 2 waypoint'],
  ['col9', 'C', 9, 'unshaded border cell R1C10 (0-idx), green line 2 endpoint'],
  ['col4', 'C', 4, 'unshaded border cell R11C5 (0-idx), green line 5 endpoint'],
];

const outer = new Var('O', 'Outer sandwich digit', outerSpec.length);
const outerCell = new Map(
  outerSpec.map(([key], i) => [key, outer.cell(i + 1)]));

// An outer cell's own digit must equal the sandwich total of its row/column.
// Sandwich takes a literal total, not a cell reference, so this is expressed
// as one Or branch per candidate digit v: pin the outer cell to v while
// asserting the row/column's Sandwich total is also v.
function sandwichEqualsOuterDigit([key, orientation, index]) {
  const cell = outerCell.get(key);
  const cells = orientation === 'R' ? rowCells(index) : colCells(index);
  const branches = [];
  for (let v = 1; v <= 9; v++) {
    branches.push(new And([
      new Given(cell, v),
      Sandwich.fromCells(v, cells, geometry),
    ]));
  }
  return new Or(branches);
}

// Green line cell paths, transcribed from the source's 5 drawn green lines,
// row-1/col-1 mapped from its 11x11 canvas onto this 9x9 sudoku grid; border
// endpoints use the matching outer Var cell instead.
const lineA = [ // green line 1: R2C1-R3C1-R3C2-R3C3-R2C3 (0-idx source cells)
  outerCell.get('row1'), outerCell.get('row2'),
  'R2C1', 'R2C2', 'R1C2',
];
const lineB = [ // green line 2: R1C3-R1C4-R2C4-R2C5-R2C6-R1C6-R2C6-R2C7-R2C8-R2C9-R2C10-R1C10
  outerCell.get('col2'), outerCell.get('col3'),
  'R1C3', 'R1C4', 'R1C5',
  outerCell.get('col5'),
  'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9',
  outerCell.get('col9'),
];
const lineC = [ // green line 3: R5C10-R6C10-R7C11-R8C11-R9C11
  'R4C9', 'R5C9',
  outerCell.get('row6'), outerCell.get('row7'), outerCell.get('row8'),
];
const lineD = [ // green line 4: R7C7-R8C7-R8C6-R8C5-R8C4-R8C3 (entirely interior)
  'R6C6', 'R7C6', 'R7C5', 'R7C4', 'R7C3', 'R7C2',
];
const lineE = [ // green line 5: R10C5-R11C5
  'R9C4', outerCell.get('col4'),
];

return [
  new Shape('9x9'),
  outer,
  ...outerSpec.map(sandwichEqualsOuterDigit),
  new Whisper(5, ...lineA),
  new Whisper(5, ...lineB),
  new Whisper(5, ...lineC),
  new Whisper(5, ...lineD),
  new Whisper(5, ...lineE),
];
