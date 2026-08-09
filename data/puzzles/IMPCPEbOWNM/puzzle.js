// Title: TH13TEEN
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=IMPCPEbOWNM
// Source: https://sudokupad.app/dkjeovl1up

// Digits 1-7 in a 9x9 grid. Every row, column, and box contains exactly one
// each of 2, 4, 5, 6, 7, and at least one 1 and at least one 3. Every 1 and
// every 3 is part of an adjacent pair reading '13' left-to-right or
// top-to-bottom. Cage digits are distinct and sum to the printed total.
//
// Rows and columns repeat digits, which no ISS main grid allows, so the grid
// is Raw: no implicit constraints.

const shape = new Shape('9x9', 7, 'Raw');
const GRID = cellGraph(shape);

// Boxes are built explicitly: a Raw grid has no default box regions.
const boxes = [];
for (let r = 1; r <= 9; r += 3) {
  for (let c = 1; c <= 9; c += 3) {
    boxes.push(GRID.block(makeCellId(r, c), 3, 3));
  }
}

// The five once-only digits plus a positive count of each of 1 and 3 fill
// all nine cells of a house: 5 fixed occurrences leave 4 cells, each 1 or 3.
const houses = [...GRID.rows(), ...GRID.columns(), ...boxes].flatMap(cells => [
  new ContainExact('2_4_5_6_7', ...cells),
  new ContainAtLeast('1_3', ...cells),
]);

// A '13' pair is ordered, so the rule is directional: a 1 needs a 3 to its
// right or below it, and a 3 needs a 1 to its left or above it. Each Or is an
// implication whose first branch (the cell is not that digit) makes it vacuous
// for the other five digits.
const NOT_ONE = [2, 3, 4, 5, 6, 7];
const NOT_THREE = [1, 2, 4, 5, 6, 7];
const thirteenPairs = GRID.cells().flatMap(cell => {
  const right = GRID.step(cell, 0, 1);
  const down = GRID.step(cell, 1, 0);
  const left = GRID.step(cell, 0, -1);
  const up = GRID.step(cell, -1, 0);
  return [
    new Or([
      new Given(cell, ...NOT_ONE),
      ...(right ? [new Given(right, 3)] : []),
      ...(down ? [new Given(down, 3)] : []),
    ]),
    new Or([
      new Given(cell, ...NOT_THREE),
      ...(left ? [new Given(left, 1)] : []),
      ...(up ? [new Given(up, 1)] : []),
    ]),
  ];
});

// Drawn cages, read from the grid art: total shown in the top-left cell.
// Cage supplies both the sum and the stated no-repeat rule.
const CAGES = [
  { total: 13, cells: ['R1C1', 'R1C2', 'R2C1'] },
  { total: 9, cells: ['R1C8', 'R1C9', 'R2C9'] },
  { total: 13, cells: ['R2C8', 'R3C8', 'R4C8', 'R5C8'] },
  { total: 13, cells: ['R3C3', 'R3C4', 'R4C3', 'R4C4'] },
  { total: 13, cells: ['R5C2', 'R6C2', 'R6C3'] },
  { total: 13, cells: ['R5C9', 'R6C9'] },
  { total: 13, cells: ['R6C6', 'R7C5', 'R7C6'] },
  { total: 13, cells: ['R7C1', 'R7C2', 'R7C3'] },
  { total: 13, cells: ['R7C7', 'R8C7', 'R9C7', 'R9C8'] },
  { total: 13, cells: ['R7C8', 'R7C9', 'R8C9', 'R9C9'] },
  { total: 13, cells: ['R8C1', 'R8C2', 'R8C3', 'R8C4'] },
  { total: 13, cells: ['R9C1', 'R9C2', 'R9C3'] },
];
const cages = CAGES.map(({ total, cells }) =>
  new Cage(total, ...cells));

return [
  shape,
  ...houses,
  ...thirteenPairs,
  ...cages,
];
