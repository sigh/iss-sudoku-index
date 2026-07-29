// Title: The End of Daisies
// Author: Abdul the Killer
// Video: https://www.youtube.com/watch?v=PXgoZf3Pg28
// Source: https://sudokupad.app/9mne4c61lf

// Standard Sudoku. A shade means this cell is exactly one greater than at
// least one king-adjacent cell in its own 3x3 box. Shaded and unshaded cells
// are each connected, no 2x2 is monochrome, and every possible daisy is drawn.

const SHADED = 1;
const UNSHADED = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const shade = graph.makeOverlay('VS');

// Drawn daisy data from the background artwork; each daisy is also a given.
const daisies = [
  ['R1C1', 1], ['R1C8', 2], ['R2C2', 3], ['R3C3', 4], ['R3C7', 6],
  ['R5C1', 2], ['R5C7', 7], ['R5C8', 3], ['R6C1', 3], ['R7C4', 3],
  ['R8C5', 4], ['R8C9', 2], ['R9C2', 2],
];
const daisySet = new Set(daisies.map(([cell]) => cell));

// One compact machine per box-neighbour count. It reads shade, this digit,
// then its box neighbours; its final state requires shade iff a neighbour is
// one less than this digit.
function shadeMachine(neighbourCount) {
  return NFA.encodeSpec({
    startState: { pos: 0, shade: null, digit: null, found: false },
    transition: (state, value) => {
      if (state.pos === 0) {
        return { pos: 1, shade: value, digit: null, found: false };
      }
      if (state.pos === 1) {
        return { pos: 2, shade: state.shade, digit: value, found: false };
      }
      return {
        pos: state.pos + 1,
        shade: state.shade,
        digit: state.digit,
        found: state.found || state.digit === value + 1,
      };
    },
    accept: state => state.pos === neighbourCount + 2 &&
      (state.shade === SHADED) === state.found,
    maxDepth: neighbourCount + 2,
  }, geometry.numValues);
}
const shadeMachines = new Map();
function shadeRule(cell) {
  const { row, col } = parseCellId(cell);
  const neighbours = graph.kingNeighbours(cell).filter(other => {
    const point = parseCellId(other);
    return Math.floor((point.row - 1) / 3) === Math.floor((row - 1) / 3) &&
      Math.floor((point.col - 1) / 3) === Math.floor((col - 1) / 3);
  });
  if (!shadeMachines.has(neighbours.length)) {
    shadeMachines.set(neighbours.length, shadeMachine(neighbours.length));
  }
  return new NFA(shadeMachines.get(neighbours.length), 'shade-by-box-neighbour',
    shade.at([cell])[0], cell, ...neighbours);
}

// A daisy's digit equals its surrounding shaded-cell count. Since unshaded is
// coded as 2 and shaded as 1, digit plus shade values totals twice its degree.
function daisyCount(cell) {
  const neighbours = graph.kingNeighbours(cell);
  return new Sum(2 * neighbours.length, cell, ...shade.at(neighbours));
}

// For every non-daisy, read surrounding shade values then the cell digit and
// reject exactly the count equality, enforcing that all possible daisies appear.
function noDaisyMachine(neighbourCount) {
  return NFA.encodeSpec({
    startState: { pos: 0, shaded: 0, digit: null },
    transition: (state, value) => {
      if (state.pos < neighbourCount) {
        return {
          pos: state.pos + 1,
          shaded: state.shaded + (value === SHADED ? 1 : 0),
          digit: null,
        };
      }
      return { pos: state.pos + 1, shaded: state.shaded, digit: value };
    },
    accept: state => state.pos === neighbourCount + 1 &&
      state.digit !== state.shaded,
    maxDepth: neighbourCount + 1,
  }, geometry.numValues);
}
const noDaisyMachines = new Map();
function noDaisyRule(cell) {
  const neighbours = graph.kingNeighbours(cell);
  if (!noDaisyMachines.has(neighbours.length)) {
    noDaisyMachines.set(neighbours.length, noDaisyMachine(neighbours.length));
  }
  return new NFA(noDaisyMachines.get(neighbours.length), 'no-undrawn-daisy',
    ...shade.at(neighbours), cell);
}

// The NFA records whether the four shade values are all equal.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true, seen: [] };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(entry => entry === next[0]) ? undefined : { done: true, seen: [] };
  },
  accept: state => state.done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-monochrome-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(new Given(firstShade, SHADED, UNSHADED));

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  ...daisies.map(([cell, value]) => new Given(cell, value)),
  shadeDomain,
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...gridCells.map(shadeRule),
  ...daisies.map(([cell]) => daisyCount(cell)),
  ...gridCells.filter(cell => !daisySet.has(cell)).map(noDaisyRule),
];
