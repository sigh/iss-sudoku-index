// Title: Outbreak!!
// Author: Flinty
// Video: https://www.youtube.com/watch?v=0wLbn7F7T4g
// Source: https://sudokupad.app/0zhq0og7uz

// Rules encoded, in full:
//  - Normal sudoku, plus the two given digits.
//  - Zombie cages. Each outlined region is only the cage's starting cells; the
//    real cage is that seed plus at least one further cell, each added cell
//    orthogonally connected to the cage, so the real cage is an orthogonally
//    connected superset of its seed. (Reading the growth as "adjacent to the
//    original outline" instead caps R5C5's cage at its four neighbours, five
//    cells, which cannot reach the printed total of 45.) The real cage's digits
//    are all different and sum to the total printed in the seed's top-left
//    corner. Different cages may not share cells.
// Nothing is omitted. The green outlines drawn over the cages are decoration:
// they retrace the same 15 cage boundaries and state no extra rule.

const OUT = 10;                       // overlay code for "not in the R5C5 cage"
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// The value range is widened to 10 so the R5C5 overlay below has a code for
// "outside the cage" that is not a digit; grid cells are put back to 1-9.
const shape = new Shape('9x9', OUT);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

// Drawn clues: each cage's outlined starting cells and its corner total.
const DRAWN_CAGES = [
  { seed: ['R1C1'], total: 5 },
  { seed: ['R1C5', 'R1C6'], total: 8 },
  { seed: ['R2C2'], total: 10 },
  { seed: ['R2C4', 'R3C4'], total: 8 },
  { seed: ['R2C8'], total: 6 },
  { seed: ['R4C1', 'R5C1'], total: 8 },
  { seed: ['R4C7', 'R4C8'], total: 8 },
  { seed: ['R5C5'], total: 45 },
  { seed: ['R5C9', 'R6C9'], total: 8 },
  { seed: ['R6C2', 'R6C3'], total: 8 },
  { seed: ['R7C6', 'R8C6'], total: 8 },
  { seed: ['R8C2'], total: 9 },
  { seed: ['R8C8'], total: 11 },
  { seed: ['R9C4', 'R9C5'], total: 8 },
  { seed: ['R9C9'], total: 5 },
];

// A cage of n cells holds n different digits, so its total lies between
// 1+2+...+n and 9+8+...+(10-n). With "grows by at least one cell" that fixes
// how large each cage can be: total 8 on a two-cell seed is three cells and
// nothing else, total 45 is all nine digits, and so on.
const minCageSum = (n) => (n * (n + 1)) / 2;
const maxCageSum = (n) => (n * (19 - n)) / 2;
const cageSizes = ({ seed, total }) => {
  const sizes = [];
  for (let n = seed.length + 1; n <= 9; n++) {
    if (minCageSum(n) <= total && total <= maxCageSum(n)) sizes.push(n);
  }
  return sizes;
};

// Every cage's seed always belongs to that cage, so no other cage can reach a
// seed cell.
const seedCells = new Set(DRAWN_CAGES.flatMap((cage) => cage.seed));

// All orthogonally connected supersets of `seed` up to `maxSize` cells, avoiding
// other cages' seeds. Sets are keyed by their sorted cell list to dedupe the
// different growth orders that reach the same shape.
const growShapes = (seed, maxSize) => {
  const shapes = new Map([[[...seed].sort().join(), seed]]);
  let frontier = [seed];
  while (frontier.length) {
    const next = [];
    for (const cells of frontier) {
      if (cells.length >= maxSize) continue;
      for (const cell of cells) {
        for (const nb of graph.neighbours(cell)) {
          if (cells.includes(nb) || seedCells.has(nb)) continue;
          const grown = [...cells, nb].sort();
          const key = grown.join();
          if (shapes.has(key)) continue;
          shapes.set(key, grown);
          next.push(grown);
        }
      }
    }
    frontier = next;
  }
  return [...shapes.values()];
};

// The R5C5 cage (total 45) is the one cage too large to enumerate: nine
// different digits summing to 45 are exactly 1-9, and there are tens of
// thousands of nine-cell shapes around R5C5. It gets the overlay model below
// instead; every other cage is small enough to list outright.
const cages = DRAWN_CAGES.map((cage) => {
  const sizes = cageSizes(cage);
  const enumerable = Math.max(...sizes) <= 4;
  return {
    ...cage,
    sizes,
    shapes: enumerable
      ? growShapes(cage.seed, Math.max(...sizes)).filter(
        (cells) => sizes.includes(cells.length))
      : null,
  };
});
const listedCages = cages.filter((cage) => cage.shapes);
const overlayCage = cages.find((cage) => !cage.shapes);

// --- The R5C5 cage -------------------------------------------------------
// One overlay cell per grid cell: it repeats the grid digit when that cell is
// in the cage, and holds OUT when it is not. So "nine different digits summing
// to 45" becomes "each of 1-9 appears exactly once in the overlay", and the
// cage's shape is whichever cells are not OUT.
const zombie = graph.makeOverlay('VZ');
const zombieVar = zombie.toVar('R5C5 cage');
const inCageKey = Pair.fnToKey((digit, code) => code === OUT || code === digit,
  shape);
const zombieCodes = gridCells.map(
  (cell) => new Pair(inCageKey, 'digit-or-out', cell, zombie.at(cell)));
const zombieContents = new ContainExact(DIGITS.join('_'), ...zombie.cells());
const zombieConnected = new ConnectedValues('VZ', DIGITS.join('_'));
const zombieSeed = new Given(zombie.at(overlayCage.seed[0]), ...DIGITS);
// Other cages' seeds are always taken, so they are never in this cage.
const zombieBlocked = [...seedCells]
  .filter((cell) => cell !== overlayCage.seed[0])
  .map((cell) => new Given(zombie.at(cell), OUT));

// --- Cages may not share cells -------------------------------------------
// A cell that only one listed cage can ever reach needs nothing. For a cell
// two or three listed cages could grow into, one extra variable records which
// of them took it: value j means the jth of that cell's claimants, and the
// last value means none of them. Each claimant's chosen shape sets that
// variable, so two cages claiming the same cell need two different values of
// it at once, which is impossible.
const claimants = new Map();
for (const cage of listedCages) {
  for (const cell of new Set(cage.shapes.flat())) {
    if (cage.seed.includes(cell)) continue;
    if (!claimants.has(cell)) claimants.set(cell, []);
    claimants.get(cell).push(cage);
  }
}
const contested = [...claimants.keys()].filter(
  (cell) => claimants.get(cell).length > 1).sort();
const ownerVar = new Var('W', 'contested cells', contested.length);
const ownerCell = new Map(contested.map((cell, i) => [cell, ownerVar.cell(i + 1)]));
const ownerDomain = contested.map((cell) => new Given(
  ownerCell.get(cell),
  ...claimants.get(cell).map((_, i) => i + 1), claimants.get(cell).length + 1));

// --- The listed cages ----------------------------------------------------
// One Or per cage over every shape the rules allow it to have. Each branch
// fixes the digits of that shape, keeps the R5C5 cage out of it, and records
// the branch's claim on each contested cell it could reach.
const listedCageRules = listedCages.map((cage) => new Or(
  cage.shapes.map((cells) => {
    const grown = cells.filter((cell) => !cage.seed.includes(cell));
    const claims = contested
      .filter((cell) => claimants.get(cell).includes(cage))
      .map((cell) => {
        const index = claimants.get(cell).indexOf(cage) + 1;
        const values = cells.includes(cell)
          ? [index]
          : claimants.get(cell).map((_, i) => i + 1)
            .concat(claimants.get(cell).length + 1)
            .filter((value) => value !== index);
        return new Given(ownerCell.get(cell), ...values);
      });
    return new And([
      new Cage(cage.total, ...cells),
      ...grown.map((cell) => new Given(zombie.at(cell), OUT)),
      ...claims,
    ]);
  })));

return [
  shape,
  zombieVar,
  ownerVar,
  digitDomain,
  new Given('R1C9', 8),
  new Given('R9C1', 1),
  ...zombieCodes,
  zombieContents,
  zombieConnected,
  zombieSeed,
  ...zombieBlocked,
  ...ownerDomain,
  ...listedCageRules,
];
