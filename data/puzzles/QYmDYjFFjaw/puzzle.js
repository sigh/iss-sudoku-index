// Title: Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=QYmDYjFFjaw
// Source: https://sudokupad.app/RHTpHdtdJ2

// Normal sudoku rules. Every cage forbids repeats among its own cells; a cage
// with a printed total must also sum to it (Cage), one with no printed total
// only forbids repeats (AllDifferent) -- both are real cages, not decoration.
//
// Four small badges sit on borders shared by two cages and compare those two
// cages' totals, not the two flanking cells' digits: "<"/">" read normally on
// a left/right border, and the wedge's point sits against the smaller total
// on a top/bottom border ("=" for equal, "v" with the tip on the bottom cage)
// -- the drawn glyphs and edges: "<" on R1C7|R1C8, ">" on R2C5|R2C6, "=" on
// R3C3|R4C3, "v" on R8C8|R9C8.
//
// Two of the four comparisons are between two cages that both lack a printed
// total, so the gap between them can reach 14 (two 2-cell cages, ranges 3-17
// each) -- above the grid's own 1-9 range. The whole shape is widened to 14
// values to hold that gap in a Var cell, and every playable grid cell is
// restricted back down to 1-9.

const graph = cellGraph('9x9');

// Cage cell groups that feed a comparison mark, named for the comments below.
const CageA = ['R1C6', 'R1C7'];          // no total; "<" side
const CageB = ['R1C8', 'R2C8', 'R2C9', 'R1C9']; // total 15; "<" side
const CageC = ['R1C5', 'R2C5'];          // no total; ">" left side
const CageD = ['R2C6', 'R2C7'];          // no total; ">" right side
const CageE = ['R3C1', 'R3C2', 'R3C3'];  // no total; "=" side
const CageF = ['R4C3', 'R4C4'];          // no total; "=" side
const CageG = ['R8C8', 'R8C9'];          // no total; "v" top side
const CageH = ['R9C8', 'R9C9'];          // no total; "v" bottom side

// Every cage, transcribed from the payload's cage list (32 real cages; the
// geometry summary's `cages:32`), as [cells, total-or-null].
const cages = [
  [['R1C1', 'R2C1'], 12],
  [['R1C2', 'R2C2'], null],
  [['R1C3', 'R2C3'], 9],
  [CageE, null],
  [['R4C1', 'R4C2'], 7],
  [CageF, null],
  [['R1C4', 'R2C4'], null],
  [CageC, null],
  [CageA, null],
  [CageD, null],
  [CageB, 15],
  [['R3C6', 'R3C7', 'R4C7', 'R4C6'], 24],
  [['R3C4', 'R3C5'], 5],
  [['R3C8', 'R4C8'], 7],
  [['R3C9', 'R4C9'], 11],
  [['R4C5', 'R5C5', 'R5C6'], 17],
  [['R5C8', 'R5C9'], 10],
  [['R6C8', 'R6C9'], 14],
  [['R5C7', 'R6C7'], null],
  [['R6C6', 'R7C6'], 6],
  [['R5C4', 'R6C4', 'R6C5'], 10],
  [['R5C2', 'R5C3', 'R6C3'], 19],
  [['R5C1', 'R6C1'], 11],
  [['R6C2', 'R7C2', 'R7C3', 'R8C3', 'R8C4'], 29],
  [['R7C1', 'R8C1', 'R8C2', 'R9C1', 'R9C2', 'R9C3'], 27],
  [['R9C4', 'R9C5'], 9],
  [['R7C4', 'R7C5', 'R8C5'], 13],
  [['R8C6', 'R9C6'], null],
  [['R7C7', 'R8C7', 'R9C7'], null],
  [['R7C8', 'R7C9'], null],
  [CageG, null],
  [CageH, null],
];

const cageConstraints = cages.map(([cells, total]) =>
  total === null ? new AllDifferent(...cells) : new Cage(total, ...cells));

// A cage of n distinct digits from 1-9 sums between these two bounds.
const minCageSum = n => (n * (n + 1)) / 2;
const maxCageSum = n => n * 9 - (n * (n - 1)) / 2;

// A slack cell holds (bigger total - smaller total) for one comparison,
// restricted to the values that gap can actually reach. The Sum/EqualSum
// equation pins it to the one value the real totals force, so it adds no
// freedom of its own to the search. Two forms below: both sides an
// unknown-total cage (bound by cell count alone), or one side a printed
// constant.
const lo = 1; // strict inequality: bigger total exceeds smaller by >= 1
const gapBothVariable = (biggerCells, smallerCells) => {
  const hi = maxCageSum(biggerCells.length) - minCageSum(smallerCells.length);
  return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
};
const gapConstantBigger = (constant, smallerCells) => {
  const hi = constant - minCageSum(smallerCells.length);
  return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
};

const gap = new Var('S', 'cage total gap', 3);
const [gap1, gap2, gap3] = gap.cells();

const comparisons = [
  // "<" edge(R1C7,R1C8): left cage (A, no total) < right cage (B, total 15).
  // B = A + gap1, i.e. sum(A) + gap1 = 15.
  new Given(gap1, ...gapConstantBigger(15, CageA)),
  new Sum(15, ...CageA, gap1),

  // ">" edge(R2C5,R2C6): left cage (C, no total) > right cage (D, no total).
  // C = D + gap2, as an equal-sum over {C cells} and {D cells, gap2}.
  new Given(gap2, ...gapBothVariable(CageC, CageD)),
  new EqualSum(CageC, [...CageD, gap2]),

  // "=" edge(R3C3,R4C3): cage E (no total) equals cage F (no total).
  new EqualSum(CageE, CageF),

  // "v" edge(R8C8,R9C8): top cage (G, no total) > bottom cage (H, no total).
  // G = H + gap3, as an equal-sum over {G cells} and {H cells, gap3}.
  new Given(gap3, ...gapBothVariable(CageG, CageH)),
  new EqualSum(CageG, [...CageH, gap3]),
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
