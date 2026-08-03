// Title: Keyhole Fever
// Author: Just Kirb
// Video: https://www.youtube.com/watch?v=3IDx9I2YZrY
// Source: https://app.crackingthecryptic.com/sudoku/JPPfjtQh7M

// Normal sudoku rules apply. Along a thermometer, digits increase from the
// bulb end (2-cell thermometers below, bulb cell listed first). Digits must
// not repeat at corresponding box positions: for each of the 9 within-box
// coordinates, the 9 cells holding that coordinate (one per box) must all
// differ -- encoded as one AllDifferent group per within-box coordinate,
// below.

const thermos = [
  ['R1C1', 'R1C2'], ['R1C4', 'R1C5'], ['R1C7', 'R1C8'],
  ['R4C1', 'R4C2'], ['R4C4', 'R4C5'], ['R4C7', 'R4C8'],
  ['R7C1', 'R7C2'], ['R7C4', 'R7C5'],
  ['R9C7', 'R8C7'], ['R9C4', 'R8C4'], ['R9C1', 'R8C1'],
  ['R6C7', 'R5C7'], ['R6C1', 'R5C1'],
  ['R3C7', 'R2C7'], ['R3C1', 'R2C1'], ['R3C4', 'R2C4'],
  ['R6C2', 'R5C2'], ['R9C2', 'R8C2'], ['R9C5', 'R8C5'],
  ['R6C5', 'R5C5'], ['R3C5', 'R2C5'], ['R3C8', 'R2C8'],
  ['R6C8', 'R5C8'], ['R9C8', 'R8C8'],
];

// One AllDifferent group per within-box (reading-order) position, collecting
// that position's cell from each of the 9 boxes.
const boxes = cellGraph('9x9').boxes();
const boxPositionGroups = boxes[0].map((_, pos) =>
  new AllDifferent(...boxes.map((box) => box[pos]))
);

return [
  new Shape('9x9'),
  new Given('R4C7', 2),
  new Given('R8C2', 8),
  ...thermos.map((cells) => new Thermo(...cells)),
  ...boxPositionGroups,
];
