// Title: Under Pressure
// Author: AnalyticalNinja
// Video: https://www.youtube.com/watch?v=-busjuK6SZU
// Source: https://app.crackingthecryptic.com/sudoku/GDmnmRhFgN

// Normal sudoku rules apply (default row/column/box all-different; no other
// regions). Digits cannot repeat within a cage.
// Every cage is an "aquarium": split by row into a contiguous top block of
// "air" rows and a contiguous bottom block of "water" rows, at least one row
// of each. "Water cells fill the bottoms of cages" is the genre name and the
// rule's own wording -- water pools at the bottom, so the water rows are
// exactly the cage's bottom-most rows, not an arbitrary subset. Every
// water-row cell is greater than every air-row cell in the same cage
// ("greater than all the air cells"). The cages are also "pressurized": the
// air cells' average value must exceed the count of full grid rows above the
// cage's own topmost row (the rules' worked example: a cage confined to rows
// 7-9 needs air average > 6). Which row the split falls on is not given, so
// each cage is modelled as an Or over every valid split point.
//
// Each split's average-threshold check is itself an inequality over an
// equality-only Sum primitive, so it too needs an Or of exact sums. Nesting
// that inside the split's And, inside the outer Or (Or > And > Or), hits ISS
// blocker #1107: that nesting shape can report SAT on a scenario the flat
// form correctly rejects. So the cross product is taken up front instead --
// one flat Or branch per (row split x threshold sum), each branch a plain
// And of Pair/Sum leaves with no nested composite. Max Or/And depth is 2.

// a > b, applied as new Pair(gtKey, '', water, air) so `water` is checked
// against `air` in that order (Pair binds the two cells by list position).
const gtKey = Pair.fnToKey((a, b) => a > b, 9);

function orSingle(options) {
  return options.length === 1 ? options[0] : new Or(options);
}

// Cage geometry, transcribed from the payload's cage cell lists, grouped by
// grid row (top to bottom). `threshold` is (topmost row - 1): the count of
// full grid rows above the cage, per the rules' worked example.
const cages = [
  { threshold: 0, rows: [['R1C1'], ['R2C1', 'R2C2'], ['R3C1'], ['R4C1']] },
  { threshold: 1, rows: [['R2C3'], ['R3C2', 'R3C3'], ['R4C2']] },
  { threshold: 4, rows: [['R5C1'], ['R6C1'], ['R7C1']] },
  { threshold: 5, rows: [['R6C2'], ['R7C2'], ['R8C1', 'R8C2'], ['R9C1']] },
  { threshold: 3, rows: [['R4C3'], ['R5C3'], ['R6C3'], ['R7C3'], ['R8C3']] },
  { threshold: 4, rows: [['R5C5'], ['R6C5'], ['R7C5'], ['R8C5'], ['R9C4', 'R9C5']] },
  { threshold: 2, rows: [['R3C5', 'R3C6'], ['R4C4', 'R4C5'], ['R5C4']] },
  { threshold: 1, rows: [['R2C7'], ['R3C7'], ['R4C6', 'R4C7']] },
  { threshold: 1, rows: [['R2C8', 'R2C9'], ['R3C8'], ['R4C8'], ['R5C8', 'R5C9']] },
  { threshold: 2, rows: [['R3C9'], ['R4C9']] },
  { threshold: 5, rows: [['R6C7', 'R6C8'], ['R7C7']] },
  { threshold: 6, rows: [['R7C8', 'R7C9'], ['R8C9'], ['R9C9']] },
];

function aquariumConstraints({ threshold, rows }) {
  // At least one air row and one water row: k (the number of air rows, from
  // the top) ranges over 1..rows.length-1, excluding all-air and all-water.
  // For each split, the air average bound sum(air) >= threshold*count + 1
  // (average(cells) > threshold) is expanded into its own exact-sum options
  // up front, and crossed with the split -- a flat And of Pair/Sum leaves
  // per (split, sum) branch, never an Or nested inside this And.
  const branches = [];
  for (let k = 1; k < rows.length; k++) {
    const air = rows.slice(0, k).flat();
    const water = rows.slice(k).flat();
    const waterAboveAir = water.flatMap(
      w => air.map(a => new Pair(gtKey, '', w, a)));
    const count = air.length;
    const lowerBound = threshold * count + 1;
    const upperBound = 9 * count;
    for (let sum = lowerBound; sum <= upperBound; sum++) {
      branches.push(new And([...waterAboveAir, new Sum(sum, ...air)]));
    }
  }
  return [
    new AllDifferent(...rows.flat()),
    orSingle(branches),
  ];
}

return [
  new Shape('9x9'),
  ...cages.flatMap(aquariumConstraints),
];
