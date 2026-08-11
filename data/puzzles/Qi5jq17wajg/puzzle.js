// Title: Kylo Ren
// Author: starwarigami
// Video: https://www.youtube.com/watch?v=Qi5jq17wajg
// Source: https://app.crackingthecryptic.com/sudoku/Tnnrj9R79p

// Rules: Normal sudoku rules apply. Digits cannot repeat within a cage (no
// cage has a given total). Along each purple line, the totals of the cages
// it passes through form a set of consecutive integers, in any order.
//
// A cage with no total is `Cage(0, ...)`: ISS treats a cage sum of 0 as "any
// sum is ok", i.e. AllDifferent only.
//
// Each purple line, walked cell by cell against the cages it crosses, enters
// and leaves every cage it touches exactly once (no split cage, no revisit)
// -- so each line reduces to an ordered list of whole cages, and the rule
// constrains that list's cage-total multiset.
//
// A set of k pairwise-distinct integers is a consecutive run iff every
// pairwise difference has absolute value in [1, k-1]: k distinct integers
// confined to a span <= k-1 must fill that span exactly (pigeonhole), and a
// consecutive run trivially keeps every pairwise difference <= k-1. So the
// whole-line rule is equivalent to one constraint per unordered pair of
// cages on that line, on their totals' difference.
//
// Each pairwise difference is materialized as a Var cell D holding
// (totalA - totalB) + 5, tied to the two cage totals with
// Sum(-5, A cells +1, B cells -1, D -1) = 0, then restricted by a Given to
// the values encoding a nonzero difference of magnitude <= k-1 (excluding 5,
// and excluding values outside [5-(k-1), 5+(k-1)]). Every D therefore stays
// inside the grid's native 1-9 alphabet -- no widened Shape is needed.

// Cages, transcribed from the source's cage overlay (25 real cages; a
// further 4 entries are metadata stubs and are not encoded).
const cages = [
  ['R1C1', 'R1C2'], // #0
  ['R1C3', 'R1C4'], // #1
  ['R1C6', 'R1C5', 'R2C5', 'R2C6', 'R3C6'], // #2
  ['R2C7', 'R1C7', 'R1C8'], // #3
  ['R2C8', 'R2C9'], // #4
  ['R3C7', 'R3C8', 'R3C9'], // #5
  ['R4C9', 'R4C8'], // #6
  ['R6C6', 'R5C6', 'R4C6', 'R4C7', 'R5C7', 'R7C6', 'R7C5'], // #7
  ['R6C5', 'R5C5', 'R4C5', 'R3C5', 'R3C4'], // #8
  ['R4C4', 'R5C4', 'R6C4'], // #9
  ['R2C1', 'R2C2', 'R2C3', 'R3C3'], // #10
  ['R3C1', 'R3C2'], // #11
  ['R4C1', 'R5C1', 'R6C1'], // #12
  ['R4C2', 'R5C2', 'R6C2', 'R6C3', 'R5C3', 'R4C3'], // #13
  ['R8C2', 'R8C3'], // #14
  ['R9C1', 'R9C2'], // #15
  ['R9C3', 'R9C4'], // #16
  ['R9C5'], // #17
  ['R9C6', 'R9C7', 'R9C8'], // #18
  ['R9C9'], // #19
  ['R8C9', 'R8C8'], // #20
  ['R7C8', 'R7C9', 'R6C9'], // #21
  ['R6C8', 'R6C7', 'R7C7'], // #22
  ['R8C6', 'R8C5'], // #23
  ['R8C4'], // #24
];

// Per purple line, the ordered cage indices it walks through (derived as
// described above from the drawn line paths against the cage cell lists).
const lineGroups = [
  [0, 1], // line #0, k=2
  [2, 7, 8, 9, 13], // line #1, k=5
  [12, 11, 10], // line #2, k=3
  [4, 3, 5, 6], // line #3, k=4
  [22, 21, 20], // line #4, k=3
  [19, 18, 17, 16, 15], // line #5, k=5
  [14, 24, 23], // line #6, k=3
];

const cageConstraints = cages.map(cells => new Cage(0, ...cells));

const totalPairs = lineGroups.reduce(
  (acc, group) => acc + group.length * (group.length - 1) / 2, 0);
const diffVars = new Var('D', 'cage-total pairwise differences', totalPairs);

const pairConstraints = [];
let dIndex = 0;
for (const group of lineGroups) {
  const k = group.length;
  for (let i = 0; i < k; i++) {
    for (let j = i + 1; j < k; j++) {
      dIndex++;
      const dCell = diffVars.cell(dIndex);
      const cellsA = cages[group[i]];
      const cellsB = cages[group[j]];
      const allowed = [];
      for (let v = 1; v <= 9; v++) {
        const diff = v - 5;
        if (diff !== 0 && Math.abs(diff) <= k - 1) allowed.push(v);
      }
      pairConstraints.push(
        new Sum(
          -5,
          ...cellsA.map(c => [c, 1]),
          ...cellsB.map(c => [c, -1]),
          [dCell, -1]),
        new Given(dCell, ...allowed));
    }
  }
}

return [
  new Shape('9x9'),
  diffVars,
  ...cageConstraints,
  ...pairConstraints,
];
