// Title: In-Between Extra
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=ZDZHyLa2Dus
// Source: https://sudokupad.app/musrlacrf2

// Normal Sudoku with the two drawn givens. Each grey segment has circled
// endpoints: its interior digits are strictly between them, and either endpoint
// equals the other endpoint plus the interior sum.
const segments = [
  ['R5C1', 'R4C2', 'R3C3', 'R2C4'],
  ['R2C4', 'R3C4', 'R4C4', 'R5C4'],
  ['R5C4', 'R6C3', 'R7C2', 'R8C1'],
  ['R9C2', 'R8C3', 'R7C4', 'R6C5'],
  ['R6C5', 'R7C6', 'R8C7', 'R9C8'],
  ['R8C9', 'R7C8', 'R6C7', 'R5C6'],
  ['R5C6', 'R4C6', 'R3C6', 'R2C6'],
  ['R2C6', 'R3C7', 'R4C8', 'R5C9'],
];

const inBetweenExtra = segments.flatMap(cells => {
  const [first, ...rest] = cells;
  const last = rest.at(-1);
  const middle = rest.slice(0, -1);
  return [
    new Between(...cells),
    new Or([
      new EqualSum([first], [...middle, last]),
      new EqualSum([last], [...middle, first]),
    ]),
  ];
});

return [
  new Shape('9x9'),
  new Given('R7C3', 9),
  new Given('R9C4', 2),
  ...inBetweenExtra,
];
