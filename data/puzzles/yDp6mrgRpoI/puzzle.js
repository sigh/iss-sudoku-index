// Title: Messing with Mark's Head
// Author: ProwlingTiger
// Video: https://www.youtube.com/watch?v=yDp6mrgRpoI
// Source: https://cracking-the-cryptic.web.app/sudoku/NP224HdrF4

// Normal sudoku rules apply (standard rows/columns/3x3 boxes, no givens).
// 17 killer cages cover 59 of the 81 cells; each cage's digits are all
// different and sum to its printed total, except a 9 in the cage
// contributes 0 to that sum instead of 9 ("9 counts as zero").
//
// Cage cells and totals are transcribed from the puzzle's drawn cage
// geometry (source coordinates converted to 1-indexed R#C# here).
const CAGES = [
  { total: 17, cells: [[1, 1], [2, 1], [3, 1], [3, 2], [2, 2]] },
  { total: 11, cells: [[1, 3], [1, 4], [2, 4]] },
  { total: 19, cells: [[3, 3], [3, 4], [3, 5], [2, 5]] },
  { total: 6, cells: [[1, 5], [1, 6]] },
  { total: 3, cells: [[3, 6], [3, 7]] },
  { total: 12, cells: [[1, 8], [1, 9], [2, 9]] },
  { total: 10, cells: [[2, 8], [3, 8], [4, 8], [4, 9]] },
  { total: 9, cells: [[5, 8], [6, 8], [6, 9], [5, 9]] },
  { total: 18, cells: [[4, 7], [5, 7], [6, 7], [7, 7]] },
  { total: 18, cells: [[7, 8], [8, 8], [8, 9], [9, 9]] },
  { total: 13, cells: [[7, 5], [7, 6]] },
  { total: 16, cells: [[8, 5], [9, 5], [8, 6], [9, 6]] },
  { total: 24, cells: [[7, 2], [7, 3], [8, 3], [9, 3], [9, 4], [8, 4]] },
  { total: 9, cells: [[8, 1], [9, 1], [9, 2]] },
  { total: 14, cells: [[6, 1], [6, 2], [5, 2]] },
  { total: 15, cells: [[4, 4], [5, 4]] },
  { total: 14, cells: [[5, 6], [4, 6], [4, 5], [5, 5]] },
];

// The grid's value range is widened to 0-9 so an "effective value" overlay
// (VE) can hold 0 for a 9. Real grid cells are restricted back to 1-9 with
// Given below; box tiling comes from the 9x9 grid, not the alphabet, so
// this does not change the box regions.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const cageIds = CAGES.map(({ cells }) => cells.map(([r, c]) => makeCellId(r, c)));
const cageCells = cageIds.flat();

// One VE cell per cage cell: the value that cell contributes to its cage's
// sum. Tied to the real digit by a Pair per cell -- Pair applies to
// consecutive pairs, so each call here is given exactly the one (digit,
// effective-value) pair it should link. fnToKey is built from the widened
// 0-9 shape so its 10-value truth table matches the actual grid alphabet
// (a truth table sized for the wrong value count silently misreads values).
const effective = graph.makeOverlay('VE', cageCells);
const effectiveKey = Pair.fnToKey(
  (digit, val) => (digit === 9 ? val === 0 : val === digit),
  shape);
const effectiveLinks = cageCells.map(cell =>
  new Pair(effectiveKey, 'effective cage value', cell, effective.at(cell)));

const cageConstraints = CAGES.flatMap(({ total }, i) => [
  new AllDifferent(...cageIds[i]),
  new Sum(total, ...effective.at(cageIds[i])),
]);

// One template Given, shifted onto every grid cell, restricts the real
// digits back to 1-9 (the widened shape's default range is 0-9). The
// matching template on the VE overlay restricts each effective value to 0-8.
const digitRange = graph.makeReplicate(new Given(makeCellId(1, 1), 1, 2, 3, 4, 5, 6, 7, 8, 9));
const effectiveRange = effective.makeReplicate(new Given(effective.cells()[0], 0, 1, 2, 3, 4, 5, 6, 7, 8));

return [
  shape,
  effective.toVar('effective cage values'),
  digitRange,
  effectiveRange,
  ...effectiveLinks,
  ...cageConstraints,
];
