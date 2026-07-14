// Title: Sorry, That Sum Is Taken
// Author: PhoenixAki
// Video: https://www.youtube.com/watch?v=dlpn7pSvd-c
// Source: https://sudokupad.app/yove1nvv0o

// Killer cages: digits are all-different (standard killer-cage convention;
// the rules text never repeats it) and sum to the given total. A total is a
// fixed number, a strict inequality, or entirely unlabelled -- every one of
// those is still a real sum. Region sum lines: box borders split a line into
// segments that must all share one sum (native RegionSumLine).
//
// Sum uniqueness: every cage total and every line's shared value is distinct
// from every other, across the whole puzzle -- the title mechanic. Raw
// magnitudes run past ISS's 16-value cell-domain cap (the biggest unlabelled
// cage can reach 35), so each of the 19 totals is tied by a coefficient Sum
// to a base-10 (tens, ones) Var pair -- tens in 0-3, ones in 0-9, stored as
// value-1 since ISS cell values start at 1 -- and every pair of totals is
// required to differ in tens or in ones.

const rangeI = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

// Killer cages, in payload order. `exact`/`min`+`max` describe the label;
// `min`/`max` bound the achievable all-different sum for the cage's size,
// narrowed by the inequality. No bound at all means "no total shown" -- the
// natural all-different range is the only restriction.
const cages = [
  { cells: ['R9C5', 'R9C6'], min: 15, max: 17 },                          // "> 14"
  { cells: ['R5C9', 'R6C9'], min: 15, max: 17 },                          // "> 14"
  { cells: ['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R6C4'], min: 15, max: 18 },  // "< 19"
  { cells: ['R7C1', 'R8C1'], min: 13, max: 17 },                          // "> 12"
  { cells: ['R1C7', 'R1C8'], min: 13, max: 17 },                          // "> 12"
  { cells: ['R5C1', 'R6C1'], exact: 8 },                                  // "8"
  { cells: ['R1C5', 'R1C6'], min: 11, max: 17 },                          // "> 10"
  { cells: ['R1C9'] },                                                    // no total, 1 cell
  { cells: ['R7C8', 'R8C7', 'R8C8'] },                                    // no total, 3 cells
  { cells: ['R2C2', 'R2C3', 'R3C3'] },                                    // no total, 3 cells
  { cells: ['R3C9'] },                                                    // no total, 1 cell
  { cells: ['R2C7', 'R2C8', 'R2C9', 'R3C7', 'R3C8'] },                    // no total, 5 cells
];

// Region sum lines, in drawn order. `order` is the whole path (RegionSumLine
// auto-splits it at box borders); `segment` is one box-bounded run of that
// same line -- its sum equals the line's shared value, used only to tie the
// sum-uniqueness total below.
const lines = [
  {
    order: ['R4C3', 'R4C2', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R2C4', 'R3C4'],
    segment: ['R4C3', 'R4C2'],
  },
  { order: ['R8C9', 'R7C9', 'R6C8', 'R6C7', 'R5C6'], segment: ['R8C9', 'R7C9'] },
  { order: ['R9C8', 'R9C7', 'R8C6', 'R7C6', 'R6C5'], segment: ['R9C8', 'R9C7'] },
  { order: ['R6C6', 'R7C7'], segment: ['R6C6'] },
  { order: ['R6C3', 'R7C4'], segment: ['R6C3'] },
  { order: ['R3C6', 'R4C7'], segment: ['R3C6'] },
  { order: ['R6C2', 'R7C3'], segment: ['R6C2'] },
];

const cageConstraints = cages.flatMap(({ cells, exact, min, max }) => {
  if (cells.length === 1) return [];
  if (exact !== undefined) return [new Cage(exact, ...cells)];
  const distinct = new AllDifferent(...cells);
  if (min === undefined) return [distinct];
  return [distinct, new Or(rangeI(min, max).map(t => new Sum(t, ...cells)))];
});

const lineConstraints = lines.map(({ order }) => new RegionSumLine(...order));

// Sum-uniqueness Vars: one (tens, ones) pair per cage and per line.
const valueCellGroups = [
  ...cages.map(c => c.cells),
  ...lines.map(l => l.segment),
];
const totalsCount = valueCellGroups.length;

const tens = new Var('T', 'cage/line total tens digit (0-3, stored as value-1)', totalsCount);
const ones = new Var('U', 'cage/line total ones digit (0-9, stored as value-1)', totalsCount);

const tieConstraints = valueCellGroups.map((cells, i) => (
  // sum(cells) = 10*(tens-1) + (ones-1)
  new Sum(-11, ...cells, [tens.cell(i + 1), -10], [ones.cell(i + 1), -1])
));

const distinctTotals = [];
for (let i = 0; i < totalsCount; i++) {
  for (let j = i + 1; j < totalsCount; j++) {
    distinctTotals.push(new Or([
      new AllDifferent(tens.cell(i + 1), tens.cell(j + 1)),
      new AllDifferent(ones.cell(i + 1), ones.cell(j + 1)),
    ]));
  }
}

const graph = cellGraph('9x9');
const gridCells = graph.cells();
const gridOrigin = gridCells[0];

return [
  new Shape('9x9', 10),
  // Every grid cell plays 1-9 despite the extended (0-3)/(0-9) Var domains
  // above; one Given template Replicated over the whole grid.
  graph.makeReplicate(new Given(gridOrigin, ...rangeI(1, 9))),
  tens,
  ones,
  ...tens.cells().map(cell => new Given(cell, 1, 2, 3, 4)), // digit 0-3
  ...cageConstraints,
  ...lineConstraints,
  ...tieConstraints,
  ...distinctTotals,
  new WhiteDot('R7C1', 'R8C1'),
  new BlackDot('R1C2', 'R1C3'),
];
