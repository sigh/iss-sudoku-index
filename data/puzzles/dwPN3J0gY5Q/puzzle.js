// Title: Sharing Economy
// Author: Blashyrkh
// Video: https://www.youtube.com/watch?v=dwPN3J0gY5Q
// Source: https://app.crackingthecryptic.com/sudoku/gTJqhL2TFb

// Normal sudoku rules apply. Four thermometers require strictly increasing
// digits from the bulb (the grey-circle end of each line, per the drawn
// underlay); Thermo enforces exactly that, bulb-first. One diagonal
// (top-left to bottom-right, drawn cyan) forbids repeated digits along it;
// Diagonal(-1) is ISS's '\' diagonal (R1C1..R9C9), matching the drawn line.
// The undrawn anti-diagonal carries no rule.

// Thermometer cell lists, bulb-first; transcribed from the drawn lines and
// their grey circle bulb markers.
const thermos = [
  ['R3C2', 'R3C1', 'R2C1', 'R1C2', 'R1C3', 'R2C3'],
  ['R7C2', 'R6C3', 'R5C4', 'R6C5', 'R7C4', 'R8C3'],
  ['R7C8', 'R7C9', 'R8C9', 'R9C8', 'R9C7', 'R8C7'],
  ['R5C8', 'R5C7', 'R5C6', 'R4C6', 'R3C6', 'R2C7'],
];

return [
  new Shape('9x9'),
  ...thermos.map(cells => new Thermo(...cells)),
  new Diagonal(-1),
];
