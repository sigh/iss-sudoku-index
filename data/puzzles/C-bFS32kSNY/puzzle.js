// Title: Lying Mystery Killer
// Author: Djmelee3000
// Video: https://www.youtube.com/watch?v=C-bFS32kSNY
// Source: https://app.crackingthecryptic.com/sudoku/qH42fp9hLh

// Normal sudoku rules. 22 killer cages are drawn with no printed total
// ("Every cage in the grid will add up to the same total (to be
// determined)"): AllDifferent per cage, plus a Sum equation tying its total
// to one shared value T, unless a yellow cell modifies it by its own digit's
// value ("the yellow cells ... indicate the amount the cage total is off by
// (eg if the total is 25 and the yellow cell is 5, then the real total is
// either 20 or 30)"). The four black-dot overlays ("the black dots only
// help show which cages the yellow cells are attached to - they are not
// ratios") each sit on the edge between a yellow cell that is not a member
// of any cage and a cell of the cage its offset applies to. A yellow cell
// that already sits inside a cage, and has no dot, applies to that own cage
// by default. R9C6 is the one cell with both: it is a cage-13 member and
// dot-linked to cage 12. The rules text resolves this explicitly -- "The
// yellow cell in r9c6 applies to the cage it is connected to [12], and
// possibly also its own cage [13]" -- so cage 12's total is a definite +/-
// offset, while cage 13's total is left a three-way choice (unmodified,
// +digit, or -digit): the rule's own wording ("possibly") is the ambiguity,
// not a decode gap to resolve out-of-band.
//
// T's true domain [10, 17] is forced, not assumed: among the *unmodified*
// cages there is a 2-cell one (distinct-digit sum <= 8+9 = 17) and a 4-cell
// one (sum >= 1+2+3+4 = 10), and both must equal the same T. That range
// needs 8 states, which does not fit a Var restricted to 1-9 without also
// needing a value above 9 -- rather than widen the whole grid's alphabet
// (hits the 16-value shape cap once combined with the 9 real digits plus
// headroom), Tv below holds T-9 (so Tv in 1-8, an ordinary Var on the
// default 1-9 range) and every equation's target is shifted by +9 to
// compensate; Tv is never read except inside these shifted equations, so
// the shift is sound throughout.

const T = new Var('T', 'Common cage total minus 9', 1);
const Tv = T.cell(1);

// cage cell lists, transcribed from the puzzle's drawn cages (index order
// kept stable to cross-reference the discussion above)
const cages = [
  ['R1C1', 'R2C1', 'R2C2'],          // 0
  ['R1C2', 'R1C3'],                  // 1
  ['R2C3', 'R3C3', 'R4C3'],          // 2
  ['R1C4', 'R1C5', 'R1C6', 'R2C5'],  // 3
  ['R1C7', 'R1C8', 'R1C9'],          // 4
  ['R2C4', 'R3C4', 'R3C5'],          // 5
  ['R2C6', 'R2C7', 'R2C8', 'R2C9'],  // 6
  ['R3C7', 'R3C8'],                  // 7
  ['R4C1', 'R5C1'],                  // 8
  ['R6C2', 'R7C2', 'R8C2'],          // 9
  ['R9C1', 'R9C2', 'R9C3'],          // 10
  ['R7C4', 'R7C3', 'R8C3', 'R8C4'],  // 11
  ['R8C5', 'R9C5', 'R9C4'],          // 12
  ['R7C6', 'R8C6', 'R9C6'],          // 13
  ['R8C7', 'R9C7', 'R9C8'],          // 14
  ['R7C8', 'R8C8', 'R7C9'],          // 15
  ['R5C7', 'R5C8', 'R5C9', 'R6C9'],  // 16
  ['R6C8', 'R6C7', 'R6C6'],          // 17
  ['R4C9', 'R4C8', 'R4C7'],          // 18
  ['R4C6', 'R4C5', 'R4C4'],          // 19
  ['R5C5', 'R5C4', 'R5C3', 'R6C3'],  // 20
  ['R6C4', 'R6C5'],                  // 21
];

// cage total = T +/- yellowCell's own digit, i.e. cageSum - Tv - Y = 9 or
// cageSum - Tv + Y = 9 once Tv = T - 9 is substituted in. Works whether
// yellowCell is a cage member (already summed once via `cageCells`; `Sum`
// adds duplicate cell contributions rather than deduplicating) or an
// outside cell linked only by a dot.
const offsetTotal = (cageCells, yellowCell) => new Or([
  new Sum(9, ...cageCells, [Tv, -1], [yellowCell, -1]), // total = T + digit
  new Sum(9, ...cageCells, [Tv, -1], [yellowCell, 1]),  // total = T - digit
]);

// cages with no yellow cell at all: total = T exactly
const unmodified = [0, 1, 2, 3, 4, 5, 6, 7, 16, 17, 18, 21];
// yellow cell is a cage member with no dot redirecting it: applies to its
// own cage by default
const withinOnly = { 9: 'R6C2', 10: 'R9C2', 11: 'R7C4', 14: 'R9C8', 15: 'R7C9' };
// yellow cell outside any cage, dot-attached to the named cage
const dotOnly = { 8: 'R6C1', 19: 'R3C6', 20: 'R5C6' };

const totals = [
  ...unmodified.map(i => new Sum(9, ...cages[i], [Tv, -1])),
  ...Object.entries(withinOnly).map(([i, cell]) => offsetTotal(cages[i], cell)),
  ...Object.entries(dotOnly).map(([i, cell]) => offsetTotal(cages[i], cell)),
  // cage 12: dot-connected to R9C6 -- definite per the rules text
  offsetTotal(cages[12], 'R9C6'),
  // cage 13: R9C6 is a member; the rules text leaves open whether it *also*
  // offsets its own cage ("possibly also"), so keep all three readings
  new Or([
    new Sum(9, ...cages[13], [Tv, -1]),
    new Sum(9, ...cages[13], [Tv, -1], ['R9C6', -1]),
    new Sum(9, ...cages[13], [Tv, -1], ['R9C6', 1]),
  ]),
];

return [
  new Shape('9x9'),
  T,
  new Given(Tv, 1, 2, 3, 4, 5, 6, 7, 8), // Tv = T - 9, T in [10,17]
  ...cages.map(cells => new AllDifferent(...cells)),
  ...totals,
];
