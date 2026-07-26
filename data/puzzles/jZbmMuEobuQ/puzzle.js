// Title: Smallest Chaotic Killer
// Author: Belamis
// Video: https://www.youtube.com/watch?v=jZbmMuEobuQ
// Source: https://sudokupad.app/frb3c5cxkr

// Killer cages: digits in a cage are all different and sum to the cage's
// total, shown at the cage's top-left cell. Chaos Construction: the grid
// divides into nine orthogonally-connected 9-cell regions (undrawn -- the
// solver deduces them), each containing 1-9 once; this replaces the default
// 3x3 boxes. Cage meta-rule: the smallest digit in a cage equals the number
// of distinct regions its cells belong to.
//
// ChaosConstruction is the native ISS handler for the unknown regions
// (region size = numValues = 9 automatically); NoBoxes drops the default
// box groups it would otherwise sit alongside.
//
// The meta-rule reduces to two pieces per cage: CountDistinct ties an aux
// Var to the cage's distinct-region count (as in the row/block-diversity
// puzzles), and, because that count must equal a *derived* value -- the
// cage's own minimum digit, not a constant -- a small custom NFA ties the
// Var to that minimum. It reads [auxVar, ...cageCells]: the first value
// becomes the target, later values track the running minimum, and it
// accepts only when the final minimum equals the target. One compiled
// machine is reused for every cage regardless of size.

const cc = cellGraph('9x9').makeOverlay('CC');

// Cage cells (top-left-to-bottom-right, as listed in the payload's `cages`
// array) and totals.
const CAGES = [
  { total: 20, cells: ['R1C2', 'R2C1', 'R2C2'] },
  { total: 11, cells: ['R3C1', 'R4C1'] },
  { total: 8, cells: ['R1C4', 'R1C5', 'R2C4'] },
  { total: 25, cells: ['R7C2', 'R8C2', 'R9C1', 'R9C2'] },
  { total: 11, cells: ['R6C3', 'R7C3', 'R8C3'] },
  { total: 19, cells: ['R3C5', 'R3C6', 'R3C7'] },
  { total: 13, cells: ['R7C6', 'R8C5', 'R8C6', 'R9C5'] },
  { total: 19, cells: ['R4C9', 'R5C9', 'R6C9'] },
  { total: 5, cells: ['R1C7', 'R2C7'] },
  { total: 10, cells: ['R8C7', 'R9C7'] },
  { total: 19, cells: ['R4C5', 'R5C4', 'R5C5', 'R5C6'] },
  { total: 10, cells: ['R7C7', 'R7C8'] },
  { total: 11, cells: ['R1C9', 'R2C9', 'R3C9'] },
];

const minEqualsTargetNFA = NFA.encodeSpec({
  startState: { target: null, min: null },
  transition({ target, min }, value) {
    if (target === null) return { target: value, min: null };
    return { target, min: min === null ? value : Math.min(min, value) };
  },
  accept: ({ target, min }) => target !== null && min === target,
}, 9);

const distinctRegionCount = new Var('D', 'cage distinct region count', CAGES.length);

const cageConstraints = CAGES.flatMap(({ total, cells }, i) => {
  const control = distinctRegionCount.cell(i + 1);
  return [
    new Cage(total, ...cells),
    new CountDistinct(control, ...cc.at(cells)),
    new NFA(minEqualsTargetNFA, 'CageMinEqualsRegionDiversity', control, ...cells),
  ];
});

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  distinctRegionCount,
  ...cageConstraints,
];
