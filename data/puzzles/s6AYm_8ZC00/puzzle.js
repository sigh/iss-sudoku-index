// Title: Everything Is Stavros96
// Author: Stavros96
// Video: https://www.youtube.com/watch?v=s6AYm_8ZC00
// Source: https://app.crackingthecryptic.com/sudoku/6Dnqr8TLQ7

// Normal sudoku rules apply (standard 3x3 box regions from the payload's own
// `regions` array; no extra Regions constraint needed). Grey lines are
// palindromes. Along thermometers digits increase from the bulb end. Every
// cage sums to 9 or 6, digits not repeating within a cage; no cage has a
// printed total. The two long (12-cell) grey lines carry no bulb-circle
// underlay and are read as palindromes; the two short (2-cell) grey lines
// each carry a matching circle underlay at one end and are read as
// thermometers, bulb at the circled cell. No givens.

// Cage cell lists, transcribed from the drawn cage geometry.
const cages = [
  ['R1C2', 'R1C3'],
  ['R3C1', 'R3C2', 'R3C3'],
  ['R2C4', 'R3C4'],
  ['R3C5', 'R4C5'],
  ['R3C7', 'R4C7'],
  ['R6C1', 'R6C2'],
  ['R8C2', 'R9C2', 'R9C1'],
  ['R7C3', 'R7C4', 'R8C4'],
  ['R7C6', 'R6C6'],
  ['R7C9', 'R8C9', 'R9C9'],
];

// Each cage sums to 9 or 6 (disjunction, not a fixed total); Cage also
// enforces all-different, matching "digits may not repeat in cages".
const cageConstraints = cages.map(
  (cells) => new Or([new Cage(9, ...cells), new Cage(6, ...cells)])
);

return [
  new Shape('9x9'),
  ...cageConstraints,
  new Palindrome(
    'R5C3', 'R5C2', 'R4C1', 'R3C1', 'R2C2', 'R2C3',
    'R3C4', 'R4C4', 'R5C4', 'R6C4', 'R7C3', 'R8C2'
  ),
  new Palindrome(
    'R2C8', 'R3C7', 'R4C6', 'R5C6', 'R6C6', 'R7C6',
    'R8C7', 'R8C8', 'R7C9', 'R6C9', 'R5C8', 'R5C7'
  ),
  new Thermo('R1C5', 'R1C4'),
  new Thermo('R9C5', 'R9C6'),
];
