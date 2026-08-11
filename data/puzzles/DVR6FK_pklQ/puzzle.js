// Title: Vault Construction
// Author: the_cogito
// Video: https://www.youtube.com/watch?v=DVR6FK_pklQ
// Source: https://app.crackingthecryptic.com/sudoku/d8Qpr2r36t

// Standard sudoku (digits 1-9 once per row and column) plus:
// - Regions are not given: the solver must discover nine orthogonally
//   connected 9-cell regions, each holding every digit once, in place of
//   boxes. ChaosConstruction expresses exactly this, so NoBoxes drops the
//   default 3x3 boxes.
// - Seven "vault" cages are drawn (no printed total on any of them).
//   Digits MAY repeat within a vault, so no all-different constraint is
//   added over a vault's own cells.
// - Any digit that occurs anywhere inside a vault may not occur in any
//   cell orthogonally adjacent to that vault -- including a cell that
//   belongs to a different vault, since the rule only exempts the vault's
//   own cells.
// - The largest digit in a vault equals the number of distinct discovered
//   regions with at least one cell inside that vault.

const shape = new Shape('9x9');
const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC'); // one region-label cell per grid cell

// Vault cell lists, transcribed from the drawn cages (none carries a
// printed total, matching a vault having no sum).
const VAULTS = [
  ['R9C8', 'R9C9'],
  ['R7C1', 'R7C2', 'R7C3', 'R8C3', 'R9C3'],
  ['R5C1', 'R4C2', 'R5C2', 'R6C2'],
  ['R2C2'],
  ['R3C6'],
  ['R5C4', 'R5C5', 'R6C5'],
  ['R9C6', 'R8C6', 'R8C7', 'R7C6', 'R7C7', 'R7C8', 'R7C9', 'R6C9', 'R6C8',
    'R6C7', 'R6C6', 'R5C8', 'R5C9'],
];

// One aux cell per vault. CountDistinct pins it to the number of distinct
// CC region labels among the vault's cells; the >=/== pairs below pin the
// same cell to the vault's own largest digit. Tying both to one cell is
// what encodes "largest digit == region count".
const vaultMax = new Var('M', 'vault max digit', VAULTS.length);

const geKey = Pair.fnToKey((a, b) => a >= b, shape);
const eqKey = Pair.fnToKey((a, b) => a === b, shape);

const vaultRegionCounts = VAULTS.flatMap((vault, i) => {
  const control = vaultMax.cell(i + 1);
  return [
    new CountDistinct(control, ...cc.at(vault)),
    ...vault.map(v => new Pair(geKey, 'vault max >= cell', control, v)),
    new Or(vault.map(v => new Pair(eqKey, 'vault max == cell', control, v))),
  ];
});

// No digit occurring in a vault may occur in a cell orthogonally adjacent
// to that vault. Because a vault's own digits may repeat, this has to be
// pairwise (border cell, vault cell) rather than one AllDifferent over the
// vault plus its border, which would also force the vault's own cells
// apart -- exactly what the rules say is allowed.
const vaultBorders = VAULTS.flatMap(vault => {
  const inVault = new Set(vault);
  const border = new Set();
  for (const cell of vault) {
    for (const n of graph.neighbours(cell)) {
      if (!inVault.has(n)) border.add(n);
    }
  }
  return [...border].flatMap(n => vault.map(v => new AllDifferent(n, v)));
});

return [
  shape,
  new ChaosConstruction(),
  new NoBoxes(),
  new Given('R4C5', 6),
  new Given('R4C8', 3),
  new Given('R8C5', 3),
  new Given('R8C8', 9),
  vaultMax,
  ...vaultBorders,
  ...vaultRegionCounts,
];
