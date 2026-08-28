// Title: The Elephant
// Author: Doug Jelen
// Video: https://www.youtube.com/watch?v=knj7ZuGH6Mw
// Source: https://cracking-the-cryptic.web.app/sudoku/md2qPhqN6d

// Rules (video description): normal sudoku rules apply. Identical digits
// cannot be a knight's move apart. Cages sum to the number given. Clues
// outside the grid give the sum of the digits strictly between the cell
// holding digit X and the cell holding digit Y in that row/column, where X
// and Y are the same two (unknown) digits for every outside clue in the
// puzzle -- the solver must discover which two digits they are. No arrow or
// shaft is drawn on any outside clue in the payload, so each reads its own
// row/column: the default outside-clue lane, matching this author's other
// Mystery Sandwich puzzles (F6HrcnnDagQ, JcXI9PdeFmQ).
//
// Two shared Var cells, VX and VY, hold the puzzle-wide bread digits. Every
// outside-clue NFA below reads them first (in that order) and rejects unless
// the second is strictly greater than the first -- a canonical low/high
// ordering, since the rules never distinguish "X" from "Y". It then scans
// that lane's cells, transitioning out of "before" the first time it meets
// either bread digit, accumulating a clamped running sum while "between"
// until it meets the other one, then ignoring the rest of the lane.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

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
  }, 9);
}

function mysterySandwich(name, targetSum, laneCells) {
  return new NFA(mysterySandwichSpec(targetSum), name, [VX, VY, ...laneCells]);
}

const rows = graph.rows();       // rows[r] = [R{r+1}C1 .. R{r+1}C9]
const columns = graph.columns(); // columns[c] = [R1C{c+1} .. R9C{c+1}]

// Outside clue values, drawn above C1/C4/C7/C8 and left of R2/R7 (overlays
// #0/#1/#2/#3 and #4/#5 in the payload).
const columnSandwiches = [
  mysterySandwich('column 1 mystery sandwich', 9, columns[0]),
  mysterySandwich('column 4 mystery sandwich', 9, columns[3]),
  mysterySandwich('column 7 mystery sandwich', 8, columns[6]),
  mysterySandwich('column 8 mystery sandwich', 0, columns[7]),
];
const rowSandwiches = [
  mysterySandwich('row 2 mystery sandwich', 5, rows[1]),
  mysterySandwich('row 7 mystery sandwich', 40, rows[6]),
];

// Cages (8 drawn killer cages, transcribed from the payload's `cages` array).
const cages = [
  new Cage(3, 'R1C6', 'R2C6'),
  new Cage(5, 'R2C8', 'R3C8'),
  new Cage(4, 'R5C8', 'R5C9'),
  new Cage(4, 'R8C5', 'R8C6'),
  new Cage(3, 'R6C1', 'R7C1'),
  new Cage(7, 'R7C2', 'R7C3'),
  new Cage(7, 'R7C9', 'R8C9', 'R9C9'),
  new Cage(9, 'R6C7', 'R7C7'),
];

return [
  shape,
  new AntiKnight(),
  ...cages,
  bx,
  by,
  ...columnSandwiches,
  ...rowSandwiches,
];
