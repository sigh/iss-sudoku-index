// Title: Red Lodge, Montana
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=Zpc-km_WLUg
// Source: https://sudokupad.app/3wy1bsu95d

// Digits 0-8 occur once per row, column, and 3x3 box. Each drawn circle's
// label occurs in its surrounding 2x2 block and equals its shaded-cell count;
// question-mark labels are independent 0-4 variables. Unshaded cells are
// connected, and adjacent unshaded digits differ by at least 5.

const SHADED = 1;
const UNSHADED = 2;
const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');

// Drawn circle labels, keyed by the top-left cell of each surrounding 2x2 block.
const circles = [
  ['R1C1', 3], ['R1C2', null], ['R1C6', 4], ['R3C3', null],
  ['R3C5', 0], ['R3C6', null], ['R3C8', 3], ['R4C1', 1],
  ['R4C8', 2], ['R5C5', 1], ['R5C6', 3], ['R6C8', 2],
  ['R7C1', 0], ['R7C6', 3], ['R7C8', 1], ['R8C3', 3], ['R8C8', 3],
];
const circleVars = new Var('VC', 'circle labels', circles.length);
const targets = circleVars.cells();

// The NFA reads target, four shade flags, then four surrounding digits. It
// accepts exactly when the target is the shade count and appears in the block.
const circleMachine = NFA.encodeSpec({
  startState: { pos: 0, target: null, count: 0, found: false },
  transition: ({ pos, target, count, found }, value) => {
    if (pos === 0) return { pos: 1, target: value, count: 0, found: false };
    if (pos <= 4) return { pos: pos + 1, target, count: count + (value === SHADED), found };
    const next = { pos: pos + 1, target, count, found: found || value === target };
    if (next.pos === 9 && (count !== target || !next.found)) return undefined;
    return next;
  },
  accept: ({ pos, target, count, found }) => pos === 9 && target <= 4 && count === target && found,
  maxDepth: 9,
}, 9, { valueOffset: -1 });

const shadeDomain = shade.makeReplicate(new Given(shade.cells()[0], SHADED, UNSHADED));
const circleRules = circles.flatMap(([topLeft, label], i) => {
  const cells = graph.block(topLeft, 2, 2);
  return [
    ...(label === null ? [new Given(targets[i], 0, 1, 2, 3, 4)] : [new Given(targets[i], label)]),
    new NFA(circleMachine, 'circle-count', targets[i], ...shade.at(cells), ...cells),
  ];
});

// This NFA reads two shade flags and their two adjacent digits. It rejects only
// an unshaded pair whose digits differ by less than 5.
const neighbourMachine = NFA.encodeSpec({
  startState: { pos: 0, shades: [] },
  transition: ({ pos, shades, firstDigit }, value) => {
    if (pos < 2) return { pos: pos + 1, shades: [...shades, value] };
    if (pos === 2) return { pos: 3, shades, firstDigit: value };
    if (shades[0] === UNSHADED && shades[1] === UNSHADED && Math.abs(value - firstDigit) < 5) return undefined;
    return { pos: 4, shades, firstDigit };
  },
  accept: ({ pos }) => pos === 4,
  maxDepth: 4,
}, 9, { valueOffset: -1 });
const neighbourRules = graph.cells().flatMap(a => graph.neighbours(a)
  .filter(b => a < b)
  .map(b => new NFA(neighbourMachine, 'unshaded-difference', shade.at(a), shade.at(b), a, b)));

return [
  new Shape('9x9', '0-8'),
  shade.toVar('shade'),
  circleVars,
  new Given('R1C9', 8),
  shadeDomain,
  new ConnectedValues('VS', UNSHADED),
  ...circleRules,
  ...neighbourRules,
];
