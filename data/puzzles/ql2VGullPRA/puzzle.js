// Title: Shady Equation
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=ql2VGullPRA
// Source: https://sudokupad.app/eep49o4qx6

// Normal 6x6 Sudoku, Yin-Yang shading, shaded-digit counts, and the five
// drawn quadruple circles are encoded below.
const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('6x6');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const shade = graph.makeOverlay('VS');
const firstShade = shade.cells()[0];

// Every overlay cell is one of the two Yin-Yang shades.
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

// Each 2x2 must contain both shades. The state collects its four shade values.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// For each digit d, scan every grid digit followed by its shade. A shaded d
// exists exactly when the total number of shaded d cells is d; zero is allowed.
function shadedDigitCount(digit) {
  const machine = NFA.encodeSpec({
    startState: { phase: 'digit', count: 0 },
    transition: ({ phase, count, hit }, value) => {
      if (phase === 'digit') {
        return { phase: 'shade', count, hit: value === digit };
      }
      const next = count + (hit && value === SHADED ? 1 : 0);
      return next > digit ? undefined : { phase: 'digit', count: next };
    },
    accept: ({ phase, count }) => phase === 'digit' &&
      (count === 0 || count === digit),
  }, geometry.numValues);
  return new NFA(machine, `shaded-${digit}-count`,
    ...gridCells.flatMap(cell => [cell, shade.at(cell)]));
}

// Quadruple entries are the values drawn in each indicated 2x2 circle.
const quadruples = [
  new Quad('R2C2', 1, 1, 6, 6),
  new Quad('R4C2', 2, 3, 4),
  new Quad('R2C4', 2, 3, 4),
  new Quad('R4C4', 1, 3, 4),
  new Quad('R3C3', 2, 3),
];

return [
  new Shape('6x6'),
  shade.toVar('shade'),
  shadeDomain,
  // Each shade is one orthogonally connected Yin-Yang region.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...[1, 2, 3, 4, 5, 6].map(shadedDigitCount),
  ...quadruples,
];
