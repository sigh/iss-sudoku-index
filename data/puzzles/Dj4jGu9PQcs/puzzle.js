// Title: There's Sum-thing In The Shadows
// Author: sujoyku and ChinStrap
// Video: https://www.youtube.com/watch?v=Dj4jGu9PQcs
// Source: https://sudokupad.app/fhfgpia0vy

// Normal sudoku, no givens. Yin-Yang: shade cells so all shaded cells form
// one orthogonally-connected region and all unshaded cells form another,
// with no 2x2 area entirely one shade. Yin-Yang borders split each line into
// 2+ same-sum segments with no repeated digit inside a segment, and every
// line must contain both shades. Some lines carry a segment-counter circle
// giving the total number of segments on that line.
//
// ENCODED HERE: normal sudoku; a per-cell shade Var (1 = unshaded,
// 2 = shaded); the local "no 2x2 area is monochrome" rule; and, for the 9
// lines whose geometry is unambiguous, "the line contains both shades".
//
// ENCODED HERE (continued): global Yin-Yang connectivity -- one
// ConnectedValues constraint per shade over the whole-grid shade overlay.
//
// OMITTED: (1) Segment sums, the no-repeat-digit-per-segment rule, and the
// segment-counter digits -- segment boundaries are dynamic (defined by the
// unknown shade Var along each line), which needs NFA state well past the
// engine's fixed budget for lines/loops of comparable size. (2) "Every line
// contains both shades" for the two lines that cross at R1C3 -- their true
// drawn structure is ambiguous, so both are left unconstrained.

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const shadeOf = cell => shade.at(cell);
const gridCells = graph.cells();

const UNSHADED = 1;
const SHADED = 2;

// Reusable "not all the same value" NFA over a 2-valued domain.
const notAllSameNFA = NFA.encodeSpec({
  startState: null,
  transition: (state, v) => state === null
    ? { first: v, allSame: true }
    : { first: state.first, allSame: state.allSame && v === state.first },
  accept: (state) => state !== null && !state.allSame,
}, SHADED);

// No 2x2 block is entirely shaded or entirely unshaded. Every block is a
// uniform-offset shift of the top-left block, so encode it once and
// replicate it over every anchor cell whose block stays on-grid.
const monoBlockOrigin = shadeOf('R1C1');
const monoBlockTemplate = new NFA(notAllSameNFA, 'no-monochrome-2x2',
  shadeOf('R1C1'), shadeOf('R1C2'), shadeOf('R2C1'), shadeOf('R2C2'));
const monoBlockAnchors = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) {
    monoBlockAnchors.push(shadeOf(makeCellId(r, c)));
  }
}

// Every line contains shaded and unshaded cells -- applied to the 9 lines
// whose geometry is unambiguous (see the header comment for the 2 excluded
// lines near R1C3).
const linesWithConfirmedShapeOnly = [
  ['R1C5', 'R1C6', 'R1C7'],
  ['R1C6', 'R2C6'],
  ['R1C9', 'R2C8', 'R3C7', 'R4C7', 'R4C8', 'R3C8'],
  ['R5C8', 'R6C9', 'R7C9', 'R8C8'],
  ['R9C8', 'R9C7', 'R9C6', 'R9C5', 'R8C5', 'R8C4', 'R9C4'],
  ['R8C7', 'R7C7', 'R6C7', 'R5C7', 'R6C8'],
  ['R3C1', 'R3C2', 'R4C2', 'R5C3'],
  ['R2C4', 'R3C4', 'R4C3', 'R4C4', 'R5C4'],
  ['R4C6', 'R4C5', 'R5C5', 'R6C5', 'R7C4', 'R7C3', 'R7C2', 'R8C2', 'R9C1'],
];

// Every cell is UNSHADED or SHADED: one Given template stamped over every
// grid cell via the shade overlay.
function shadeDomainConstraints() {
  const targets = gridCells.map(shadeOf);
  return [new Replicate(
    [new Given(targets[0], UNSHADED, SHADED)],
    Replicate.encodeTargetCells(targets, targets[0], shade),
    targets[0])];
}

return [
  new Shape('9x9'),
  shade.toVar('yin-yang shade'),
  ...shadeDomainConstraints(),
  new Replicate(
    [monoBlockTemplate],
    Replicate.encodeTargetCells(monoBlockAnchors, monoBlockOrigin, shade),
    monoBlockOrigin,
  ),
  // Yin-Yang global connectivity: shaded cells form one orthogonally-connected
  // region, and unshaded cells form another.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  ...linesWithConfirmedShapeOnly.map(line =>
    new NFA(notAllSameNFA, 'line-both-shades', ...line.map(shadeOf))
  ),
];
