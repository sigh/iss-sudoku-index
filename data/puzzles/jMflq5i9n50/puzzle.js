// Title: Treasure Map
// Author: Biscuit
// Video: https://www.youtube.com/watch?v=jMflq5i9n50
// Source: https://app.crackingthecryptic.com/PTF6FFhBhF

// Normal Sudoku applies. All possible adjacent pairs summing to 5 or 10 are
// marked; arrows sum their arms into their circles; orange-line neighbors differ
// by at least 4; and box-border sections of the blue line have equal sums.
// XV markers transcribed from the drawn X and V labels.
const xvs = [
  new X('R6C5', 'R6C6'),
  new V('R1C2', 'R2C2'),
  new V('R3C8', 'R3C9'),
  new V('R5C4', 'R5C5'),
  new V('R5C7', 'R5C8'),
  new V('R6C4', 'R6C5'),
  new V('R6C5', 'R7C5'),
  new V('R8C8', 'R8C9'),
];

// Arrow paths transcribed from the three circled arrows, with each circle first.
const arrows = [
  new Arrow('R8C2', 'R7C3', 'R6C4', 'R6C5'),
  new Arrow('R7C8', 'R6C7', 'R6C6'),
  new Arrow('R4C8', 'R4C7', 'R5C7'),
];

// The three separate orange lines are German whispers with difference 4.
const orangeWhispers = [
  new Whisper(4, 'R7C2', 'R6C3', 'R5C4', 'R4C5', 'R5C6', 'R6C7'),
  new Whisper(4, 'R5C5', 'R4C6', 'R3C7', 'R4C8', 'R5C9'),
  new Whisper(4, 'R6C4', 'R5C3', 'R4C2', 'R5C1'),
];

// Blue-line cells grouped by the standard-box sections they traverse.
const blueSections = new EqualSum(
  ['R9C3'],
  ['R8C4', 'R7C5'],
  ['R6C6'],
  ['R6C7', 'R6C8'],
  ['R7C9'],
);

return [
  new Shape('9x9'),
  new StrictXV(),
  ...xvs,
  ...arrows,
  ...orangeWhispers,
  blueSections,
];
