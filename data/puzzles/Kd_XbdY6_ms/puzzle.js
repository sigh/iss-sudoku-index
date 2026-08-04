// Title: Ninja Palindromes
// Author: Testarossa
// Video: https://www.youtube.com/watch?v=Kd_XbdY6_ms
// Source: https://app.crackingthecryptic.com/sudoku/F7GPt8n2ff

// Rules encoded: standard sudoku; the R4C2 given; nine Sandwich outside
// clues (sum of the digits strictly between the 1 and the 9 in that
// row/column); eight marked circles pair up into four solver-discovered
// lines that run orthogonally through the grid and never touch themselves,
// each other, or an unconnected circle orthogonally ("Lines cannot cross or
// touch themselves or other lines or circles orthogonally"); "Lines cannot
// be diagonal" is met by construction, since the model only ever links
// orthogonal neighbours; a line cannot pass through the same cell as
// another line, so "cannot cross" needs no separate rule either; "No digit
// appears more than twice on any line" is encoded per discovered line.
// OMITTED: "Lines must be valid palindromes".

const OFF = 1;
const COLORS = [2, 3, 4, 5]; // the four discovered lines, one colour each

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const color = graph.makeOverlay('VC');

// Circle centres, row-major order (the eight rounded grey-filled circles
// drawn with no printed text).
const circles = [
  'R2C8', 'R3C5', 'R5C2', 'R5C5', 'R5C9', 'R6C7', 'R7C6', 'R9C2',
];
const circleSet = new Set(circles);

// Every colour cell is OFF or one of the four line colours.
const colorDomain = color.makeReplicate(
  new Given(color.cells()[0], OFF, ...COLORS));

// --- Degree: a circle has exactly one same-coloured orthogonal neighbour
// (so every circle is on-line, forming one end of its pair); any other
// cell is OFF (zero same-coloured neighbours) or has exactly two (an
// interior line cell). Reads the cell's own colour, then each orthogonal
// neighbour's colour, counting neighbours that match the cell's own colour;
// pairing "different colours adjacent" is forbidden separately below, so a
// same-coloured match is exactly a used line step.
function degreeMachine(requiredDegree, allowOff) {
  return NFA.encodeSpec({
    startState: { phase: 'start' },
    transition: ({ phase, ownColor, count }, value) => {
      if (phase === 'start') {
        if (value === OFF) {
          return allowOff ? { phase: 'off' } : undefined;
        }
        return { phase: 'on', ownColor: value, count: 0 };
      }
      if (phase === 'off') return { phase: 'off' };
      const next = count + (value === ownColor ? 1 : 0);
      return next > requiredDegree ? undefined : { phase: 'on', ownColor, count: next };
    },
    accept: ({ phase, count }) => phase === 'off' || count === requiredDegree,
  }, geometry.numValues);
}
const endpointDegree = degreeMachine(1, false);
const pathDegree = degreeMachine(2, true);
const degrees = gridCells.map(cell => new NFA(
  circleSet.has(cell) ? endpointDegree : pathDegree,
  'degree', ...color.at([cell, ...graph.neighbours(cell)])));

// --- No touching between different lines (or a line and an unpaired
// circle): two orthogonally adjacent cells must share a colour unless one
// is OFF. Combined with the degree rule above (which already forbids a
// same-coloured cell from having more than its required count of
// same-coloured neighbours), this is also what stops a line touching
// itself. One template per edge direction (right-step, down-step covers
// every grid edge once), stamped by Replicate onto every cell that has
// such a neighbour.
const colorMatch = Pair.fnToKey(
  (a, b) => a === OFF || b === OFF || a === b, geometry.numValues);
const horizTargets = color.at(gridCells.filter(cell => graph.step(cell, 0, 1)));
const vertTargets = color.at(gridCells.filter(cell => graph.step(cell, 1, 0)));
const noTouch = [
  color.makeReplicate(
    new Pair(colorMatch, 'no line touch', color.at('R1C1'), color.at('R1C2')),
    horizTargets),
  color.makeReplicate(
    new Pair(colorMatch, 'no line touch', color.at('R1C1'), color.at('R2C1')),
    vertTargets),
];

// --- Each line colour is a single connected region. Combined with the
// degree rule (circles degree 1, other line cells degree 2, all
// max-degree-2), a connected component containing a degree-1 cell can only
// be a simple path with exactly two degree-1 ends, so this also proves
// each colour pairs exactly two circles -- there is no need to separately
// force "each colour used exactly twice".
const connectivity = COLORS.map(c => new ConnectedValues('VC', c));

// --- Canonical colour order, breaking the 4!-way relabelling symmetry of
// the four interchangeable line colours (an artifact of this encoding, not
// a rule the puzzle states): reading the circles in row-major order, a
// colour not seen yet must be the next one after the highest colour seen
// so far.
const canonicalOrderMachine = NFA.encodeSpec({
  startState: { nextLabel: COLORS[0] },
  transition: ({ nextLabel }, value) => {
    if (value > nextLabel) return undefined;
    return { nextLabel: value === nextLabel ? nextLabel + 1 : nextLabel };
  },
  accept: () => true,
}, geometry.numValues);
const canonicalOrder = new NFA(
  canonicalOrderMachine, 'canonical line order', ...color.at(circles));

// --- No digit appears more than twice on any line: one small NFA per
// (colour, digit), scanning every grid cell's (colour, digit) pair in
// row-major order and rejecting a third occurrence of that digit on that
// colour.
const noRepeatFlatCells = gridCells.flatMap(cell => [color.at(cell), cell]);
function makeNoRepeat(targetColor, targetDigit) {
  const machine = NFA.encodeSpec({
    startState: { phase: 'color', count: 0, pendingColor: null },
    transition: (state, value) => {
      if (state.phase === 'color') {
        return { phase: 'digit', count: state.count, pendingColor: value };
      }
      const match = state.pendingColor === targetColor && value === targetDigit;
      const next = state.count + (match ? 1 : 0);
      return next > 2 ? undefined : { phase: 'color', count: next, pendingColor: null };
    },
    accept: ({ phase }) => phase === 'color',
  }, geometry.numValues);
  return new NFA(machine, `no-repeat-${targetColor}-${targetDigit}`, ...noRepeatFlatCells);
}
const noRepeats = COLORS.flatMap(c => Array.from(
  { length: 9 }, (_, i) => makeNoRepeat(c, i + 1)));

// --- Sandwich outside clues: sum of the digits strictly between the 1 and
// the 9 in that row/column (the nine text badges drawn outside the grid).
const sandwiches = [
  Sandwich.fromCells(4, graph.row(6), geometry),
  Sandwich.fromCells(21, graph.row(7), geometry),
  Sandwich.fromCells(16, graph.row(8), geometry),
  Sandwich.fromCells(9, graph.row(9), geometry),
  Sandwich.fromCells(27, graph.column(1), geometry),
  Sandwich.fromCells(35, graph.column(5), geometry),
  Sandwich.fromCells(23, graph.column(6), geometry),
  Sandwich.fromCells(3, graph.column(7), geometry),
  Sandwich.fromCells(6, graph.column(8), geometry),
];

return [
  new Shape('9x9'),
  new Given('R4C2', 1),
  color.toVar('color'),
  colorDomain,
  ...degrees,
  ...noTouch,
  ...connectivity,
  canonicalOrder,
  ...noRepeats,
  ...sandwiches,
];
