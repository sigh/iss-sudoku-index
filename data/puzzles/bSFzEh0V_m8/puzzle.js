// Title: Four Flashes of Enlightenment
// Author: Mile Lemaic
// Video: https://www.youtube.com/watch?v=bSFzEh0V_m8
// Source: https://app.crackingthecryptic.com/sudoku/rJqFpfNPFq
//
// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Identical digits cannot be a knight's move apart -> AntiKnight.
// Digits on an arrow must sum to the number in the circle ->
// one Arrow(circle, ...arm) per arrow.
//
// Arrow cells were read off the drawn geometry: each waypoint is one cell
// (row, col), 0-indexed with a 0.5 offset. Each arrow's circle overlay lands
// exactly on the first waypoint cell of that arrow, so the circle anchors
// one end of the drawn line and the remaining waypoints form the arm in
// drawn order.
const arrows = [
  ['R3C6', 'R4C7', 'R5C6', 'R6C7', 'R7C6'],
  ['R8C5', 'R7C4', 'R6C4', 'R5C5'],
  ['R2C5', 'R3C4', 'R2C3', 'R1C2'],
  ['R8C2', 'R7C2', 'R6C2', 'R5C3', 'R4C3'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...arrows.map(cells => new Arrow(...cells)),
];
