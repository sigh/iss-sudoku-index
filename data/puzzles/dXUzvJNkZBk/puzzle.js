// Title: Flurry
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=dXUzvJNkZBk
// Source: https://sudokupad.app/kivcdm7p7s

// Rules encoded here:
//  1. The 8x8 grid uses digits 1-8, with no repeats in a row, column, or one
//     of eight solver-discovered boxes. Each box is either 2x4 or 4x2.
//  2. A large circle's digit equals the number of large circles holding it.
//  3. Each drawn white dot joins consecutive digits. Unmarked pairs are allowed.
// Nothing is omitted.

const shape = new Shape('8x8');
const grid = cellGraph(shape);
const cells = grid.cells();

// A 1 in VH/VV means that the cell is the top-left corner of a horizontal 2x4
// or vertical 4x2 box; 2 means it is not. The per-cell window sum below makes
// every grid cell belong to exactly one selected rectangle.
const H = grid.makeOverlay('VH');
const Vert = grid.makeOverlay('VV');
const overlayDomain = overlay =>
  overlay.makeReplicate(new Given(overlay.cells()[0], 1, 2));
const horizontalCorners = cells.filter(cell => grid.block(cell, 2, 4) !== null);
const verticalCorners = cells.filter(cell => grid.block(cell, 4, 2) !== null);

const boxCoverage = cells.map(cell => {
  const starts = [
    ...H.at(horizontalCorners.filter(corner => grid.block(corner, 2, 4).includes(cell))),
    ...Vert.at(verticalCorners.filter(corner => grid.block(corner, 4, 2).includes(cell))),
  ];
  // With selected=1 and unselected=2, this sum says exactly one candidate box
  // covers the cell. Across 64 cells this also fixes the total to eight boxes.
  return new Sum(2 * starts.length - 1, ...starts);
});

const horizontalBoxes = horizontalCorners.map(corner => new Or([
  new Given(H.at(corner), 2),
  new AllDifferent(...grid.block(corner, 2, 4)),
]));
const verticalBoxes = verticalCorners.map(corner => new Or([
  new Given(Vert.at(corner), 2),
  new AllDifferent(...grid.block(corner, 4, 2)),
]));

// The 35 large grey-bordered circles in the drawn grid.
const circles = [
  'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C5', 'R2C6', 'R2C7', 'R2C8',
  'R3C4', 'R3C6', 'R4C1', 'R4C3', 'R4C5', 'R4C7', 'R5C2', 'R5C5',
  'R5C6', 'R5C7', 'R5C8', 'R6C2', 'R6C5', 'R6C6', 'R6C7', 'R6C8',
  'R7C1', 'R7C2', 'R7C6', 'R7C7', 'R7C8', 'R8C1', 'R8C4', 'R8C5',
  'R8C6', 'R8C7', 'R8C8',
];

// The six small white edge circles, transcribed from the drawn dots.
const whiteDots = [
  new WhiteDot('R3C1', 'R4C1'), new WhiteDot('R4C4', 'R5C4'),
  new WhiteDot('R5C5', 'R5C6'), new WhiteDot('R5C8', 'R6C8'),
  new WhiteDot('R7C6', 'R7C7'), new WhiteDot('R8C7', 'R8C8'),
];

return [
  shape, new NoBoxes(), H.toVar('horizontal box starts'), Vert.toVar('vertical box starts'),
  overlayDomain(H), overlayDomain(Vert),
  ...boxCoverage, ...horizontalBoxes, ...verticalBoxes,
  new CountingCircles(...circles), ...whiteDots,
];
