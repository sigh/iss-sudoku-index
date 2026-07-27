// Title: One Line (?)
// Author: Zorroish
// Video: https://www.youtube.com/watch?v=Hkc8KNGHhnc
// Source: https://sudokupad.app/19litary1w

// Standard Sudoku. Fourteen drawn line segments (payload `line` entries, cell
// order taken verbatim from the source), each carrying the rule its colour
// stands for: green/orange whispers apply to every consecutive pair on the
// segment; red/grey lines constrain only the segment's two endpoint cells,
// per "the endpoints of a red/grey line ..." in the rules text (as opposed to
// "adjacent numbers on a green/orange line ..."). Two odd circles and two X
// (sum-10) pairs complete the clue set; "not all X are given" means no
// negative constraint is added for unmarked adjacent pairs.
const greenWhispers = [
  new Whisper(5, 'R7C7', 'R8C8'),
  new Whisper(5, 'R9C5', 'R9C6'),
  new Whisper(5, 'R7C3', 'R8C2', 'R9C3', 'R9C4'),
  new Whisper(5, 'R5C4', 'R6C4', 'R7C5', 'R8C5'),
  new Whisper(5, 'R3C8', 'R3C7', 'R4C6', 'R4C5', 'R5C5', 'R6C5', 'R6C6'),
  new Whisper(5, 'R3C5', 'R2C6', 'R1C7', 'R1C8', 'R1C9'),
  new Whisper(5, 'R2C3', 'R3C3', 'R3C2', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R2C4'),
];

const orangeWhispers = [
  new Whisper(4, 'R9C6', 'R9C7', 'R8C8'),
  new Whisper(4, 'R9C4', 'R9C5'),
  new Whisper(4, 'R6C6', 'R5C6'),
];

// Only the two named endpoints of each red line are constrained; the middle
// cells carry no local relation from this clue.
const redEndpoints = [
  new Whisper(5, 'R8C5', 'R7C3'),
  new Whisper(5, 'R5C6', 'R5C4'),
  new Whisper(5, 'R1C9', 'R3C8'),
];

// Odd circles: candidate restriction to the odd digits.
const oddGivens = [
  new Given('R2C2', 1, 3, 5, 7, 9),
  new Given('R2C8', 1, 3, 5, 7, 9),
];

return [
  new Shape('9x9'),
  ...greenWhispers,
  ...orangeWhispers,
  ...redEndpoints,
  // Grey line: only its two endpoints sum to 5.
  new Sum(5, 'R2C4', 'R3C5'),
  ...oddGivens,
  new X('R4C2', 'R4C3'),
  new X('R4C7', 'R4C8'),
];
