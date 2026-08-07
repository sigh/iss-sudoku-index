// Title: X-Sums Killer Sudoku
// Author: udukos
// Video: https://www.youtube.com/watch?v=P2_lU15Qsw8
// Source: https://app.crackingthecryptic.com/sudoku/QMb6m2pdMR

// Rules encoded:
//   Normal Sudoku on the 9x9 board. There are no givens.
//   Each drawn cage outline encloses some grid cells together with some cells
//   of the border ring outside the grid. A border cell holds an X-Sums clue:
//   with X the digit in the cell of that row/column nearest the clue, the clue
//   is the sum of the first X cells of that row/column read from the clue's
//   side. No clue value is printed anywhere in the source, so every clue value
//   is solved for.
//   Digits may not repeat within a cage, and a two-digit clue contributes both
//   of its digits to its cage. A two-digit clue may end in 0 (10, 20, 30, 40).
//   11/22/33/44 are excluded because the cage sees both digits of a clue.
// Nothing is omitted.

// Each clue value is carried by a tens cell and a units cell. A tens digit of
// 0 marks a one-digit clue, which contributes only its units digit to its cage;
// the value range is widened to 0-9 so that both 0 as a units digit and 0 as
// the "no tens digit" marker are expressible, and the grid cells are put back
// to 1-9 below.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);

// Transcribed from the source's seven no-total cages. `cells` are the cage's
// grid cells; `clues` are the border cells its outline encloses, each named by
// the side it sits on and the row (L/R) or column (T/B) it labels.
const CAGES = [
  {
    cells: ['R1C1'],
    clues: [['T', 1], ['L', 1], ['L', 2], ['L', 3], ['L', 4]],
  },
  {
    cells: ['R1C2', 'R1C3', 'R1C4', 'R1C5'],
    clues: [['T', 2], ['T', 3], ['T', 4], ['T', 5]],
  },
  {
    cells: ['R1C7', 'R1C8', 'R1C9'],
    clues: [['T', 6], ['T', 7], ['T', 8], ['T', 9]],
  },
  {
    cells: ['R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7'],
    clues: [['R', 4]],
  },
  {
    cells: ['R9C1'],
    clues: [['L', 9], ['B', 1]],
  },
  {
    cells: ['R5C1', 'R5C2', 'R6C1'],
    clues: [['L', 5], ['L', 6], ['L', 7]],
  },
  {
    cells: ['R4C4', 'R5C3', 'R5C4', 'R6C3'],
    clues: [],
  },
];

// The clue's row/column, ordered away from the clue, so element 0 is the cell
// that supplies X.
const laneOf = ([side, index]) => {
  switch (side) {
    case 'T': return graph.column(index);
    case 'B': return graph.column(index).slice().reverse();
    case 'L': return graph.row(index);
    case 'R': return graph.row(index).slice().reverse();
  }
};

const CLUES = CAGES.flatMap(cage => cage.clues);
const tens = new Var('T', 'x-sums tens digit', CLUES.length);
const units = new Var('U', 'x-sums units digit', CLUES.length);
const tensOf = clue => tens.cell(CLUES.indexOf(clue) + 1);
const unitsOf = clue => units.cell(CLUES.indexOf(clue) + 1);

// X-Sums: one branch per possible value of X, fixing the near cell to X and
// making the first X cells total the clue's two digits.
const xSums = CLUES.map(clue => {
  const lane = laneOf(clue);
  return new Or(lane.map((_, i) => new And([
    new Given(lane[0], i + 1),
    new Sum(0, ...lane.slice(0, i + 1), [tensOf(clue), -10], [unitsOf(clue), -1]),
  ])));
});

// A clue's units digit is always a real digit of the clue, so it joins the
// cage's grid cells in one all-different group.
const cageDigits = cage => [...cage.cells, ...cage.clues.map(unitsOf)];
const cageAllDifferent = CAGES.map(cage => new AllDifferent(...cageDigits(cage)));

// A tens digit only exists when it is non-zero; when it does it is a digit of
// the cage like any other.
const tensVsCage = CAGES.flatMap(cage => cage.clues.map(clue => new Or([
  new Given(tensOf(clue), 0),
  new AllDifferent(tensOf(clue), ...cageDigits(cage)),
])));

// Same condition for two clues in one cage: their tens digits differ unless at
// least one of them is absent.
const clueP = cage => cage.clues.flatMap(
  (a, i) => cage.clues.slice(i + 1).map(b => [a, b]));
const tensVsTens = CAGES.flatMap(cage => clueP(cage).map(([a, b]) => new Or([
  new Given(tensOf(a), 0),
  new Given(tensOf(b), 0),
  new AllDifferent(tensOf(a), tensOf(b)),
])));

return [
  shape,
  tens,
  units,
  // 0 is only available to the clue cells.
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  ...xSums,
  ...cageAllDifferent,
  ...tensVsCage,
  ...tensVsTens,
];
