// Title: Elizabeth Regina
// Author: Malrog
// Video: https://www.youtube.com/watch?v=xExMFHakS2k
// Source: https://app.crackingthecryptic.com/sudoku/7P97LBdqnt

// Normal sudoku rules (standard rows/cols/boxes) plus:
// - "E"/"R" strokes: adjacent cells along each drawn letter differ by >= 5.
// - Light-grey thermometer: strictly increasing from the bulb.
// - Purple line: 7 consecutive digits in any order, no repeat (Renban).
// - Killer cage: no repeat, sums to the given total.
// - Two marked diagonals: sum to the given total (repeats allowed).
// - White dots: consecutive digits across the marked edge.

// "E" stroke (yellow-green): transcribed from the drawn path; a crossbar is
// a separate stroke segment.
const letterE = [
  ['R7C4', 'R8C4', 'R8C3', 'R8C2', 'R7C2', 'R6C2', 'R5C2', 'R4C2', 'R4C3', 'R4C4', 'R5C4'],
  ['R6C2', 'R6C3'],
];

// "R" stroke (yellow-green): the source pen retraces R4C6/R5C6/R8C6 while
// drawing the bowl and stem; the raw waypoint order is kept verbatim below
// so every adjacent pair on the drawn stroke gets the constraint once.
const letterR = [
  ['R4C5', 'R4C6', 'R4C7', 'R5C8', 'R6C7', 'R6C6', 'R5C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R8C6', 'R8C5', 'R8C6', 'R8C7'],
  ['R6C7', 'R7C8', 'R8C9'],
];

// Thermometer: shared bulb stem R1C5-R2C5-R3C5, then two increasing arms.
// The source draws this as one retracing stroke (out to one tip, back to the
// fork, out to the other); each arm becomes its own Thermo sharing the stem.
const thermoArms = [
  ['R1C5', 'R2C5', 'R3C5', 'R3C4', 'R3C3'],
  ['R1C5', 'R2C5', 'R3C5', 'R3C6', 'R3C7'],
];

// Purple line (Renban): set-based, order does not matter.
const renbanLine = ['R3C4', 'R2C3', 'R1C4', 'R2C5', 'R1C6', 'R2C7', 'R3C6'];

// Killer cage, bottom row.
const cage = ['R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'];

// White dot pairs.
const whiteDots = [
  ['R3C3', 'R4C3'],
  ['R3C7', 'R4C7'],
];

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

return [
  new Shape('9x9'),
  new Given('R3C3', 8),
  new Given('R3C7', 9),

  ...letterE.map(cells => new Whisper(5, ...cells)),
  ...letterR.map(cells => new Whisper(5, ...cells)),

  ...thermoArms.map(cells => new Thermo(...cells)),

  new Renban(...renbanLine),

  new Cage(22, ...cage),

  // Marked diagonals: rays from the drawn arrow start cells, in the drawn
  // direction, so LittleKiller resolves its own canonical corner/direction.
  LittleKiller.fromCells(19, graph.ray('R1C6', 1, 1), geometry),
  LittleKiller.fromCells(52, graph.ray('R1C9', 1, -1), geometry),

  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
