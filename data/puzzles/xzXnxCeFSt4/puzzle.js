// Title: Counting Killers
// Author: Yawnus
// Video: https://www.youtube.com/watch?v=xzXnxCeFSt4
// Source: https://sudokupad.app/aaardvutyh

// Each cage has no repeated digits. For every possible cage total N, the
// number of cages summing to N is either 0 or exactly N.
//
// Model each cage total as a Var cell, then use CountingCircles on those Vars.

const cages = [
  ["R7C1", "R7C2", "R7C3"],
  ["R8C1", "R9C1"],
  ["R8C2", "R9C2"],
  ["R8C3", "R9C3"],
  ["R7C7", "R8C7", "R9C7"],
  ["R7C8", "R7C9"],
  ["R8C8", "R8C9"],
  ["R9C8", "R9C9"],
  ["R7C4", "R8C4", "R9C4"],
  ["R8C6", "R9C5", "R9C6"],
  ["R1C4", "R2C4"],
  ["R1C5", "R2C5"],
  ["R1C6", "R1C7"],
  ["R1C8", "R2C8"],
  ["R2C9", "R3C9", "R4C9"],
  ["R6C6", "R7C5", "R7C6"],
  ["R5C5", "R5C6"],
  ["R4C6", "R4C7"],
  ["R5C3", "R6C3", "R6C4"],
  ["R3C3", "R3C4"],
  ["R2C2", "R3C2"],
  ["R4C1", "R5C1"],
];

const graph = cellGraph("9x9");

function range(from, to) {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

const cageTotalsVar = new Var("K", "cage totals", cages.length);

function cageTotalVar(index) {
  return cageTotalsVar.cell(index + 1);
}

function cageTotalSum(cells, index) {
  return new EqualSum(cells, [cageTotalVar(index)]);
}

const givenTargets = graph.cells();
const givenOrigin = givenTargets[0];

const cageConstraints = cages.flatMap((cells, index) => [
  new AllDifferent(...cells),
  cageTotalSum(cells, index),
]);

return [
  new Shape("9x9", 16),
  cageTotalsVar,
  new Replicate(
    [new Given(givenOrigin, ...range(1, 9))],
    Replicate.encodeTargetCells(givenTargets, givenOrigin, graph),
    givenOrigin,
  ),
  ...cageConstraints,
  new CountingCircles(...cages.map((_, index) => cageTotalVar(index))),
];
