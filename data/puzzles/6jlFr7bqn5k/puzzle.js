// Title: Happy Birthday, Dad
// Author: BremSter
// Video: https://www.youtube.com/watch?v=6jlFr7bqn5k
// Source: https://app.crackingthecryptic.com/sudoku/MJh2Q2jGPj
//
// Normal sudoku rules apply. Standard 3x3 boxes (payload regions match them
// exactly). On green (German Whisper) lines, adjacent digits must have a
// difference of at least 5 -- Whisper()'s default difference is 5, matching
// the rule text. Digits may not repeat within a cage and must sum to the
// shown total -- Cage() semantics.
//
// The 45-cage (cageC below) is a 9-cell hook; 45 = 1+...+9, so combined with
// no-repeats it forces those cells to hold 1-9 once each -- this falls out
// of Cage's semantics, not a separate constraint.
//
// The five whisper lines are five separate drawn wayPoints entries in the
// payload with no shared endpoints, so they are encoded as five independent
// Whisper lines rather than one merged path.

const givens = [
  new Given('R1C1', 1),
  new Given('R1C3', 8),
  new Given('R2C4', 1),
  new Given('R2C6', 2),
  new Given('R3C7', 4),
  new Given('R3C9', 5),
];

const cageA = new Cage(18, 'R6C1', 'R7C1', 'R7C2');
const cageB = new Cage(12, 'R7C3', 'R7C4', 'R8C4');
const cageC = new Cage(
  45, 'R8C5', 'R8C6', 'R9C6', 'R9C7', 'R9C8', 'R8C8', 'R8C9', 'R7C9', 'R6C9');

const whispers = [
  new Whisper('R1C2', 'R2C2', 'R3C2', 'R3C3', 'R4C3', 'R4C4', 'R5C4'),
  new Whisper('R1C6', 'R1C7', 'R1C8', 'R2C8', 'R3C8', 'R4C8', 'R5C8'),
  new Whisper('R5C7', 'R6C7'),
  new Whisper(
    'R6C1', 'R7C1', 'R7C2', 'R7C3', 'R7C4', 'R8C4', 'R8C5', 'R8C6', 'R9C6',
    'R9C7'),
  new Whisper('R9C8', 'R9C9', 'R8C9'),
];

return [
  new Shape('9x9'),
  ...givens,
  cageA,
  cageB,
  cageC,
  ...whispers,
];
