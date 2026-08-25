// Title: Greater-Than Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=XM8nDcjhwUw
// Source: https://sudokupad.app/Tm7GBtdPb6

// Normal sudoku rules apply. Digits may not repeat in a cage and must sum to
// the indicated total, if given. Cages joined by equals signs must have the
// same sum. Cages joined by inequality signs have sums in the indicated
// relationship. Standard 3x3 boxes, no givens.
//
// Every cage below is transcribed from the drawn cage list (payload index in
// the comment on each line). A totalled cage is `Cage(total, ...)`; a
// no-total cage is all-different only, so `AllDifferent(...)`.
//
// Three small overlay badges sit on cage borders and link three of the
// no-total cages. Two "=" badges tie cages 28 and 29 to
// cage 30 (equal sums), encoded as one EqualSum per drawn badge, and a "v"
// badge ties cage 21 to cage 22 (greater-than, see the NFA comment below).
// The remaining no-total cages (0, 1, 2, 3, 18, 25) carry no badge and so are
// unlinked.

const cage0 = ['R1C1', 'R1C2', 'R2C2', 'R2C1'];
const cage1 = ['R1C3', 'R2C3', 'R3C3', 'R3C2', 'R3C1'];
const cage2 = ['R1C4', 'R1C5', 'R1C6'];
const cage3 = ['R1C7', 'R1C8'];
const cage18 = ['R5C8', 'R5C9'];
const cage25 = ['R8C5', 'R9C5'];
const cage28 = ['R7C1', 'R8C1'];
const cage29 = ['R7C2', 'R8C2'];
const cage30 = ['R9C1', 'R9C2'];

// The "v" badge sits on the R7C8|R8C8 border, between cage 21 (above) and
// cage 22 (below). Read as a rotated inequality sign whose vertex points at
// the smaller side, its point (bottom) faces cage 22, so cage 21's sum is
// greater than cage 22's sum. Cage totals aren't fixed, so an
// equality/inequality Var can't hold them (a 5-cell cage's total ranges
// 15-35, past the 16-value Var cap) -- instead this NFA scans cage 21 then
// cage 22 as two segments, carrying only their running difference (`diff`),
// and accepts when the final difference is strictly positive.
const gt2122 = NFA.encodeSpec({
  startState: { seg: 1, diff: 0 },
  transition: ({ seg, diff }, value) => {
    if (value === SEGMENT_BREAK) return { seg: 2, diff };
    return seg === 1 ? { seg: 1, diff: diff + value } : { seg: 2, diff: diff - value };
  },
  accept: ({ seg, diff }) => seg === 2 && diff > 0,
  maxDepth: 10,
}, 9, { multiSegment: true });

return [
  new Shape('9x9'),

  // Totalled cages (payload index in comment).
  new Cage(21, 'R2C4', 'R3C4', 'R4C4', 'R4C3', 'R4C2'), // 4
  new Cage(13, 'R2C5', 'R2C6'), // 5
  new Cage(9, 'R2C7', 'R2C8'), // 6
  new Cage(5, 'R1C9', 'R2C9'), // 7
  new Cage(19, 'R3C7', 'R3C8', 'R3C9'), // 8
  new Cage(11, 'R3C5', 'R3C6'), // 9
  new Cage(17, 'R4C1', 'R5C1', 'R6C1'), // 10
  new Cage(4, 'R5C2', 'R6C2'), // 11
  new Cage(11, 'R5C3', 'R6C3'), // 12
  new Cage(17, 'R5C4', 'R6C4'), // 13
  new Cage(8, 'R4C5', 'R4C6'), // 14
  new Cage(10, 'R5C6', 'R5C5', 'R6C5'), // 15
  new Cage(4, 'R4C7', 'R5C7'), // 16
  new Cage(8, 'R4C8', 'R4C9'), // 17
  new Cage(8, 'R6C9', 'R7C9'), // 19
  new Cage(18, 'R6C7', 'R6C6', 'R7C6'), // 20
  new Cage(9, 'R9C6', 'R9C7'), // 23
  new Cage(14, 'R7C4', 'R7C5'), // 24
  new Cage(9, 'R8C4', 'R9C4'), // 26
  new Cage(15, 'R7C3', 'R8C3', 'R9C3'), // 27

  // No-total cages: all-different only (payload index in comment).
  new AllDifferent(...cage0), // 0
  new AllDifferent(...cage1), // 1
  new AllDifferent(...cage2), // 2
  new AllDifferent(...cage3), // 3
  new AllDifferent(...cage18), // 18
  new AllDifferent('R6C8', 'R7C8', 'R7C7', 'R8C7', 'R8C6'), // 21
  new AllDifferent('R8C9', 'R8C8', 'R9C8', 'R9C9'), // 22
  new AllDifferent(...cage25), // 25
  new AllDifferent(...cage28), // 28
  new AllDifferent(...cage29), // 29
  new AllDifferent(...cage30), // 30

  // "=" badges: cage 28 = cage 30, cage 29 = cage 30 (so all three are equal).
  new EqualSum(cage28, cage30),
  new EqualSum(cage29, cage30),

  // "v" badge: cage 21's sum > cage 22's sum (see NFA comment above).
  new NFA(gt2122, 'cage21-gt-cage22',
    ['R6C8', 'R7C8', 'R7C7', 'R8C7', 'R8C6'],
    ['R8C9', 'R8C8', 'R9C8', 'R9C9']),
];
