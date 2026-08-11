// Title: Growth
// Author: Nordy
// Video: https://www.youtube.com/watch?v=ZxFfZK21qFs
// Source: https://app.crackingthecryptic.com/sudoku/pjnH2jdDRT

// Rules encoded here:
//  - Normal sudoku.
//  - Fifteen drawn 2-cell cages, each of which grows into one orthogonally
//    adjacent cell to become a 3-cell cage (the payload's `cages`, each a
//    domino with a corner total). The clue is the sum of all three digits;
//    digits do not repeat within a cage; cages never share a cell, whether
//    with another cage's drawn cells or its own grown cell. Which adjacent
//    cell each cage grows into is not given -- it is solved for.
// Nothing is omitted.

const graph = cellGraph('9x9');

// The 15 drawn 2-cell cages, as [total, [cell1, cell2]] (payload `cages`).
const cageClues = [
  [6, ['R1C1', 'R2C1']],
  [10, ['R1C3', 'R2C3']],
  [10, ['R3C2', 'R4C2']],
  [11, ['R1C5', 'R1C6']],
  [15, ['R2C6', 'R2C7']],
  [6, ['R3C4', 'R3C5']],
  [12, ['R1C8', 'R1C9']],
  [15, ['R3C8', 'R3C9']],
  [10, ['R4C7', 'R5C7']],
  [13, ['R6C8', 'R6C9']],
  [12, ['R5C3', 'R5C4']],
  [15, ['R6C1', 'R6C2']],
  [14, ['R9C1', 'R9C2']],
  [13, ['R7C7', 'R7C8']],
  [8, ['R8C9', 'R9C9']],
];

// A cell already drawn as part of some cage can never also be the growth cell
// of another (or the same) cage -- it is already spoken for.
const baseCells = new Set(cageClues.flatMap(([, cells]) => cells));

// A cage's growth-cell candidates: cells orthogonally adjacent to either of
// its own two cells, excluding its own cells and every cage's drawn cells.
const candidatesFor = (cells) => {
  const seen = new Set();
  const result = [];
  for (const cell of cells) {
    for (const neighbour of graph.neighbours(cell)) {
      if (cells.includes(neighbour)) continue;
      if (baseCells.has(neighbour)) continue;
      if (seen.has(neighbour)) continue;
      seen.add(neighbour);
      result.push(neighbour);
    }
  }
  return result;
};
const candidateLists = cageClues.map(([, cells]) => candidatesFor(cells));

// One selector Var per cage, holding the 1-based index into that cage's own
// candidate list -- which adjacent cell it grows into. All candidate counts
// are <= 9 (checked below), so the default 1-9 grid range covers it; no
// widened Shape is needed.
if (candidateLists.some(cands => cands.length > 9)) {
  throw new Error('a cage has more than 9 growth candidates');
}
const growth = new Var('G', 'cage growth choice', cageClues.length);
const growthCells = growth.cells();
const range = n => Array.from({ length: n }, (_, i) => i + 1);

// No two cages may grow into the same physical cell. For every pair of cages
// whose candidate lists share a cell, forbid both from choosing their
// matching index at once.
const noSharedGrowth = [];
for (let i = 0; i < cageClues.length; i++) {
  for (let j = i + 1; j < cageClues.length; j++) {
    candidateLists[i].forEach((cell, a) => {
      const b = candidateLists[j].indexOf(cell);
      if (b === -1) return;
      noSharedGrowth.push(new Or([
        new Given(growthCells[i], ...range(candidateLists[i].length).filter(x => x !== a + 1)),
        new Given(growthCells[j], ...range(candidateLists[j].length).filter(x => x !== b + 1)),
      ]));
    });
  }
}

return [
  new Shape('9x9'),
  growth,

  // Each cage picks one candidate to grow into: the selector names the index,
  // and the resulting 3 cells form a Cage (distinct digits, given sum).
  ...cageClues.map(([total, cells], i) => new Or(
    candidateLists[i].map((candidate, idx) => new And([
      new Given(growthCells[i], idx + 1),
      new Cage(total, ...cells, candidate),
    ]))
  )),
  ...noSharedGrowth,
];
