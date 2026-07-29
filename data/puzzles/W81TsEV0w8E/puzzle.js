// Title: Sudoku found tattooed on Lenin's body
// Author: Oyvind Thorsby
// Video: https://www.youtube.com/watch?v=W81TsEV0w8E
// Source: https://sudokupad.app/aalg2syl3j

// Standard 9x9 Sudoku. Pink-bulbed lines are thermometers. Each white-circle
// digit counts its occurrences among the white circles. For each digit at each
// relative 3x3-box position, its occurrence count over the nine boxes is not 2.

const thermos = [
  ['R1C1', 'R2C1'],
  ['R3C3', 'R3C2', 'R4C3', 'R5C2'],
  ['R4C1', 'R5C1', 'R6C1', 'R7C2', 'R7C3'],
  ['R4C9', 'R5C9'],
];

// White circles from the drawn white circular underlays.
const circles = [
  'R1C9', 'R2C8', 'R2C9', 'R5C8', 'R6C7',
  'R7C9', 'R9C1', 'R9C7', 'R9C8', 'R9C9',
];

// Each list holds one relative position from all nine 3x3 boxes, in box order.
const boxPositions = Array.from({ length: 3 }, (_, innerRow) =>
  Array.from({ length: 3 }, (_, innerCol) =>
    Array.from({ length: 3 }, (_, boxRow) =>
      Array.from({ length: 3 }, (_, boxCol) =>
        makeCellId(boxRow * 3 + innerRow + 1, boxCol * 3 + innerCol + 1)
      )
    ).flat()
  )
).flat();

// State is the target digit's count, saturated at 3; accepting every count but
// 2 expresses the rule that two matching box positions require a third.
const countNotTwo = target => NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, value) => ({
    count: Math.min(3, count + (value === target ? 1 : 0)),
  }),
  accept: ({ count }) => count !== 2,
}, 9);

const boxPositionRules = Array.from({ length: 9 }, (_, index) => index + 1)
  .flatMap(digit => boxPositions.map(cells =>
    new NFA(countNotTwo(digit), `box-position-${digit}`, ...cells)
  ));

return [
  new Shape('9x9'),
  ...thermos.map(cells => new Thermo(...cells)),
  new CountingCircles(...circles),
  ...boxPositionRules,
];
