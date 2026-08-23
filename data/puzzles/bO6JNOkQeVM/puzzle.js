// Title: Am5rican F5v5r
// Author: Emphyrio
// Video: https://www.youtube.com/watch?v=bO6JNOkQeVM
// Source: https://app.crackingthecryptic.com/sudoku/JgdJDmG27q

// Normal sudoku rules apply. Along thermometers, digits must increase from
// the bulb end (Thermo). Adjacent digits on the green line have a
// difference of 5 or more (Whisper(5)). The green line is not a
// thermometer: no ordering is implied, only the pairwise difference.
// Thermo bulb ends and the green line's cell path are transcribed from the
// grey/green lines' waypoints and grey underlay circles (bulb markers) in
// the source payload.

const thermos = [
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'],
  ['R5C2', 'R5C1', 'R4C1', 'R4C2', 'R3C2', 'R2C2', 'R2C1', 'R3C1'],
  ['R4C8', 'R3C8', 'R2C8', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R5C8'],
  ['R7C4', 'R8C4', 'R9C4', 'R9C5'],
  ['R8C6', 'R8C5', 'R7C6', 'R7C5'],
];

const greenLine = [
  'R9C3', 'R8C3', 'R7C3', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7',
  'R7C7', 'R8C7', 'R9C7',
];

return [
  new Shape('9x9'),
  ...thermos.map(cells => new Thermo(...cells)),
  new Whisper(5, ...greenLine),
];
