// Title: The Fourth Killer
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=D_PsLF5ohEk
// Source: https://sudokupad.app/26w1k7rwci

// Normal Sudoku; fog is UI only. Yellow cages sum to their printed totals, allow
// repeats, and are self-counting. Grey bulbless thermometers ascend from either
// unmarked end. The two drawn white dots are positive consecutive-digit clues.
const cages = [
  { total: 29, cells: ['R2C5', 'R3C3', 'R3C5', 'R4C3', 'R4C4', 'R4C5', 'R5C2', 'R5C3', 'R5C4'] },
  { total: 5, cells: ['R1C7', 'R2C6', 'R2C7'] },
  { total: 131, cells: ['R3C1', 'R4C1', 'R4C6', 'R4C7', 'R5C1', 'R5C7', 'R6C1', 'R6C2', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R8C3', 'R8C5', 'R8C6', 'R8C8', 'R9C6', 'R9C7', 'R9C8', 'R9C9'] },
  { total: 1, cells: ['R4C9'] },
];

// Each table is transcribed from one yellow cage in the drawing.
const killerRules = cages.flatMap(({ total, cells }) => [
  new Sum(total, ...cells),
  new CountingCircles(...cells),
]);

const thermos = [
  ['R3C8', 'R3C9', 'R4C9'],
  ['R7C5', 'R8C5', 'R9C5', 'R9C4'],
].map(cells => new Or([
  new Thermo(...cells),
  new Thermo(...cells.toReversed()),
]));

return [
  new Shape('9x9'),
  ...killerRules,
  ...thermos,
  new WhiteDot('R3C4', 'R4C4'),
  new WhiteDot('R9C8', 'R9C9'),
];
