// Title: The Fifth Night
// Author: Jessica Shaham
// Video: https://www.youtube.com/watch?v=-jNQk9tN57k
// Source: https://app.crackingthecryptic.com/webapp/h6p4D32pfD

// Normal sudoku rules apply (standard 3x3 boxes, no jigsaw). Digits increase
// along each thermo (orange) from its bulb; Thermo(...) takes the bulb cell
// first. Palindromes (blue) read the same both ways. Cages show their sum
// totals.

const givens = [
  ['R1C4', 4],
  ['R2C6', 6],
  ['R3C4', 1],
  ['R5C1', 2],
  ['R6C4', 3],
  ['R7C2', 5],
  ['R8C8', 8],
  ['R9C1', 7],
];

// Cell lists and totals from the drawn `cages` array; all five are 2-cell,
// sum-8 cages.
const cages = [
  ['R1C2', 'R1C3'],
  ['R1C7', 'R1C8'],
  ['R3C2', 'R4C2'],
  ['R7C7', 'R7C8'],
  ['R9C4', 'R9C5'],
];

// Orange thermometers, bulb cell first. Six of eight have an explicit bulb
// overlay matching their first drawn waypoint; R9C6-R9C5-R9C4 is drawn
// tip-first (bulb overlay on the line's last waypoint), so it is listed here
// in the reverse of its raw waypoint order. R9C5-R8C5-R7C5 has no overlay
// circle at either end, so its direction is not drawn; the opposite
// direction (bulb R7C5) is refuted -- together with R9C6-R9C5-R9C4 and the
// R9C4/R9C5 cage it makes a minimal 3-constraint set unsatisfiable (forces
// R9C6 into {1,2}, both already used in box 8 by R7C5/R8C5), and the puzzle
// has a solution, so that reading is excluded.
const thermos = [
  ['R3C4', 'R4C4', 'R5C5'],
  ['R2C5', 'R3C5', 'R4C5', 'R5C5'],
  ['R3C6', 'R4C6', 'R5C5'],
  ['R3C7', 'R4C7'],
  ['R3C8', 'R4C8', 'R5C7'],
  ['R3C9', 'R4C9', 'R5C8', 'R6C7'],
  ['R9C5', 'R8C5', 'R7C5'],
  ['R9C6', 'R9C5', 'R9C4'],
];

// Blue palindrome lines; direction is irrelevant to the constraint.
const palindromes = [
  ['R5C4', 'R4C3', 'R3C3'],
  ['R3C2', 'R4C2', 'R5C3', 'R6C4', 'R6C5', 'R6C6'],
  ['R3C1', 'R4C1', 'R5C2', 'R6C3', 'R7C4', 'R7C5', 'R7C6'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map((cells) => new Cage(8, ...cells)),
  ...thermos.map((cells) => new Thermo(...cells)),
  ...palindromes.map((cells) => new Palindrome(...cells)),
];
