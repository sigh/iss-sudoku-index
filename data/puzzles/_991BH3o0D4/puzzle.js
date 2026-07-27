// Title: Scrambled
// Author: Bobo
// Video: https://www.youtube.com/watch?v=_991BH3o0D4
// Source: https://sudokupad.app/lm7480sxiy

// Normal sudoku rules apply (standard row/column/box all-different, no givens).
//
// Scrambled Cages: digits in a cage don't repeat, and a cage's digits sum to
// the printed number on a *different* cage (all 7 printed numbers are used
// exactly once as a target, and the puzzle asserts the resulting sums are
// all different). Each cage's own printed number is therefore not
// necessarily its own sum.
//
// Scrambled Arrows: digits on an arrow (the line cells, not the circle) sum
// to the digit found in the circle of a *different* arrow. All 6 arrow sums
// are different.
//
// Both scrambles are modelled the same way: one selector Var per clue
// records *which other clue* it targets, `AllDifferent` over the selectors
// forces a bijection (so every target is used exactly once), and an
// `Or`-of-`And` ties each selector value to the matching sum equation.

// Cages: cells and printed numbers, transcribed from the drawn cage list
// (0-indexed [row, col] pairs converted to R#C#, listed in payload order).
const cages = [
  { cells: ['R8C7', 'R8C9', 'R9C7', 'R9C8', 'R9C9'], value: 9 },
  { cells: ['R2C2', 'R2C3', 'R3C2', 'R4C1', 'R4C2', 'R5C1'], value: 13 },
  { cells: ['R9C1', 'R9C2', 'R9C3', 'R9C4'], value: 21 },
  { cells: ['R4C4', 'R5C4', 'R6C4'], value: 5 },
  { cells: ['R4C6', 'R5C6'], value: 26 },
  { cells: ['R2C5', 'R2C6'], value: 28 },
  { cells: ['R3C9'], value: 24 },
];

// Arrows: each shaft is the drawn line's cells excluding the circle cell at
// one end; the circle is the drawn overlay coinciding with that end.
// Reconstructed from the drawn lines (line #0+#1 join into one shaft sharing
// R7C5), the 6 circle overlays, and the short arrowhead-stub markers used
// only to confirm which end is the pointed end, not to add a cell.
const arrows = [
  { shaft: ['R7C3', 'R8C4', 'R7C5', 'R6C6', 'R7C7'], circle: 'R8C8' },
  { shaft: ['R5C3', 'R4C3', 'R3C4', 'R3C5'], circle: 'R6C3' },
  { shaft: ['R7C9', 'R7C8'], circle: 'R6C7' },
  { shaft: ['R2C7', 'R3C8', 'R4C9'], circle: 'R2C8' },
  { shaft: ['R2C4', 'R1C3'], circle: 'R3C3' },
  { shaft: ['R6C1'], circle: 'R5C2' },
];

// One selector Var per clue, holding the 1-indexed position (within its own
// list) of the *other* clue it targets. Values stay in 1..N (N = 7 cages, 6
// arrows), well inside the default 1-9 grid range, so no Shape widening is
// needed.
const cageTarget = new Var('CT', 'cage target index', cages.length);
const arrowTarget = new Var('AT', 'arrow target index', arrows.length);

function otherIndices(n, self) {
  return Array.from({ length: n }, (_, i) => i + 1).filter(i => i !== self);
}

// Cage scramble: distinct digits per cage, plus a bijection from cage to the
// printed number of a different cage that its digits must sum to.
const cageConstraints = cages.flatMap((cage, i) => {
  const selfIdx = i + 1;
  const distinct = cage.cells.length > 1
    ? [new AllDifferent(...cage.cells)]
    : [];
  const matchesTarget = new Or(
    otherIndices(cages.length, selfIdx).map(j => new And([
      new Given(cageTarget.cell(selfIdx), j),
      new Sum(cages[j - 1].value, ...cage.cells),
    ]))
  );
  return [...distinct, matchesTarget];
});

// The bijection alone already makes the 7 realised sums a permutation of the
// 7 printed numbers, which are already pairwise distinct -- so "all cage
// sums are different" needs no separate constraint.

// Arrow scramble: a bijection from arrow to the circle cell of a different
// arrow whose digit its (repeat-permitting) shaft must sum to.
const arrowConstraints = arrows.flatMap((arrow, i) => {
  const selfIdx = i + 1;
  return [new Or(
    otherIndices(arrows.length, selfIdx).map(j => new And([
      new Given(arrowTarget.cell(selfIdx), j),
      // sum(shaft cells) == digit at the target circle, as two equal-sum segments.
      new EqualSum(arrow.shaft, [arrows[j - 1].circle]),
    ]))
  )];
});

// Because the arrow-target selectors form a bijection, the 6 realised sums
// are exactly a permutation of the 6 circle digits -- so "all arrow sums are
// different" is equivalent to the 6 circle cells holding different digits.
const circleCells = arrows.map(a => a.circle);

return [
  new Shape('9x9'),
  cageTarget,
  ...cages.map((_, i) =>
    new Given(cageTarget.cell(i + 1), ...otherIndices(cages.length, i + 1))),
  new AllDifferent(...cageTarget.cells()),
  ...cageConstraints,
  arrowTarget,
  ...arrows.map((_, i) =>
    new Given(arrowTarget.cell(i + 1), ...otherIndices(arrows.length, i + 1))),
  new AllDifferent(...arrowTarget.cells()),
  ...arrowConstraints,
  new AllDifferent(...circleCells),
];
