// Title: Up Up and Away
// Author: ChinStrap
// Video: https://www.youtube.com/watch?v=HVo4_EckxxY
// Source: https://sudokupad.app/sr3ev8r4sd

// Normal 6x6 sudoku rules apply (2x3 boxes).
//
// Running Start: every outside clue is the length of the first (edge-most)
// strictly ascending run of digits read into the grid from that side. E.g.
// a row of 142536 gives a left clue of 2 (1, 4) and a right clue of 1 (6) -
// a run can be just one cell.
//
// Slow Thermo: digits on the purple thermo may not decrease starting at the
// bulb. The thermo is drawn snaking around the *outside* of the grid,
// visiting every outside clue cell in one long chain (bulb at the bottom
// clue under column 5) and cutting through three grid cells where it turns
// a corner: R6C1 (between the bottom clue under C2 and the left clue for
// R5), R1C6 (between the top clue over C5 and the right clue for R1), and
// R2C6 (between the right clues for R2 and R3). Since every other position
// on the chain is a fixed printed clue digit, the rule reduces to a range
// restriction on those three grid cells from their immediate neighbours on
// the chain:
//   R6C1: bottom C2 clue (1) <= R6C1 <= left R5 clue (1)  => R6C1 = 1
//   R1C6: top C5 clue (2)    <= R1C6 <= right R1 clue (2) => R1C6 = 2
//   R2C6: right R2 clue (3)  <= R2C6 <= right R3 clue (4) => R2C6 in {3,4}

function runLengthSpec(target) {
  return NFA.encodeSpec({
    startState: { prev: null, len: 0, done: false },
    transition: ({ prev, len, done }, value) => {
      if (done) return { prev, len, done };
      if (prev === null) return { prev: value, len: 1, done: false };
      if (value > prev) return { prev: value, len: len + 1, done: false };
      return { prev, len, done: true };
    },
    accept: ({ len }) => len === target,
  }, 6);
}

function runClue(target, ...cells) {
  return new NFA(runLengthSpec(target), `Run${target}`, ...cells);
}

function rowCells(r) {
  const cells = [];
  for (let c = 1; c <= 6; c++) cells.push(makeCellId(r, c));
  return cells;
}

function colCells(c) {
  const cells = [];
  for (let r = 1; r <= 6; r++) cells.push(makeCellId(r, c));
  return cells;
}

// row -> clue digit
const leftClues = { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 };
const rightClues = { 1: 2, 2: 3, 3: 4 };
// column -> clue digit
const topClues = { 1: 1, 2: 1, 3: 1, 4: 2, 5: 2 };
const bottomClues = { 2: 1, 3: 1, 4: 1, 5: 1 };

const outsideClueConstraints = [
  ...Object.entries(leftClues).map(
    ([r, target]) => runClue(target, ...rowCells(+r))),
  ...Object.entries(rightClues).map(
    ([r, target]) => runClue(target, ...rowCells(+r).slice().reverse())),
  ...Object.entries(topClues).map(
    ([c, target]) => runClue(target, ...colCells(+c))),
  ...Object.entries(bottomClues).map(
    ([c, target]) => runClue(target, ...colCells(+c).slice().reverse())),
];

return [
  new Shape('6x6'),
  ...outsideClueConstraints,
  new Regex('1', 'R6C1'),
  new Regex('2', 'R1C6'),
  new Regex('[34]', 'R2C6'),
];
