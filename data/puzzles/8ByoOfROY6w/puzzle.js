// Title: Chocolate Banana Sandwiches
// Author: Scojo
// Video: https://www.youtube.com/watch?v=8ByoOfROY6w
// Source: https://sudokupad.app/f2DNr9b4tb

// Normal Sudoku is encoded with a two-state shading overlay. The six outside
// clues are encoded: between the 1 and 9, sum cells in the named shade. The
// component-shape rule and the circled component-size clues are omitted.

const SHADED = 1;
const UNSHADED = 2;
const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');

// This scans alternating shade and digit cells. A digit starts the interval at
// the first 1 or 9, ends it at the other, and contributes when its preceding
// shade has the target value. The endpoints themselves do not contribute.
function sumBetweenOneAndNine(target, targetShade) {
  return NFA.encodeSpec({
    startState: { expectShade: true, phase: 'before', pendingShade: null, sum: 0 },
    transition: (state, value) => {
      if (state.expectShade) {
        if (value !== SHADED && value !== UNSHADED) return undefined;
        return { ...state, expectShade: false, pendingShade: value };
      }
      let { phase, sum } = state;
      if (phase === 'before') {
        if (value === 1 || value === 9) phase = 'inside';
      } else if (phase === 'inside') {
        if (value === 1 || value === 9) {
          phase = 'after';
        } else if (state.pendingShade === targetShade) {
          sum += value;
          if (sum > target) return undefined;
        }
      }
      return { expectShade: true, phase, pendingShade: null, sum };
    },
    accept: state => state.expectShade && state.phase === 'after' && state.sum === target,
    maxDepth: 18,
  }, 9);
}

function outsideSum(name, cells, target, targetShade) {
  return new NFA(
    sumBetweenOneAndNine(target, targetShade), name,
    ...cells.flatMap(cell => [shade.at(cell), cell]));
}

const outsideSums = [
  outsideSum('C2 shaded sum 13', graph.column('R1C2'), 13, SHADED),
  outsideSum('C5 shaded sum 15', graph.column('R1C5'), 15, SHADED),
  outsideSum('C8 shaded sum 14', graph.column('R1C8'), 14, SHADED),
  outsideSum('R2 unshaded sum 30', graph.row('R2C1'), 30, UNSHADED),
  outsideSum('R5 unshaded sum 15', graph.row('R5C1'), 15, UNSHADED),
  outsideSum('R8 unshaded sum 18', graph.row('R8C1'), 18, UNSHADED),
];

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shade.makeReplicate(new Given(shade.cells()[0], SHADED, UNSHADED)),
  ...outsideSums,
];
