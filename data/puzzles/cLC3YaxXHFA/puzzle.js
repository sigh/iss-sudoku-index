// Title: The Silent Killer
// Author: Brant van Bladel
// Video: https://www.youtube.com/watch?v=cLC3YaxXHFA
// Source: https://cracking-the-cryptic.web.app/sudoku/3JLT3H32Pp

// Normal sudoku (default 9x9 with standard boxes; the puzzle's regions are
// exactly the 9 default boxes), no givens. 16 killer cages (distinct
// digits, no printed total). Each cage borders exactly one outside cell
// across a marked edge: that outside cell's own digit equals the sum of
// the bordering cage (EqualSum). The mark is drawn as "=" on a
// column-to-column edge and as a rotated "||" on a row-to-row edge -- the
// same equals-sign glyph turned to fit the edge it sits on, not a second
// relation; every cage borders exactly one such mark, either kind. Several
// outside cells sit beside more than one cage, so their digit is the
// common sum shared by every bordering cage.

// Each clue cell is the outside cell on the far side of that cage's own
// marked edge.
const cluedCages = [
  { cage: ['R1C6', 'R2C6', 'R3C6'], clue: 'R1C5' },
  { cage: ['R2C3', 'R2C4', 'R2C5'], clue: 'R1C5' },
  { cage: ['R4C1', 'R4C2'], clue: 'R5C1' },
  { cage: ['R5C2', 'R5C3'], clue: 'R5C1' },
  { cage: ['R6C1', 'R6C2'], clue: 'R5C1' },
  { cage: ['R7C1', 'R8C1'], clue: 'R7C2' },
  { cage: ['R7C3', 'R8C3', 'R9C3'], clue: 'R7C2' },
  { cage: ['R4C4', 'R4C5'], clue: 'R5C5' },
  { cage: ['R4C6', 'R5C6'], clue: 'R5C5' },
  { cage: ['R6C5', 'R6C6'], clue: 'R5C5' },
  { cage: ['R5C4', 'R6C4'], clue: 'R5C5' },
  { cage: ['R7C5', 'R8C5', 'R9C5'], clue: 'R7C4' },
  { cage: ['R8C7', 'R9C7'], clue: 'R8C8' },
  { cage: ['R4C8', 'R5C8', 'R6C8'], clue: 'R5C9' },
  { cage: ['R3C9', 'R4C9'], clue: 'R5C9' },
  { cage: ['R6C9', 'R7C9'], clue: 'R5C9' },
];

return [
  new Shape('9x9'),
  ...cluedCages.flatMap(({ cage, clue }) => [
    new AllDifferent(...cage),
    new EqualSum(cage, [clue]),
  ]),
];
