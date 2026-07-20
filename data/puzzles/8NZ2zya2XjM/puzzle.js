// Title: Wrogn Turn at Albuquerque
// Author: Daemen
// Video: https://www.youtube.com/watch?v=8NZ2zya2XjM
// Source: https://sudokupad.app/p7oh0lnuhf

// Each branch of a Wrogn Turn clue selects one valid path and explicitly
// rejects every alternative path, giving exactly one valid path per clue.
const arrowInvalidSpec = NFA.encodeSpec({
  startState: { bulb: null, sum: 0 },
  transition: ({ bulb, sum }, value) => bulb === null
    ? { bulb: value, sum: 0 }
    : { bulb, sum: sum + value },
  accept: ({ bulb, sum }) => bulb !== null && sum !== bulb,
  maxDepth: 4,
}, 9);

const thermoInvalidSpec = NFA.encodeSpec({
  startState: { previous: null, hasNonIncrease: false },
  transition: ({ previous, hasNonIncrease }, value) => ({
    previous: value,
    hasNonIncrease: hasNonIncrease || (previous !== null && value <= previous),
  }),
  accept: ({ hasNonIncrease }) => hasNonIncrease,
  maxDepth: 8,
}, 9);

const invalidArrow = (cells) => new NFA(arrowInvalidSpec, 'invalid arrow', cells);
const invalidThermo = (cells) => new NFA(thermoInvalidSpec, 'invalid thermo', cells);

const arrowClues = [
  [
    ['R1C3', 'R2C2', 'R3C2'],
    ['R1C3', 'R1C4', 'R1C5'],
  ],
  [
    ['R4C7', 'R5C7', 'R5C6', 'R6C6'],
    ['R4C7', 'R3C7', 'R2C7', 'R2C8'],
  ],
  [
    ['R8C4', 'R9C3'],
    ['R8C4', 'R9C5', 'R8C6'],
    ['R8C4', 'R7C4', 'R6C3'],
  ],
];

const thermoClues = [
  [
    ['R8C3', 'R7C2', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1'],
    ['R8C3', 'R7C2', 'R6C1', 'R5C1', 'R4C2', 'R3C2', 'R2C3'],
  ],
  [
    ['R8C7', 'R7C7', 'R6C7', 'R5C8', 'R4C8', 'R3C8', 'R2C9'],
    ['R8C7', 'R7C7', 'R6C7', 'R5C8', 'R4C8', 'R3C7', 'R2C6'],
  ],
  [
    ['R8C5', 'R7C5', 'R6C5', 'R5C4', 'R4C4', 'R3C4', 'R2C4', 'R1C4'],
    ['R8C5', 'R7C5', 'R6C5', 'R5C4', 'R4C4', 'R3C5', 'R2C5', 'R1C6'],
  ],
];

const clues = [
  ...arrowClues.map(paths => ({ paths, valid: path => new Arrow(...path), invalid: invalidArrow })),
  ...thermoClues.map(paths => ({ paths, valid: path => new Thermo(...path), invalid: invalidThermo })),
];

const selectPath = (clueIndex, selectedIndex) => {
  const { paths, valid, invalid } = clues[clueIndex];
  return [
    valid(paths[selectedIndex]),
    ...paths.filter((_, index) => index !== selectedIndex).map(invalid),
  ];
};

// Intersecting paths must have the same validity. The three intersections link
// arrow 1 with thermos 1 and 3, and arrow 2 with thermo 2. Arrow 3 is independent.
// These seven branches encode the compatible choices directly, avoiding the
// 12-way cross-product expansion of all globally compatible selections.
const compatibleChoiceGroups = [
  [
    [[0, 0], [3, 1], [5, 1]],
    [[0, 1], [3, 0], [5, 0]],
  ],
  [
    [[1, 0], [4, 0]],
    [[1, 1], [4, 1]],
  ],
  [
    [[2, 0]],
    [[2, 1]],
    [[2, 2]],
  ],
];

const wrognTurnConstraints = compatibleChoiceGroups.map(group => new Or(
  group.map(choice => new And(
    choice.flatMap(([clueIndex, selectedIndex]) => selectPath(clueIndex, selectedIndex))
  ))
));

return [
  new Shape('9x9'),
  ...wrognTurnConstraints,
];
