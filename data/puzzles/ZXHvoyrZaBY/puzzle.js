// Title: Austrian Heat
// Author: Palfly Kampling
// Video: https://www.youtube.com/watch?v=ZXHvoyrZaBY
// Source: https://app.crackingthecryptic.com/sudoku/4ghnRdpBTL

// Normal sudoku rules apply. Each green line, independently, satisfies at
// least one of: (a) a Thermometer -- digits strictly increase from the bulb
// to the tip; (b) a German Whisper -- adjacent digits differ by >= 5 and the
// bulb digit is odd. A line may satisfy both; "possibly both" is exactly
// what Or (inclusive) already allows, so no separate case is needed for it.
// Line cells and each line's bulb (first cell of every list, matching the
// drawn circle overlay) are transcribed from the drawn green lines.
const lines = [
  ['R4C5', 'R4C6', 'R3C6', 'R3C5', 'R3C4', 'R4C4', 'R5C4'],
  ['R6C5', 'R6C4', 'R7C4', 'R7C5', 'R7C6', 'R6C6', 'R5C6'],
  ['R4C3', 'R4C2', 'R4C1', 'R5C1', 'R6C1', 'R6C2', 'R6C3'],
  ['R9C3', 'R9C2', 'R8C1'],
  ['R8C8', 'R9C7'],
  ['R7C8', 'R8C9'],
  ['R4C9', 'R4C8', 'R3C9', 'R2C9'],
  ['R2C7', 'R1C6'],
  ['R1C4', 'R2C3', 'R3C3', 'R3C2'],
  ['R1C3', 'R1C2', 'R2C2'],
];

const ODD_DIGITS = [1, 3, 5, 7, 9];

const lineChoices = lines.map(cells => new Or([
  new Thermo(...cells),
  new And([new Whisper(...cells), new Given(cells[0], ...ODD_DIGITS)]),
]));

return [
  new Shape('9x9'),
  new Given('R8C1', 4),
  ...lineChoices,
];
