// Title: Squiggles
// Author: Ratfinkz
// Video: https://www.youtube.com/watch?v=75Ht8YUekbE
// Source: https://sudokupad.app/sib54u6n6p

// Rules encoded here:
//  - Normal Sudoku: 1-9 once each in every row, column and 3x3 box (the solver
//    baseline for a 9x9 shape).
//  - Green lines are German whispers: consecutive values along a line differ by
//    at least 5.
//  - The lines are drawn on a canvas one cell larger than the board on every
//    side, and eleven line steps touch that outer ring. A ring cell holds a hit
//    points clue for the row or column it sits against (r0cN above column N,
//    rNc0 left of row N): its value is the sum of the digits of that row or
//    column which sit in their own numbered cell - the digit d in the d-th cell
//    of the line contributes d, any other digit contributes nothing. The rules
//    give the reading twice: "a 3 in r4c3 would contribute to the clue in r4c0
//    and any other digit would not", and "if r5 had a Hitpoint value of 8,
//    124357698 would be valid ... 1+2+5=8".
//  - Every hit points clue is at least 1, so each clued row or column has at
//    least one digit in its own numbered cell.
//  - The ring cells are "values on the whisper", so the whisper relates them to
//    their line neighbours like any other value on the line. A clue value is a
//    total, not a digit: it runs 1..45, which is why it is not modelled as a
//    grid or Var cell (ISS caps a value range at 16). Each whisper step that
//    touches the ring is therefore a state machine over the clued row/column
//    rather than a link between two cells.
//  - "For solution check to trigger please only enter small digits outside the
//    grid" is an entry instruction for the app, not a rule about the answer.
// Nothing is omitted.

// A hit points clue, named by the row or column it scores.
const rowClue = index => ({ line: 'row', index });
const colClue = index => ({ line: 'col', index });
const isClue = entry => typeof entry !== 'string';

// The seven green strokes, transcribed waypoint by waypoint from the drawn
// paths, with ring cells written as the clue they carry. Several strokes step
// diagonally; a whisper relates each entry to the next one on its own stroke,
// so the step direction does not matter.
const strokes = [
  [colClue(3), 'R1C3', 'R2C3', 'R3C3', 'R3C2', 'R3C1', 'R2C1', 'R2C2', 'R1C2',
   colClue(2), 'R1C1', rowClue(1)],
  ['R2C9', 'R1C9', 'R2C8', 'R1C8', 'R1C7', colClue(7), colClue(8)],
  ['R2C4', 'R1C4', 'R1C5', 'R1C6', 'R2C7', 'R3C8'],
  ['R1C5', colClue(5)],
  ['R6C3', 'R5C3', 'R4C3', 'R4C2', 'R4C1', rowClue(4), rowClue(5), 'R5C1',
   'R6C1'],
  ['R5C6', 'R4C7', 'R5C8', 'R6C8'],
  [rowClue(9), 'R9C1', 'R8C1'],
];

// The nine scored cells of a clue, in the index order the rule counts them:
// the i-th cell of the row or column scores i when it holds an i.
const scoredCells = ({ line, index }) => (
  [1, 2, 3, 4, 5, 6, 7, 8, 9].map(
    i => line === 'row' ? makeCellId(index, i) : makeCellId(i, index)));
const clueName = ({ line, index }) => (
  line === 'row' ? `r${index}c0` : `r0c${index}`);

// The drawn strokes, split into what each constraint kind needs.
const clues = [...new Map(strokes.flat().filter(isClue).map(
  entry => [clueName(entry), entry])).values()];
const steps = strokes.flatMap(
  stroke => stroke.slice(1).map((entry, i) => [stroke[i], entry]));
const boardSteps = steps.filter(([a, b]) => !isClue(a) && !isClue(b));
const clueBoardSteps = steps.filter(([a, b]) => isClue(a) !== isClue(b));
const clueClueSteps = steps.filter(([a, b]) => isClue(a) && isClue(b));
// Maximal runs of consecutive board cells, so Whisper covers exactly the
// board-to-board steps of the drawn lines and nothing else.
const boardRuns = boardSteps.reduce(
  (runs, [a, b]) => {
    const last = runs[runs.length - 1];
    if (last && last[last.length - 1] === a) last.push(b);
    else runs.push([a, b]);
    return runs;
  }, []);

// Scores the nine cells of one clue: `pos` counts cells read, so the digit just
// read sits in cell pos+1 and scores pos+1 exactly when it equals it.
const scoreStep = (pos, value) => (value === pos + 1 ? pos + 1 : 0);

// "All Hitpoint clues are a minimum of 1": the total is a sum of positive
// contributions, so at least one cell must score.
const atLeastOneSpec = NFA.encodeSpec({
  startState: { pos: 0, scored: false },
  transition: ({ pos, scored }, value) => (
    { pos: pos + 1, scored: scored || scoreStep(pos, value) > 0 }),
  accept: ({ pos, scored }) => pos === 9 && scored,
  maxDepth: 9,
}, 9);

// One whisper step between a clue total and a board digit. The clue's nine
// cells are scanned first and the neighbouring digit last, so only the running
// total is carried. A digit is 1-9, so any total of 14 or more compares the
// same way against both tests and the total can be clamped there.
const CLUE_TOTAL_CLAMP = 14;
const clueDigitStepSpec = NFA.encodeSpec({
  startState: { pos: 0, total: 0 },
  transition: ({ pos, total }, value) => {
    if (pos < 9) {
      return {
        pos: pos + 1,
        total: Math.min(total + scoreStep(pos, value), CLUE_TOTAL_CLAMP),
      };
    }
    // The tenth symbol is the neighbouring board digit.
    if (total < value + 5 && total > value - 5) return undefined;
    return { pos: pos + 1, total: 0 };
  },
  accept: ({ pos }) => pos === 10,
  maxDepth: 10,
}, 9);

// One whisper step between two clue totals: the first clue's nine cells, then
// the second's. `carried` is the first total while it accumulates and the
// running difference afterwards. The difference only falls once the second
// total starts, so -5 is an absorbing value and bounds the state.
const clueClueStepSpec = NFA.encodeSpec({
  startState: { pos: 0, carried: 0 },
  transition: ({ pos, carried }, value) => {
    if (pos < 9) {
      return { pos: pos + 1, carried: carried + scoreStep(pos, value) };
    }
    return {
      pos: pos + 1,
      carried: Math.max(carried - scoreStep(pos - 9, value), -5),
    };
  },
  accept: ({ pos, carried }) => pos === 18 && (carried >= 5 || carried <= -5),
  maxDepth: 18,
}, 9);

return [
  new Shape('9x9'),
  ...boardRuns.map(run => new Whisper(5, ...run)),
  ...clues.map(clue => new NFA(
    atLeastOneSpec, `${clueName(clue)} at least 1`, ...scoredCells(clue))),
  ...clueBoardSteps.map(([a, b]) => {
    const [clue, cell] = isClue(a) ? [a, b] : [b, a];
    return new NFA(
      clueDigitStepSpec, `whisper ${clueName(clue)}-${cell}`,
      ...scoredCells(clue), cell);
  }),
  ...clueClueSteps.map(([a, b]) => new NFA(
    clueClueStepSpec, `whisper ${clueName(a)}-${clueName(b)}`,
    ...scoredCells(a), ...scoredCells(b))),
];
