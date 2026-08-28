// Title: Thermofactor
// Author: Ecl1psed
// Video: https://www.youtube.com/watch?v=DcY2Nc8yX5c
// Source: https://tinyurl.com/4h8wndxv

// Normal sudoku rules apply. Along thermometers, digits must strictly
// increase from the bulb. For any two digits separated by a yellow dot, one
// must be an exact multiple of the other (one divides the other). The rules
// state no exhaustiveness clause for the dots, so only the drawn pairs are
// constrained; unmarked adjacent pairs are unrestricted.

// Thermometers: cell order is bulb first, per the drawn geometry.
const thermos = [
  new Thermo('R3C3', 'R3C2', 'R3C1', 'R4C1'),
  new Thermo('R5C6', 'R5C7', 'R5C8'),
];

// Yellow factor dots, one Pair per drawn dot (all join orthogonally adjacent
// cells, transcribed from the drawn yellow circles).
const FACTOR_KEY = Pair.fnToKey((a, b) => a % b === 0 || b % a === 0, 9);
const factorDotCells = [
  ['R3C2', 'R4C2'], ['R3C3', 'R4C3'], ['R3C3', 'R3C4'], ['R2C3', 'R2C4'],
  ['R3C4', 'R4C4'], ['R4C3', 'R4C4'], ['R3C5', 'R4C5'], ['R3C6', 'R3C7'],
  ['R3C6', 'R4C6'], ['R2C6', 'R2C7'], ['R3C7', 'R4C7'], ['R4C6', 'R4C7'],
  ['R3C8', 'R4C8'], ['R5C6', 'R5C7'], ['R5C5', 'R5C6'], ['R4C5', 'R5C5'],
  ['R5C4', 'R5C5'], ['R5C5', 'R6C5'], ['R6C6', 'R6C7'], ['R6C7', 'R7C7'],
  ['R6C8', 'R7C8'], ['R7C6', 'R7C7'], ['R8C6', 'R8C7'], ['R6C6', 'R7C6'],
  ['R6C5', 'R7C5'], ['R6C4', 'R7C4'], ['R8C3', 'R8C4'], ['R7C3', 'R7C4'],
  ['R6C3', 'R7C3'], ['R6C2', 'R7C2'], ['R6C3', 'R6C4'], ['R5C3', 'R5C4'],
];
const factorDots = factorDotCells.map(
  ([a, b]) => new Pair(FACTOR_KEY, 'Factor', a, b));

return [
  new Shape('9x9'),
  new Given('R1C4', 3),
  new Given('R8C2', 5),
  ...thermos,
  ...factorDots,
];
