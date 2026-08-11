// Title: Constructing A Murder Scene
// Author: Mr.Menace
// Video: https://www.youtube.com/watch?v=NiAMnQgfuOk
// Source: https://app.crackingthecryptic.com/sudoku/bHjLRDRG48

// Standard sudoku (digits 1-9 once per row/column) plus solver-constructed
// regions: nine orthogonally-connected 9-cell regions, each holding every
// digit once (ChaosConstruction + NoBoxes in place of the fixed 3x3 boxes).
//
// Cages: digits sum to the printed total and cannot repeat within a cage
// (killer-cage semantics -- `Cage`). Cage cells not covered by any drawn
// cage carry no cage rule.
//
// Cage/region correspondence: "every region contains cells from exactly two
// cages and cells in one cage are distributed across exactly two regions."
// This is a mutual degree-2 condition on the bipartite incidence between the
// 9 drawn cages and the 9 solver-discovered regions. Per cage two auxiliary
// `VRA`/`VRB` cells hold the two distinct region labels its cells actually
// use: every cage cell's region label is forced into {A, B} (an `Or` of the
// two equalities), A != B, and each of A, B is realised by at least one cage
// cell (another `Or`), so together they are exactly the cage's two touched
// regions -- no more, no fewer. Stacking every cage's A/B pair into one
// 18-cell group and requiring each of the 9 region labels to appear exactly
// twice (`ContainExact`) is then exactly "every region is touched by exactly
// two cages": each occurrence of a region label among the 18 slots is one
// cage that touches that region (a cage can supply at most one occurrence of
// a given label, since its own A != B).

const cc = cellGraph('9x9').makeOverlay('CC');

// Cage cells, transcribed from the drawn cage outlines and their printed
// top-left totals.
const CAGES = [
  { sum: 41, cells: ['R3C2', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R2C3'] },
  { sum: 29, cells: ['R1C4', 'R2C4', 'R3C4', 'R3C3', 'R4C3', 'R4C2', 'R4C1'] },
  { sum: 33, cells: ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R5C6'] },
  { sum: 29, cells: ['R1C9', 'R1C8', 'R2C8', 'R2C7'] },
  { sum: 12, cells: ['R3C9', 'R3C8', 'R4C8', 'R5C8'] },
  { sum: 30, cells: ['R5C3', 'R5C2', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R8C2'] },
  { sum: 24, cells: ['R6C3', 'R6C2', 'R7C2'] },
  { sum: 11, cells: ['R7C3', 'R8C3'] },
  { sum: 24, cells: ['R7C4', 'R8C4', 'R8C5'] },
];

const cages = CAGES.map(({ sum, cells }) => new Cage(sum, ...cells));

// Two region-label Vars per cage: the pair of distinct region labels its
// cells actually use.
const regionA = new Var('RA', 'Cage region A', CAGES.length);
const regionB = new Var('RB', 'Cage region B', CAGES.length);

const cageRegionLinks = CAGES.flatMap(({ cells }, i) => {
  const a = regionA.cell(i + 1);
  const b = regionB.cell(i + 1);
  const ccCells = cc.at(cells);
  return [
    new AllDifferent(a, b),
    // Every cage cell's region label is A or B.
    ...ccCells.map(cell => new Or([
      new SameValues(2, cell, a),
      new SameValues(2, cell, b),
    ])),
    // Both A and B are actually used by some cage cell (not a phantom label).
    new Or(ccCells.map(cell => new SameValues(2, cell, a))),
    new Or(ccCells.map(cell => new SameValues(2, cell, b))),
  ];
});

// Every region label 1-9 appears exactly twice across all cages' A/B slots:
// exactly two cages touch each region.
const regionTouchCounts = new ContainExact(
  '1_1_2_2_3_3_4_4_5_5_6_6_7_7_8_8_9_9',
  ...regionA.cells(), ...regionB.cells(),
);

return [
  new Shape('9x9'),
  new Given('R1C4', 4),
  new Given('R4C1', 1),
  new Given('R5C6', 8),
  new Given('R9C3', 4),
  new Given('R9C7', 7),
  new ChaosConstruction(),
  new NoBoxes(),
  ...cages,
  regionA,
  regionB,
  ...cageRegionLinks,
  regionTouchCounts,
];
