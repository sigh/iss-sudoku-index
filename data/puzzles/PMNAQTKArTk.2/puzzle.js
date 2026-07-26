// Title: Heavy Fog
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=PMNAQTKArTk
// Source: https://sudokupad.app/umo2rblj9k

// Standard sudoku on a 9x9 grid with standard boxes. The grid is covered in
// fog (solving UI, not a final-grid rule) and is not encoded. A 3-cell
// "Foglight" group (R4C6, R5C6, R6C6) carries a non-numeric label and no
// drawn cage border; it marks a fog-light UI prop, not a clue, so it is not
// encoded either.
// Purple lines: consecutive digit set, any order, no repeats -> Renban.
// Arrows: arm sums to the circled digit -> Arrow (circle cell first).
// Additionally, adjacent digits on the purple lines and on the arrows
// (including the circles) are different and not consecutive -> Whisper(2, ...)
// over the same ordered cell lists, since a difference of at least 2 rules out
// both equal and consecutive digits.

// Purple line cells, drawn-order, from the #f067f0 stroke geometry.
const purpleLines = [
  ['R9C9', 'R9C8', 'R9C7', 'R9C6'],
  ['R2C5', 'R2C4', 'R3C4', 'R4C4'],
  ['R4C1', 'R4C2', 'R4C3', 'R5C3'],
  ['R8C3', 'R9C2', 'R8C1', 'R7C2'],
];

// Arrow cells: [circle cell, ...arm cells], from the drawn arrow waypoints
// and matched against the circle overlays.
const arrows = [
  ['R7C7', 'R6C6', 'R5C6', 'R4C6', 'R3C5'],
  ['R3C8', 'R4C7', 'R5C7', 'R6C7'],
  ['R7C6', 'R8C6', 'R8C7', 'R8C8'],
  ['R7C5', 'R8C5', 'R9C5'],
  ['R1C4', 'R2C3', 'R3C3', 'R3C2'],
  ['R5C9', 'R4C9', 'R4C8'],
];

return [
  new Shape('9x9'),
  ...purpleLines.map(cells => new Renban(...cells)),
  ...purpleLines.map(cells => new Whisper(2, ...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
  ...arrows.map(cells => new Whisper(2, ...cells)),
];
