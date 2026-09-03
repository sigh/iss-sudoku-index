// Title: Parity Snakes
// Author: Malrog
// Video: https://www.youtube.com/watch?v=pmpvQ8jzqaE
// Source: https://sudokupad.app/y23lun2exp

// Rules:
//   Normal sudoku rules apply.
//   Digits separated by a white dot must be consecutive (not all dots are given).
//   A digit in a grey square must be even.
//   Each cell containing a circle is the head of a parity snake, whose length is
//   the digit in the circle. A parity snake is a non-branching one-cell-wide path
//   of orthogonally connected cells of the same parity, which may not orthogonally
//   touch itself or other cells of matching parity. A snake may not have two
//   heads, and may be a single cell.
//
// Reading of the snake rule this encoding commits to, and the words that force it:
//   - "may not orthogonally touch ... other cells of matching parity" leaves no
//     same-parity cell adjacent to the snake and outside it, so a snake is the
//     whole orthogonally connected same-parity region that contains its circle,
//     and "non-branching one-cell-wide path ... may not orthogonally touch
//     itself" makes that region a simple path with no chords.
//   - "head" is the end of a snake, so the circled cell is an endpoint of its
//     path; "a snake may not have two heads" then forbids a second circle in the
//     same region.
//   - Only "each cell containing a circle" is declared to be the head of a snake,
//     so a same-parity region holding no circle is not a snake and its shape is
//     unconstrained.
// Nothing in the rules text is left unencoded.

const DOTS = [
  // White dots, from the edge-centred overlay marks.
  ['R4C1', 'R5C1'], ['R4C5', 'R5C5'], ['R6C4', 'R7C4'], ['R8C4', 'R9C4'],
  ['R7C6', 'R8C6'], ['R9C8', 'R9C9'], ['R4C8', 'R4C9'],
];
// Grey squares, from the two shaded cell underlays.
const GREY = ['R1C1', 'R3C3'];
// Snake heads, from the ten circle underlays.
const HEADS = [
  'R2C2', 'R1C5', 'R2C6', 'R4C1', 'R2C8', 'R4C4', 'R8C4', 'R8C2', 'R7C7', 'R8C9',
];

const EVEN = 0;
const ODD = 1;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Each parity gets an overlay recording, per cell, that cell's role in a snake of
// that parity. A snake is traced backwards from its head: the value REM + r marks
// a snake cell with r cells still to come, itself included, so the head of a
// length-d snake holds REM + d and the far end holds REM + 1. Two overlays are
// needed because a single one could not say which parity a snake cell has, and
// the no-touching rule is a statement about same-parity neighbours.
const OTHER = 1;   // the digit here has this overlay's other parity
const LOOSE = 2;   // the digit here has this parity, but the cell is in no snake
const REM = 2;     // snake cells hold REM + (cells remaining, including itself)

// REM + 9 is the largest overlay value, so the alphabet is widened past the
// digits, and the grid cells are restricted back to 1-9 below.
const shape = new Shape('9x9', REM + 9);
const graph = cellGraph(shape);
const layers = [graph.makeOverlay('VE'), graph.makeOverlay('VO')];

// Relates a digit to its cell's value in the parity-`parity` overlay. `head`
// additionally reads the length off the circled digit.
const parityKey = (parity, head) => Pair.fnToKey(
  (digit, value) => digit % 2 !== parity
    ? value === OTHER
    : (head ? value === REM + digit : value >= LOOSE),
  shape);

// Reads one overlay cell and then each of its orthogonal neighbours in the same
// overlay. `own` is the cell's own value; `succ`/`pred` count the neighbours
// holding REM + (r - 1) and REM + (r + 1), the cells before and after it along
// its snake. Rejecting every other same-parity neighbour value is what enforces
// "may not orthogonally touch itself or other cells of matching parity": it
// leaves each snake cell with only its two chain neighbours, so the snake cannot
// branch, close on itself, run alongside itself, or reach a matching-parity cell
// outside it. Requiring exactly one predecessor everywhere but at a head chains
// every snake cell back to a head, and requiring a successor at every cell with
// r > 1 runs the count down to r = 1, so the snake has exactly d cells.
const snakeMachine = (isHead) => NFA.encodeSpec({
  startState: { own: null, succ: 0, pred: 0 },
  transition: ({ own, succ, pred }, value) => {
    if (own === null) return { own: value, succ: 0, pred: 0 };
    if (own === OTHER) return { own, succ: 0, pred: 0 };
    if (own === LOOSE) {
      // A same-parity cell outside every snake may not touch a snake.
      return value >= REM + 1 ? undefined : { own, succ: 0, pred: 0 };
    }
    if (value === OTHER) return { own, succ, pred };
    if (own >= REM + 2 && value === own - 1) {
      return succ ? undefined : { own, succ: 1, pred };
    }
    if (value === own + 1) {
      return pred ? undefined : { own, succ, pred: 1 };
    }
    return undefined;
  },
  accept: ({ own, succ, pred }) => own !== null && (own <= LOOSE || (
    succ === (own >= REM + 2 ? 1 : 0) && pred === (isHead ? 0 : 1))),
}, shape);
const machines = [snakeMachine(false), snakeMachine(true)];

const parities = layers.flatMap((layer, parity) => graph.cells().map(
  cell => new Pair(parityKey(parity, HEADS.includes(cell)), 'parity',
    cell, layer.at(cell))));

const snakes = layers.flatMap(layer => graph.cells().map(cell => {
  const own = layer.at(cell);
  return new NFA(machines[HEADS.includes(cell) ? 1 : 0], 'snake',
    own, ...layer.neighbours(own));
}));

return [
  shape,
  layers[EVEN].toVar('even snakes'),
  layers[ODD].toVar('odd snakes'),
  graph.makeReplicate(new Given(graph.cells()[0], ...DIGITS)),
  ...GREY.map(cell => new Given(cell, 2, 4, 6, 8)),
  ...DOTS.map(pair => new WhiteDot(...pair)),
  ...parities,
  ...snakes,
];
