// Title: 8x8 Mystery Sandwich
// Author: Doug Jelen
// Video: https://www.youtube.com/watch?v=JcXI9PdeFmQ
// Source: https://app.crackingthecryptic.com/sudoku/jGjPpHfLtM

// Rules (video description): each row, column and marked region contains
// 1-8. Clues outside the grid give the sum of the digits strictly between
// the cell holding digit X and the cell holding digit Y in that row/column,
// where X and Y are the same two (unknown) digits for every clue in the
// puzzle -- the solver must discover which two digits they are. Digits
// increase along thermometers from the bulb.
//
// Two shared Var cells, VVX and VVY, hold the puzzle-wide bread digits. Every
// outside-clue NFA below reads them first (in that order) and rejects unless
// the second is strictly greater than the first -- a canonical low/high
// ordering, since the rules never distinguish "X" from "Y". It then scans
// that lane's cells, transitioning out of "before" the first time it meets
// either bread digit, accumulating a clamped running sum while "between"
// until it meets the other one, then ignoring the rest of the lane.

const shape = new Shape('8x8');
const graph = cellGraph(shape);
const shapeName = graph.gridGeometry().name;

const bx = new Var('VX', 'mystery sandwich low bread digit', 1);
const by = new Var('VY', 'mystery sandwich high bread digit', 1);
const VX = bx.cells()[0];
const VY = by.cells()[0];

function mysterySandwichSpec(targetSum) {
  return NFA.encodeSpec({
    startState: { stage: 'readX' },
    transition: (state, value) => {
      if (state.stage === 'readX') {
        return { stage: 'readY', targetX: value };
      }
      if (state.stage === 'readY') {
        if (value <= state.targetX) return undefined; // enforce VX < VY
        return { stage: 'before', targetX: state.targetX, targetY: value, sum: 0 };
      }
      if (state.stage === 'before') {
        if (value === state.targetX || value === state.targetY) {
          return { stage: 'between', targetX: state.targetX, targetY: state.targetY, sum: 0 };
        }
        return state;
      }
      if (state.stage === 'between') {
        if (value === state.targetX || value === state.targetY) {
          return { stage: 'after', sum: state.sum };
        }
        return {
          stage: 'between', targetX: state.targetX, targetY: state.targetY,
          sum: Math.min(state.sum + value, targetSum + 1),
        };
      }
      return state; // stage === 'after': rest of the lane is irrelevant.
    },
    accept: (state) => state.stage === 'after' && state.sum === targetSum,
  }, 8);
}

function mysterySandwich(name, targetSum, laneCells) {
  return new NFA(mysterySandwichSpec(targetSum), name, [VX, VY, ...laneCells]);
}

// Row clue values, drawn left of R1..R8 (each a single sum for that whole row).
const rowClue = [30, 2, 13, 20, 5, 0, 12, 3];
const rows = graph.rows(); // rows[r] = [R{r+1}C1 .. R{r+1}C8]
const rowSandwiches = rowClue.map((sum, r) =>
  mysterySandwich(`row ${r + 1} mystery sandwich`, sum, rows[r]));

// Column clue, drawn above C8.
const columnSandwich = mysterySandwich(
  'column 8 mystery sandwich', 0, graph.columns()[7]);

// Marked regions (the 8 drawn irregular pieces, one row per piece, 1-indexed
// R/C cell ids), replacing the default boxes.
const regionCells = [
  ['R1C1', 'R1C2', 'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R3C1'],
  ['R1C5', 'R1C6', 'R1C7', 'R1C8', 'R2C7', 'R2C8', 'R1C3', 'R1C4'],
  ['R3C2', 'R3C3', 'R4C1', 'R4C2', 'R4C3', 'R5C1', 'R5C2', 'R5C3'],
  ['R3C5', 'R3C6', 'R4C5', 'R4C6', 'R4C4', 'R3C4', 'R2C6', 'R5C5'],
  ['R5C4', 'R6C4', 'R7C4', 'R8C4', 'R7C3', 'R7C5', 'R7C6', 'R7C7'],
  ['R5C6', 'R5C7', 'R6C5', 'R6C6', 'R6C7', 'R4C7', 'R3C7', 'R3C8'],
  ['R7C1', 'R7C2', 'R8C1', 'R8C2', 'R8C3', 'R6C1', 'R6C2', 'R6C3'],
  ['R7C8', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R6C8', 'R5C8', 'R4C8'],
];
const regions = regionCells.map(cells => new Jigsaw(shapeName, ...cells));

// Thermometers (five drawn lines, th=10, bulb = the underlay circle at each
// line's actual bulb cell). Four are drawn bulb-first, matching their
// waypoint order; one is drawn tip-first (waypoints run R7C2 -> R8C2, but
// the underlay circle -- the drawn bulb -- sits at R8C2), so its cell order
// below is reversed from the raw waypoints to put the bulb first.
const thermos = [
  new Thermo('R2C6', 'R2C5', 'R2C4'),
  new Thermo('R2C2', 'R2C1'),
  new Thermo('R3C5', 'R3C6'),
  new Thermo('R5C7', 'R5C8'),
  new Thermo('R8C2', 'R7C2'),
];

return [
  shape,
  new NoBoxes(),
  ...regions,
  bx,
  by,
  ...thermos,
  ...rowSandwiches,
  columnSandwich,
];
