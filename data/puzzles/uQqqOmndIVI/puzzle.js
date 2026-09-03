// Title: Gemini
// Author: Christounet
// Video: https://www.youtube.com/watch?v=uQqqOmndIVI
// Source: https://sudokupad.app/6xlki7zd3x

// Two separate 9x9 sudoku grids stand side by side on one 9x19 canvas, so no
// single ISS board can hold them: the left grid is the Var group VL, the right
// grid VR, each a 9x9 overlay carrying its own rows, columns and boxes. The
// main Shape is an unused 1x1 placeholder, and its 0-9 range is what the Var
// groups inherit; 0 is used only by the doubler overlays.
//
// Rules encoded, in the order of the rules text:
//   - Normal sudoku applies in both grids. There are no given digits.
//   - In each grid the nine circled cells hold a complete set of 1-9.
//   - Circles at the same position in the two grids hold the same digit.
//   - For each such pair, one grid's circle is a doubler -- that cell's VALUE
//     is twice its digit -- and the other grid's circle is not. Which grid
//     doubles is decided per pair, not once for all nine.
//   - Every other cell's value is its digit.
//   - Digits cannot repeat in a cage.
//   - Cage values sum to the small printed total, where one is printed.
//   - Cages at the same position in the two grids have equal value totals.
//   - The rules text closes by fixing r9c1's circle as the doubler in the left
//     grid, a tie-break the setter added for their own solution checker.
// Nothing is omitted.

// The 13 cages, as the cells of the closed outlines drawn inside the left
// grid; the right grid repeats every outline at the same 9x9 position, so one
// list serves both. `total` is the small number printed inside that outline,
// null for an outline with no number in it.
const CAGES = [
  { cells: ['R1C2', 'R1C3', 'R2C2'], total: null },
  { cells: ['R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9'], total: 28 },
  { cells: ['R2C7', 'R3C7'], total: 11 },
  {
    cells: ['R3C1', 'R3C2', 'R3C3', 'R3C4', 'R4C1', 'R4C2', 'R4C4', 'R5C4'],
    total: null,
  },
  { cells: ['R4C5', 'R4C6', 'R5C5', 'R5C6'], total: 23 },
  { cells: ['R4C7', 'R4C8'], total: null },
  { cells: ['R5C8', 'R6C8'], total: null },
  { cells: ['R5C9', 'R6C9', 'R7C9'], total: null },
  { cells: ['R6C2', 'R6C3'], total: 10 },
  { cells: ['R6C4', 'R6C5', 'R6C6', 'R7C4'], total: 16 },
  { cells: ['R7C5', 'R8C3', 'R8C4', 'R8C5'], total: null },
  { cells: ['R7C7', 'R7C8', 'R8C7'], total: 7 },
  { cells: ['R8C1', 'R8C2', 'R9C1', 'R9C2'], total: 22 },
];

// The nine circled cells, from the drawn white circles; the same nine
// positions carry a circle in each grid.
const CIRCLES = [
  'R1C6', 'R2C9', 'R3C2', 'R4C8', 'R5C5', 'R6C3', 'R7C4', 'R8C7', 'R9C1',
];

// The circle whose doubler the rules text pins to the left grid.
const PINNED_CIRCLE = 'R9C1';

const graph = cellGraph('9x9');
const grids = {
  left: graph.makeOverlay('VL'),
  right: graph.makeOverlay('VR'),
};

// The extra a doubler adds to its cell's value: that cell's own digit where
// the circle is a doubler, 0 where it is not. One cell per circle, indexed by
// the circle's position in CIRCLES, per grid.
const extras = {
  left: new Var('X', 'left grid doubler extras', CIRCLES.length),
  right: new Var('Y', 'right grid doubler extras', CIRCLES.length),
};
const extraCell = (side, circle) =>
  extras[side].cell(CIRCLES.indexOf(circle) + 1);

const sides = Object.keys(grids);

// Normal sudoku in each grid. A Var group carries no house rules of its own,
// so all 27 houses per grid are stated here. The rows are ContainExact rather
// than AllDifferent because a Var group has no digit range of its own either:
// naming 1-9 is what keeps the two grids off the 0 that only the doubler
// extras use.
const sudoku = sides.flatMap(side => [
  ...grids[side].rows().map(
    cells => new ContainExact('1_2_3_4_5_6_7_8_9', ...cells)),
  ...grids[side].columns().map(cells => new AllDifferent(...cells)),
  ...grids[side].boxes().map(cells => new AllDifferent(...cells)),
]);

// "In each grid, the circles contain a complete set of the digits 1-9": nine
// circles, nine distinct digits, drawn from the 1-9 the rows above pin.
const circleSets = sides.map(
  side => new AllDifferent(...grids[side].at(CIRCLES)));

const doublers = CIRCLES.flatMap(circle => {
  const digit = grids.left.at(circle);
  const [x, y] = [extraCell('left', circle), extraCell('right', circle)];
  return [
    new SameValues(2, digit, grids.right.at(circle)),
    // Exactly one of the pair is the doubler: the doubling grid's extra is
    // the shared digit, so that cell's value is twice the digit, and the
    // other grid's extra is 0, leaving its value unchanged.
    new Or([
      new And([new Given(x, 0), new SameValues(2, y, digit)]),
      new And([new Given(y, 0), new SameValues(2, x, digit)]),
    ]),
  ];
});

// A cage's value cells: its digits, plus the doubler extra of each circle it
// contains, which adds that circle's digit a second time when it is doubled.
const cageValues = (side, cells) => [
  ...grids[side].at(cells),
  ...cells.filter(cell => CIRCLES.includes(cell))
    .map(cell => extraCell(side, cell)),
];

const cages = CAGES.flatMap(({ cells, total }) => [
  // "Digits cannot repeat in a cage" -- the digits, not the values.
  ...sides.map(side => new AllDifferent(...grids[side].at(cells))),
  // A printed total applies to both grids' copy of the cage, which is also
  // what makes the two copies' totals equal; an unclued pair states only the
  // equality.
  ...(total === null
    ? [new EqualSum(cageValues('left', cells), cageValues('right', cells))]
    : sides.map(side => new Sum(total, ...cageValues(side, cells)))),
]);

return [
  // The answer lives in VL and VR; the main grid is a pinned placeholder, and
  // '0-9' is the range the Var groups need for the doubler extras.
  new Shape('1x1', '0-9'),
  new Given('R1C1', 0),
  grids.left.toVar('left grid'),
  grids.right.toVar('right grid'),
  extras.left,
  extras.right,
  ...sudoku,
  ...circleSets,
  ...doublers,
  ...cages,
  // The rules text's closing tie-break: r9c1's circle is the doubler in the
  // left grid, so the right grid's extra there is 0.
  new Given(extraCell('right', PINNED_CIRCLE), 0),
];
