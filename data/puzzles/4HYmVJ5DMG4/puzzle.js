// Title: Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=4HYmVJ5DMG4
// Source: https://app.crackingthecryptic.com/dRHQpQP937

// Normal sudoku rules. Every cage forbids repeats among its own cells; a cage
// with a printed total must also sum to it (Cage), one with no printed total
// only forbids repeats (AllDifferent) -- both are real cages, not decoration.
//
// Five edge marks show "relationships between the totals of some cages": each
// sits on the border shared by two cages and compares those two cages' totals,
// not the two flanking cells' digits. Three are drawn "=" and ">" for a
// horizontally-shared edge; two are drawn as that same wedge rotated 90
// degrees to fit a vertically-shared edge ("v" = top cage bigger, "^" = bottom
// cage bigger) -- in every case the wedge's point sits against the smaller
// total, exactly like an ordinary "<"/">" sign.
//
// Two of the five comparisons are between two cages that both lack a printed
// total, so the gap between them can reach 14 (two 2-cell cages, ranges 3-17
// each) -- above the grid's own 1-9 range. The whole shape is widened to 14
// values to hold that gap in a Var cell, and every playable grid cell is
// restricted back down to 1-9.

const graph = cellGraph('9x9');

// Cage cell groups that feed a comparison mark, named for the comment below.
const CageA = ['R1C3', 'R1C4'];                          // total 7
const CageB = ['R2C4', 'R3C4'];                          // no total
const CageD = ['R2C1', 'R2C2'];                          // no total
const CageE = ['R3C1', 'R4C1'];                          // no total
const CageG = ['R5C1', 'R6C1', 'R7C1'];                  // no total
const CageH = ['R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2'];  // total 23
const CageF = ['R4C8', 'R4C7', 'R5C7'];                  // no total
const CageI = ['R5C8', 'R5C9'];                          // no total
const CageJ = ['R6C7', 'R6C8'];                          // no total

// Every cage, transcribed from the payload's cage list (30 real cages; the
// geometry summary's `cages:30`), as [cells, total-or-null].
const cages = [
  [['R1C1', 'R1C2'], 5],
  [CageA, 7],
  [['R1C6', 'R1C7'], 13],
  [['R2C3', 'R3C3'], 17],
  [['R2C6', 'R3C6', 'R3C5'], 9],
  [CageD, null],
  [CageB, null],
  [['R1C5', 'R2C5'], null],
  [['R2C7', 'R3C7', 'R3C8'], null],
  [['R1C8', 'R1C9', 'R2C9', 'R2C8'], null],
  [['R3C9', 'R4C9'], null],
  [CageE, null],
  [CageG, null],
  [CageH, 23],
  [['R4C3', 'R4C4'], 12],
  [['R5C3', 'R6C3', 'R7C3', 'R7C4', 'R7C5'], 27],
  [['R5C4', 'R6C4', 'R6C5'], null],
  [['R4C5', 'R4C6', 'R5C5', 'R5C6'], 23],
  [['R6C6', 'R7C6'], 10],
  [CageF, null],
  [CageI, null],
  [CageJ, null],
  [['R6C9', 'R7C9'], 9],
  [['R7C7', 'R7C8'], 3],
  [['R8C1', 'R8C2', 'R9C2', 'R9C1'], 16],
  [['R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7'], 30],
  [['R9C3', 'R9C4', 'R9C5'], null],
  [['R9C6', 'R9C7'], 6],
  [['R8C8', 'R9C8'], 13],
  [['R8C9', 'R9C9'], 11],
];

const cageConstraints = cages.map(([cells, total]) =>
  total === null ? new AllDifferent(...cells) : new Cage(total, ...cells));

// A cage of n distinct digits from 1-9 sums between these two bounds.
const minCageSum = n => (n * (n + 1)) / 2;
const maxCageSum = n => n * 9 - (n * (n - 1)) / 2;

// A slack cell holds (bigger total - smaller total) for one comparison,
// restricted to the values that gap can actually reach. The Sum equation
// pins it to the one value the real totals force, so it adds no freedom of
// its own to the search. Two forms: both sides an unknown-total cage (bound
// by cell count alone), or one side a printed constant.
const lo = 1; // strict inequality: bigger total exceeds smaller by >= 1
const gapBothVariable = (biggerCells, smallerCells) => {
  const hi = maxCageSum(biggerCells.length) - minCageSum(smallerCells.length);
  return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
};
const gapConstantBigger = (constant, smallerCells) => {
  const hi = constant - minCageSum(smallerCells.length);
  return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
};
const gapConstantSmaller = (biggerCells, constant) => {
  const hi = maxCageSum(biggerCells.length) - constant;
  return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
};

const gap = new Var('S', 'cage total gap', 4);
const [gap1, gap2, gap3, gap4] = gap.cells();

const comparisons = [
  // "v" edge(R1C4,R2C4): top cage (A, total 7) > bottom cage (B, no total).
  new Given(gap1, ...gapConstantBigger(7, CageB)),
  new Sum(7, ...CageB, gap1),                          // sum(B) + gap1 = 7

  // "v" edge(R2C1,R3C1): top cage (D, no total) > bottom cage (E, no total).
  // D = E + gap2, as an equal-sum over {D cells} and {E cells, gap2}.
  new Given(gap2, ...gapBothVariable(CageD, CageE)),
  new EqualSum(CageD, [...CageE, gap2]),

  // ">" edge(R5C1,R5C2): left cage (G, no total) > right cage (H, total 23).
  new Given(gap3, ...gapConstantSmaller(CageG, 23)),
  new Sum(23, ...CageG, [gap3, -1]),                   // sum(G) - gap3 = 23

  // "=" edge(R4C8,R5C8): cage F (no total) equals cage I (no total).
  new EqualSum(CageF, CageI),

  // "^" edge(R5C8,R6C8): top cage (I, no total) < bottom cage (J, no total).
  // J = I + gap4, as an equal-sum over {J cells} and {I cells, gap4}.
  new Given(gap4, ...gapBothVariable(CageJ, CageI)),
  new EqualSum(CageJ, [...CageI, gap4]),
];

return [
  new Shape('9x9', 14),
  // Grid cells stay real 1-9 digits; only the Var slack cells use the
  // widened 10-14 range.
  graph.makeReplicate(new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  ...cageConstraints,
  gap,
  ...comparisons,
];
