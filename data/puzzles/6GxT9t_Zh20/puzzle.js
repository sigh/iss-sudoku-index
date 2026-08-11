// Title: Arrows between Thorns
// Author: Malrog
// Video: https://www.youtube.com/watch?v=6GxT9t_Zh20
// Source: https://app.crackingthecryptic.com/sudoku/jBgqFmpD2g

// Normal sudoku rules (standard 3x3 boxes, per the source's own regions).
// No givens.
// Rules: "Lines act both as Arrows, so that numbers on a line, including the
// blue circle, sum to the number in the orange circle, and as Between Lines,
// so any number on a line is between the numbers in the connected circles."
// So each of the 14 grey lines has two circled endpoints -- a larger orange
// circle and a smaller blue circle -- with plain cells between them:
//   * Arrow: [middle cells..., blue endpoint] sum to the orange endpoint.
//   * Between: each middle cell (excluding both endpoints) is strictly
//     between the orange and blue endpoint values.
// Both rules apply to every line at once, so each line below becomes one
// Arrow and one Between constraint over the same three parts.
//
// [orange target, [middle cells in path order], blue bulb] for each line,
// read from the source's own drawn line paths (a waypoint pair 2 cells
// apart, straight or diagonal, walks through the intervening cell) and
// circle overlays (larger orange-bordered circle = target, smaller
// blue-bordered circle = bulb).
const lines = [
  ['R1C6', ['R2C7'], 'R2C6'],
  ['R2C8', ['R3C8', 'R4C7', 'R5C6'], 'R5C5'],
  ['R3C7', ['R4C6'], 'R5C5'],
  ['R3C3', ['R3C4'], 'R3C5'],
  ['R2C2', ['R3C2', 'R4C3', 'R5C4'], 'R5C5'],
  ['R3C3', ['R4C4'], 'R5C5'],
  ['R5C1', ['R5C2'], 'R6C1'],
  ['R7C2', ['R7C3', 'R6C4'], 'R5C5'],
  ['R7C5', ['R6C5'], 'R5C5'],
  ['R7C8', ['R7C7', 'R6C6'], 'R5C5'],
  ['R5C9', ['R5C8'], 'R6C9'],
  ['R8C9', ['R7C9'], 'R6C9'],
  ['R8C9', ['R9C8'], 'R9C7'],
  ['R9C3', ['R8C2'], 'R9C1'],
];

return [
  new Shape('9x9'),
  ...lines.map(([target, middle, bulb]) => new Arrow(target, ...middle, bulb)),
  ...lines.map(([target, middle, bulb]) => new Between(target, ...middle, bulb)),
];
