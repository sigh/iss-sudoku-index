// Title: Colour Wheel
// Author: The Book Wyrm
// Video: https://www.youtube.com/watch?v=7BiyQxa-BiQ
// Source: https://sudokupad.app/bBR8Rj8Ng7

// Normal sudoku rules apply; the nine listed regions are the usual 3x3 boxes.
// Digits in a cage do not repeat. Each cage is coloured by the last digit of
// the sum of its digits, so two cages share a colour exactly when their sums
// share a units digit. A number in a cage's top left corner is NOT that cage's
// own sum: it is the sum of all orthogonally adjacent cages whose colour
// differs from this cage's colour. Every digit except the one in the central
// cell (R5C5) has a 'partner digit' always placed 180 degrees rotationally
// symmetrically to it about the grid centre; which digits are paired up is for
// the solver to deduce (the rules' own worked example treats the relation as a
// mutual pair: "if the digits 1 and 2 turned out to be a rotational pair").
//
// Nothing is omitted.

// The value range is widened to 0-9 so that a cage's units digit, which may be
// 0, is representable in a Var; the playable grid cells are restricted back to
// 1-9 below.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const gridDigits = graph.makeReplicate(
  new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// Cage corner numbers and cells, transcribed from the drawn cages in the
// source; a null corner number is a cage drawn without a number.
const cages = [
  [10, 'R5C5'],
  [31, 'R4C5', 'R4C6'],
  [22, 'R6C4', 'R6C5'],
  [null, 'R4C4', 'R5C4'],
  [null, 'R5C6', 'R6C6'],
  [null, 'R3C6', 'R3C7', 'R4C7'],
  [null, 'R3C4', 'R3C5'],
  [null, 'R6C3', 'R7C3', 'R7C4'],
  [null, 'R7C5', 'R7C6'],
  [20, 'R8C4', 'R8C5', 'R8C6', 'R9C4'],
  [25, 'R1C5', 'R1C6', 'R2C5', 'R2C6'],
  [null, 'R1C7', 'R1C8', 'R2C7'],
  [null, 'R8C3', 'R9C2', 'R9C3'],
  [null, 'R1C1', 'R2C1', 'R2C2'],
  [22, 'R3C2', 'R3C3', 'R4C3'],
  [null, 'R5C2', 'R5C3', 'R6C2'],
  [null, 'R4C8', 'R5C7', 'R5C8'],
  [32, 'R6C7', 'R7C7', 'R7C8'],
  [null, 'R8C8', 'R8C9', 'R9C9'],
];
const cellsOf = (i) => cages[i].slice(1);

// Two Var slots per cage hold that cage's sum split as 10*tens + units, since
// a sum can reach 30 while a cell holds at most 9. `units` is the cage colour.
const tens = new Var('T', 'cage sum tens digit', cages.length);
const units = new Var('U', 'cage sum units digit = cage colour', cages.length);
const tensOf = (i) => tens.cell(i + 1);
const colourOf = (i) => units.cell(i + 1);

const sumSplits = cages.map((_, i) => new Sum(
  0, ...cellsOf(i), [tensOf(i), -10], [colourOf(i), -1]));

// Cage adjacency, derived from the drawn cage cells: two cages are adjacent
// when a cell of one is orthogonally adjacent to a cell of the other.
const cageOfCell = new Map();
cages.forEach((_, i) => cellsOf(i).forEach(cell => cageOfCell.set(cell, i)));
const neighbourCages = cages.map((_, i) => {
  const found = new Set();
  for (const cell of cellsOf(i)) {
    for (const n of graph.neighbours(cell)) {
      const j = cageOfCell.get(n);
      if (j !== undefined && j !== i) found.add(j);
    }
  }
  return [...found].sort((a, b) => a - b);
});

const subsetsOf = (items) => items.reduce(
  (acc, item) => acc.concat(acc.map(s => [...s, item])), [[]]);

// Which neighbours are differently coloured is not known in advance, so each
// corner number branches over every way of splitting its neighbours into the
// differently-coloured ones (whose cells must sum to the corner number) and the
// same-coloured ones. The empty split is dropped: it sums to 0 and every corner
// number here is positive.
const cornerClue = (i) => new Or(
  subsetsOf(neighbourCages[i]).filter(s => s.length > 0).map(differing =>
    new And([
      ...neighbourCages[i].map(j => differing.includes(j)
        ? new AllDifferent(colourOf(i), colourOf(j))
        : new SameValues(2, colourOf(i), colourOf(j))),
      new Sum(cages[i][0], ...differing.flatMap(j => cellsOf(j))),
    ])));

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
  ])));
const oppositeOf = (cellId) => {
  const { row, col } = parseCellId(cellId);
  return makeCellId(10 - row, 10 - col);
};

return [
  shape,
  gridDigits,

  new Given('R3C1', 9),
  new Given('R7C9', 7),

  ...cages.map((_, i) => new AllDifferent(...cellsOf(i))),

  tens,
  units,
  ...sumSplits,
  ...cages.map((cage, i) => cage[0]).flatMap(
    (total, i) => total === null ? [] : [cornerClue(i)]),

  partner,
  ...graph.cells().map(cell => pairedWith(cell, oppositeOf(cell))),
];
