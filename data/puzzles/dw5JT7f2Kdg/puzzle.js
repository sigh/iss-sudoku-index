// Title: Square Dance
// Author: Cris Moore
// Video: https://www.youtube.com/watch?v=dw5JT7f2Kdg
// Source: https://app.crackingthecryptic.com/sudoku/F2LtPfMmLQ

// Normal sudoku rules apply. Nine cells are "multipliers": one per row,
// column and box, their positions not drawn and left for the solver to find.
// A multiplier appearing in a cage multiplies the sum of the cage's other
// digits to produce the printed total; a multiplier outside every cage has
// no effect. The nine multiplier digits form a permutation of 1-9 ("each
// digit appears as a multiplier once"). Every cage sits entirely inside one
// box (one cage per box), so cage-internal all-different is already implied
// by the box and needs no separate statement.
//
// Two overlays read "<" between horizontally adjacent cells and one reads
// "^" on a vertical edge; the rules say an inequality mark points at the
// smaller of its two digits, so the vertical "^" is that same convention
// rotated (apex towards the cell above).

const graph = cellGraph('9x9');
const boxes = graph.boxes();

// One flag cell per grid cell: 1 = not this box's multiplier, 2 = is.
const flags = graph.makeOverlay('VM');
const flag = cell => flags.at(cell);

// One digit-value cell per box, holding that box's multiplier's digit.
const multDigit = new Var('MB', 'box multiplier digit', 9);

// Cage geometry, transcribed from the source's nine 2x2-block cage clues.
const CAGES = [
  { cells: ['R1C2', 'R2C2', 'R2C3', 'R1C3'], total: 16 },
  { cells: ['R1C5', 'R2C5', 'R2C6', 'R1C6'], total: 25 },
  { cells: ['R2C8', 'R3C8', 'R3C9', 'R2C9'], total: 36 },
  { cells: ['R4C1', 'R5C1', 'R5C2', 'R4C2'], total: 49 },
  { cells: ['R5C4', 'R6C4', 'R6C5', 'R5C5'], total: 9 },
  { cells: ['R5C7', 'R6C7', 'R6C8', 'R5C8'], total: 16 },
  { cells: ['R8C1', 'R9C1', 'R9C2', 'R8C2'], total: 64 },
  { cells: ['R8C4', 'R9C4', 'R9C5', 'R8C5'], total: 81 },
  { cells: ['R7C8', 'R8C8', 'R8C9', 'R7C9'], total: 64 },
];

// Every flag cell is 1 (not-multiplier) or 2 (multiplier), stamped once and
// replicated to every cell.
const flagDomains = flags.makeReplicate(new Given(flags.cells()[0], 1, 2));

// Exactly one multiplier per row / column / box.
const oneMultiplierPerGroup = [
  ...graph.rows(), ...graph.columns(), ...boxes,
].map(cells => new ContainExact(
  Array(cells.length - 1).fill(1).concat(2).join('_'),
  ...flags.at(cells),
));

// Tie each box's multDigit Var to whichever of its cells is flagged: the
// flag=1 branch is vacuous, so only the (unique, by the constraint above)
// flag=2 cell forces multDigit == that cell's digit.
const multDigitLinks = boxes.flatMap((cells, i) => cells.map(cell => new Or([
  new Given(flag(cell), 1),
  new SameValues(2, cell, multDigit.cell(i + 1)),
])));

// "Each digit appears as a multiplier once": the nine box-multiplier digits
// form a permutation of 1-9.
const multDigitAllDifferent = new AllDifferent(...multDigit.cells());

// A cage is either untouched by its box's multiplier (plain sum -- box
// all-different already forces the cage's own cells distinct) or contains
// it (branch over the multiplier's concrete digit d so each branch is a
// plain linear Sum on the remaining three cells).
function cageConstraint(cells, total) {
  const plain = new And([
    ...cells.map(c => new Given(flag(c), 1)),
    new Sum(total, ...cells),
  ]);
  const withMultiplier = cells.flatMap((multCell, idx) => {
    const others = cells.filter((_, j) => j !== idx);
    const branches = [];
    for (let d = 1; d <= 9; d++) {
      if (total % d !== 0) continue;
      branches.push(new And([
        new Given(flag(multCell), 2),
        ...others.map(c => new Given(flag(c), 1)),
        new Given(multCell, d),
        new Sum(total / d, ...others),
      ]));
    }
    return branches;
  });
  return new Or([plain, ...withMultiplier]);
}
const cageConstraints = CAGES.map(({ cells, total }) => cageConstraint(cells, total));

// Inequality overlays -- edge(R4C1,R4C2) "<", edge(R7C8,R7C9) "<",
// edge(R5C6,R6C6) "^" -- each pointing at the smaller cell.
const inequalities = [
  new GreaterThan('R4C2', 'R4C1'),
  new GreaterThan('R7C9', 'R7C8'),
  new GreaterThan('R6C6', 'R5C6'),
];

return [
  new Shape('9x9'),
  flags.toVar('multiplier-cell flags'),
  multDigit,
  flagDomains,
  ...oneMultiplierPerGroup,
  ...multDigitLinks,
  multDigitAllDifferent,
  ...cageConstraints,
  ...inequalities,
];
