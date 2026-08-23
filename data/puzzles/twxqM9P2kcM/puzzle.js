// Title: Renbanshooter
// Author: Lavaloid
// Video: https://www.youtube.com/watch?v=twxqM9P2kcM
// Source: https://app.crackingthecryptic.com/sudoku/4jmjMjfqM2

// Standard Sudoku is implicit. Cage digits do not repeat and sum to the
// clue in the cage's top-left cell. Each grey line's cells hold a
// non-repeating set of consecutive digits, in any order (Renban).
const cages = [
  new Cage(20, 'R1C1', 'R2C1', 'R2C2', 'R1C2'),
  new Cage(31, 'R2C4', 'R3C4', 'R4C4', 'R4C3', 'R4C2'),
  new Cage(22, 'R1C6', 'R2C6', 'R2C7', 'R1C7'),
  new Cage(15, 'R4C7', 'R4C8', 'R4C9'),
  new Cage(20, 'R6C7', 'R7C7', 'R7C6'),
  new Cage(21, 'R7C9', 'R8C9', 'R8C8', 'R9C8', 'R9C7'),
  new Cage(6, 'R7C4', 'R8C4', 'R9C4'),
  new Cage(18, 'R6C1', 'R7C2', 'R6C2', 'R7C1'),
];

// The 4-cell grey line R6C7-R6C6-R7C6-R7C7 is drawn as a closed loop, but
// Renban is set-based (unordered), so the loop's cell set is given directly
// with no need to repeat a start cell for a wrap-around edge.
const renbans = [
  new Renban('R1C2', 'R2C2', 'R2C1'),
  new Renban('R1C4', 'R2C4', 'R3C4', 'R4C3', 'R4C2', 'R4C1'),
  new Renban('R2C6', 'R2C7'),
  new Renban('R4C7', 'R4C8', 'R4C9', 'R3C9'),
  new Renban('R5C9', 'R6C9'),
  new Renban('R6C7', 'R6C6', 'R7C6', 'R7C7'),
  new Renban('R8C9', 'R8C8', 'R9C8'),
  new Renban('R7C4', 'R8C4', 'R9C4', 'R9C3'),
  new Renban('R9C5', 'R9C6'),
  new Renban('R6C2', 'R7C2'),
];

return [
  new Shape('9x9'),
  new Given('R1C9', 6),
  new Given('R9C1', 8),
  ...cages,
  ...renbans,
];
