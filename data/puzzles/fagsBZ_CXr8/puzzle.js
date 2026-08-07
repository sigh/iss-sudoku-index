// Title: Pairdoku Killer
// Author: Riffclown
// Video: https://www.youtube.com/watch?v=fagsBZ_CXr8
// Source: https://app.crackingthecryptic.com/sudoku/dbG6M636hG

// "Pairdoku Killer" is one half of a single 9x9 sudoku published as two
// half-boards, each carrying half of the clue set. The other half is
// "Pairdoku Arrow", https://app.crackingthecryptic.com/sudoku/nNrgt9P8Pg .
// The rules are stated once for the pair (video description):
//
//   "The two puzzles must be solved together, by two different people! The
//    grids are covered with fog except for some initial cleared cells. Placing
//    correct digits into cells clears the fog from all adjacent cells. Cages
//    show their sums, and digits cannot repeat within a cage. Digits on an
//    arrow sum to the number in the attached circle."
//
// plus normal sudoku rules, stated by each half.
//
// Encoded: normal sudoku, the killer cages of the killer half, and the arrows
// of the arrow half, as clues over one shared 9x9 grid. Both halves are drawn
// as the same board -- 9x9 with the same nine standard 3x3 boxes, no givens in
// either, and the same fog-cleared starting patch (R2C2-R4C4) -- and each
// half's rules text requires the other ("Must be solved with Pairdoku Arrow" /
// "Must be solved with Pairdoku Killer"), which is what "solved together, by
// two different people" describes: two solvers, two clue sets, one grid.
//
// Not encoded, as UI rather than a rule on the final grid: the fog covering,
// its reveal-on-correct-placement behaviour, and the "Use of Drawing tool is
// discouraged / All other conversation is encouraged" table talk.

// Cages drawn on the killer half; total printed in the top-left corner of the
// cage's first cell. [total, ...cells].
const cages = [
  [7, 'R2C2', 'R2C3', 'R3C2'],
  [6, 'R3C3', 'R4C3', 'R4C4'],
  [9, 'R1C6', 'R2C6', 'R2C7'],
  [16, 'R4C6', 'R4C7', 'R5C7'],
  [10, 'R5C5', 'R5C6', 'R6C6'],
  [12, 'R6C4', 'R7C4'],
  [18, 'R7C2', 'R7C3', 'R8C3'],
  [12, 'R7C6', 'R7C7', 'R8C7'],
].map(([sum, ...cells]) => new Cage(sum, ...cells));

// Arrows drawn on the arrow half: circle cell first, then the shaft in drawn
// order. Eight circles carry the 14 shafts; R3C5, R5C3 and R6C5 each start
// several, and each shaft sums to its circle's digit on its own.
const arrows = [
  ['R2C2', 'R3C3', 'R4C4'],
  ['R6C5', 'R7C5', 'R8C5', 'R8C4'],
  ['R6C5', 'R7C6'],
  ['R3C5', 'R2C4', 'R2C3'],
  ['R3C5', 'R4C5', 'R5C5', 'R6C6'],
  ['R3C5', 'R4C6', 'R5C7', 'R6C8'],
  ['R2C7', 'R3C8', 'R3C9'],
  ['R4C9', 'R5C9', 'R6C9'],
  ['R4C1', 'R5C1', 'R6C1'],
  ['R1C3', 'R1C4', 'R1C5', 'R1C6'],
  ['R5C3', 'R4C2', 'R3C2'],
  ['R5C3', 'R6C4'],
  ['R5C3', 'R6C2', 'R7C2'],
  ['R5C3', 'R5C4', 'R4C3'],
].map((cells) => new Arrow(...cells));

return [
  new Shape('9x9'),
  ...cages,
  ...arrows,
];
