// Title: What's in a Name
// Author: Xi
// Video: https://www.youtube.com/watch?v=NEHtRZBNU28
// Source: https://sudokupad.app/op6i0frj9g

// Rules:
// - Normal sudoku.
// - Each digit corresponds to a letter; different digits may share a letter,
//   but different letters always correspond to different digits. So no digit
//   may appear both in a cell marked with one letter and in a cell marked
//   with a different letter.
// - Cages: digits do not repeat, and the digits that are not ignored sum to
//   the total. Some digits are ignored; a digit ignored in one cage is ignored
//   in all of them (one global ignored set).
// - Thermometers increase from the bulb.
// - OMITTED: "This puzzle contains as many 3s in corners as possible." A
//   maximisation over the whole solution set; not encoded.

// Letter marks, from the drawn cell text.
const LETTERS = {
  A: ['R4C1', 'R4C2', 'R4C3', 'R5C7', 'R5C9', 'R2C1', 'R2C8', 'R2C9'],
  H: ['R6C3', 'R5C8'],
  I: ['R6C1', 'R2C5'],
  R: ['R6C2', 'R8C1', 'R1C7'],
  T: ['R8C3', 'R4C6', 'R2C7'],
  K: ['R9C3', 'R6C9', 'R3C7'],
  N: ['R8C4', 'R2C6', 'R3C2'],
};

// Cages [total, cells], from the drawn killer cages.
const CAGES = [
  [17, ['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6']],
  [7, ['R8C8']],
  [4, ['R1C4', 'R1C5']],
  [2, ['R7C1', 'R7C2', 'R7C3', 'R8C1', 'R8C2']],
  [6, ['R5C7', 'R5C8', 'R5C9']],
  [11, ['R6C1', 'R6C2', 'R6C3']],
  [6, ['R2C1', 'R2C2', 'R2C3']],
  [1, ['R8C4', 'R8C5', 'R8C6']],
  [2, ['R4C1', 'R4C2', 'R4C3']],
];

// Thermometers, bulb first, from the drawn thermometers.
const THERMOS = [
  ['R3C4', 'R3C5', 'R3C6', 'R2C6'],
  ['R9C5', 'R9C6', 'R9C7', 'R9C8'],
  ['R1C2', 'R1C3', 'R2C3', 'R3C3'],
];

// The value range includes 0 so the counted-value Vars can hold "ignored".
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);

// VC<d> is digit d's counted value: d if counted in cage totals, 0 if ignored.
const counted = new Var('C', 'counted value per digit', 9);
const countedCells = counted.cells();

// One effective-value Var per cage cell: the counted value of its digit.
const cageCells = CAGES.flatMap(([, cells]) => cells);
const effective = new Var('E', 'effective cage value', cageCells.length);
const effectiveOf = new Map(cageCells.map((c, i) => [c, effective.cells()[i]]));

const letterNames = Object.keys(LETTERS);
const crossLetterPairs = letterNames.flatMap((x, i) =>
  letterNames.slice(i + 1).flatMap(y =>
    LETTERS[x].flatMap(a => LETTERS[y].map(b => [a, b]))));

return [
  shape,
  // Grid cells hold 1-9.
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  counted,
  effective,

  // Different letters -> different digits.
  ...crossLetterPairs.map(([a, b]) => new AllDifferent(a, b)),

  // Ignored-digit set.
  ...countedCells.map((c, i) => new Given(c, 0, i + 1)),
  new ContainAtLeast('0', ...countedCells),  // "some digits must be ignored"

  // Each cage cell's effective value is VC[its digit] (ValueIndexing:
  // valueCell = indexedCells[controlCell - 1]).
  ...cageCells.map(c => new ValueIndexing(effectiveOf.get(c), c, ...countedCells)),

  // Cage totals over effective values. The no-repeat clause needs no extra
  // constraint: every cage lies inside one row or one box.
  ...CAGES.map(([total, cells]) =>
    new Sum(total, ...cells.map(c => effectiveOf.get(c)))),

  ...THERMOS.map(cells => new Thermo(...cells)),
];
