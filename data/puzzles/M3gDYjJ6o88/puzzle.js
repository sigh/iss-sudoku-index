// Title: Maximum Security
// Author: Suspicious Door
// Video: https://www.youtube.com/watch?v=M3gDYjJ6o88
// Source: https://app.crackingthecryptic.com/xfim768h1h

// Normal Sudoku rules apply. Cage digits do not repeat. A cage labelled a/b
// has sum a or b. Every pink extreme line contains at least one 1 or at least
// one 9.

// The 16 cage outlines and their a/b labels are transcribed from the
// drawn cages; each alternative retains the cage's distinctness requirement.
const alternativeCages = [
  [9, 21, ['R1C1', 'R1C2', 'R2C1']],
  [8, 22, ['R1C3', 'R1C4', 'R1C5']],
  [8, 22, ['R1C6', 'R2C6', 'R2C7']],
  [9, 21, ['R1C8', 'R1C9', 'R2C9']],
  [8, 22, ['R2C2', 'R2C3', 'R2C4']],
  [8, 22, ['R2C8', 'R3C8', 'R4C8']],
  [8, 22, ['R3C9', 'R4C9', 'R5C9']],
  [8, 22, ['R6C8', 'R6C9', 'R7C8']],
  [8, 22, ['R8C6', 'R8C7', 'R8C8']],
  [9, 21, ['R8C9', 'R9C8', 'R9C9']],
  [8, 22, ['R9C5', 'R9C6', 'R9C7']],
  [8, 22, ['R8C3', 'R8C4', 'R9C4']],
  [8, 22, ['R6C2', 'R7C2', 'R8C2']],
  [8, 22, ['R5C1', 'R6C1', 'R7C1']],
  [8, 22, ['R3C2', 'R4C1', 'R4C2']],
  [9, 21, ['R8C1', 'R9C1', 'R9C2']],
].map(([low, high, cells]) => new Or([
  new Cage(low, ...cells),
  new Cage(high, ...cells),
]));

// The two cages with a single printed total, transcribed from their outlines.
const fixedCages = [
  new Cage(11, 'R4C4', 'R4C5'),
  new Cage(11, 'R5C4', 'R5C5', 'R5C6'),
];

// Pink paths, listed in their source order. The two branches of each Or state
// the rule's inclusive "1 or 9" condition without selecting which extreme.
const extremeLines = [
  ['R6C3', 'R7C3', 'R7C4'],
  ['R4C3', 'R3C3', 'R3C4'],
  ['R3C6', 'R3C7', 'R4C7'],
  ['R6C7', 'R7C7', 'R7C6'],
].map(cells => new Or([
  new ContainAtLeast('1', ...cells),
  new ContainAtLeast('9', ...cells),
]));

return [
  new Shape('9x9'),
  ...alternativeCages,
  ...fixedCages,
  ...extremeLines,
];
