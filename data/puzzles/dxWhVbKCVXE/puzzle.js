// Title: Welcome, 2025!
// Author: Gliperal
// Video: https://www.youtube.com/watch?v=dxWhVbKCVXE
// Source: https://sudokupad.app/hr2psfhzcz

// Rules encoded here, in full:
//   - Normal sudoku rules apply.
//   - Digits may not repeat in a cage.
//   - A cage carrying a clue in its top left corner must be divided into
//     1-, 2-, 3- and/or 4-digit numbers that sum to that clue. A number is
//     read from horizontally adjacent digits left-to-right, or from
//     vertically adjacent digits top-to-bottom; numbers cannot bend. Every
//     digit of the cage belongs to exactly one number, and no number crosses
//     a cage border.
// The grid has no given digits. Nothing is omitted.

// The seven cages, transcribed from the drawn outlines. Six carry the clue
// 2025 in their top left cell; the block at R6C6-R8C8 carries no clue, so only
// the no-repeat rule applies to it. R2C2-R4C4 and R6C2-R8C4 are the two 3x3
// blocks drawn with a solid wall rather than a dashed outline; each shows its
// 2025 label inside its top left cell, exactly as the four dashed cages do.
const CAGES = [
  { total: 2025, cells: 'R1C1 R1C2 R1C3 R1C4 R1C5 R1C6 R1C7 R2C1 R3C1' },
  { total: 2025, cells: 'R2C2 R2C3 R2C4 R3C2 R3C3 R3C4 R4C2 R4C3 R4C4' },
  { total: 2025, cells: 'R1C8 R2C8 R3C8 R4C8 R2C6 R3C6 R4C6 R3C5 R4C7' },
  { total: 2025, cells: 'R4C1 R5C1 R5C2 R5C3 R5C4 R5C5 R5C6 R5C7 R6C1' },
  { total: 2025, cells: 'R6C2 R6C3 R6C4 R7C2 R7C3 R7C4 R8C2 R8C3 R8C4' },
  { total: 2025, cells: 'R7C1 R8C1 R9C1 R9C2 R9C3 R9C4 R9C5 R9C6 R9C7' },
  { total: 0, cells: 'R6C6 R6C7 R6C8 R6C9 R7C6 R7C7 R7C8 R8C6 R8C8' },
].map(c => ({ total: c.total, cells: c.cells.split(' ') }));

// Every run of 1-4 cells that could be read as one number inside this cage:
// rightwards along a row, or downwards along a column, stopping as soon as the
// next cell leaves the cage (a number may not cross a cage border). A run of
// one cell is the same run either way, so it is emitted once, with the
// rightward pass.
const numberRuns = (cellSet) => [...cellSet].flatMap(id => {
  const { row, col } = parseCellId(id);
  return [[0, 1], [1, 0]].flatMap(([dRow, dCol]) => {
    const runs = [];
    const run = [];
    for (let i = 0; i < 4; i++) {
      const next = makeCellId(row + i * dRow, col + i * dCol);
      if (!cellSet.has(next)) break;
      run.push(next);
      if (run.length > 1 || dCol === 1) runs.push([...run]);
    }
    return runs;
  });
});

// Every way to divide the cage into such numbers, i.e. every exact cover of its
// cells by runs. Branching only on the runs that start at the first still
// uncovered cell (reading order) reaches each division exactly once: a run's
// own first cell is its earliest cell in reading order, so the run covering the
// earliest uncovered cell must begin there.
const numberDivisions = (cells) => {
  const cellSet = new Set(cells);
  const order = [...cells].sort((a, b) => {
    const p = parseCellId(a), q = parseCellId(b);
    return (p.row - q.row) || (p.col - q.col);
  });
  const runsByFirstCell = new Map(order.map(id => [id, []]));
  for (const run of numberRuns(cellSet)) runsByFirstCell.get(run[0]).push(run);

  const divisions = [];
  const covered = new Set();
  const extend = (division) => {
    const first = order.find(id => !covered.has(id));
    if (first === undefined) return void divisions.push(division);
    for (const run of runsByFirstCell.get(first)) {
      if (run.some(id => covered.has(id))) continue;
      run.forEach(id => covered.add(id));
      extend([...division, run]);
      run.forEach(id => covered.delete(id));
    }
  };
  extend([]);
  return divisions;
};

// The cage total as a linear equation over its cells: the k-th cell of an
// n-cell run holds the 10^(n-1-k) place of that n-digit number. A division
// into nine 1-digit numbers is a plain unweighted Sum.
// Sum rejects a coefficient above 100, so the 1000s place of a 4-digit number
// is passed as ten terms of 100 on the same cell; Sum adds the coefficients of
// a repeated cell together, giving that cell coefficient 1000.
const sumTerms = (division) => {
  if (division.every(run => run.length === 1)) return division.flat();
  return division.flatMap(
    run => run.flatMap((id, k) => {
      const place = Math.pow(10, run.length - 1 - k);
      return place > 100
        ? Array.from({ length: place / 100 }, () => [id, 100])
        : [[id, place]];
    }));
};

// Which division is used is the solver's to find, so each clued cage is the
// disjunction over all of them: 170, 257, 96, 143, 257 and 170 divisions for
// the six cages above, 1093 in total.
const cageTotals = CAGES.filter(c => c.total).map(
  c => new Or(numberDivisions(c.cells).map(
    division => new Sum(c.total, ...sumTerms(division)))));

// "Digits may not repeat in cages", for every cage including the unclued one.
// A clued cage's 2025 is a total over numbers, not over digits, so the cage is
// AllDifferent rather than a Cage carrying that total.
const cageDistinct = CAGES.map(c => new AllDifferent(...c.cells));

return [
  new Shape('9x9'),
  ...cageDistinct,
  ...cageTotals,
];
