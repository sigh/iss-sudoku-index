// Title: Killer Sandwich
// Author: Alexander Rappa
// Video: https://www.youtube.com/watch?v=gRZ65hxbHPA
// Source: https://app.crackingthecryptic.com/webapp/htndR6Q76t

// Normal sudoku: rows, columns, standard 3x3 boxes (the payload's 9 drawn
// regions each match a standard box, so the default Shape('9x9') groups are
// used as-is). Killer cages sum to their total with no repeats within a
// cage. Four rows (R1, R2, R5, R8) and four columns (C1, C2, C5, C8) each
// carry a sandwich clue: a single digit 1-9 (never 0, never two-digit) that
// is not itself subject to sudoku placement rules (so these clue digits can
// repeat one another), but equals the sum of the digits strictly between
// the 1 and the 9 in that row/column, and also sits inside one of the
// listed killer cages alongside grid cells.

const graph = cellGraph('9x9');

// Sandwich-clue Vars: one per clued row, one per clued column. Var cells
// take the grid's own 1-9 range by default, matching "single digit 1-9".
const rowClue = new Var('RS', 'row sandwich clues (R1,R2,R5,R8)', 4);
const colClue = new Var('CS', 'col sandwich clues (C1,C2,C5,C8)', 4);
const R1clue = rowClue.cell(1), R2clue = rowClue.cell(2);
const R5clue = rowClue.cell(3), R8clue = rowClue.cell(4);
const C1clue = colClue.cell(1), C2clue = colClue.cell(2);
const C5clue = colClue.cell(3), C8clue = colClue.cell(4);

// Killer cages, transcribed from the payload's `cages` array (0-indexed
// [row, col]; row/col 0 is the border holding the sandwich-clue cells
// above). Cages that reach into the border include that row/col's clue Var
// as a member, so it is bound into that cage's sum and no-repeat rule too.
const cages = [
  new Cage(24, C1clue, 'R1C1', R1clue),
  new Cage(15, C2clue, 'R1C2'),
  new Cage(5, R2clue, 'R2C1'),
  new Cage(30, R5clue, 'R5C1', 'R5C2', 'R5C3'),
  new Cage(18, R8clue, 'R8C1', 'R8C2', 'R8C3', 'R8C4'),
  new Cage(27, C5clue, 'R1C5', 'R2C5', 'R3C5'),
  new Cage(21, C8clue, 'R1C8', 'R2C8', 'R3C8', 'R4C8'),
  new Cage(16, 'R4C4', 'R4C5', 'R5C4'),
  new Cage(13, 'R5C6', 'R6C5', 'R6C6'),
  new Cage(21, 'R7C5', 'R8C5', 'R9C5'),
  new Cage(14, 'R5C7', 'R5C8', 'R5C9'),
  new Cage(16, 'R6C7', 'R7C6', 'R7C7'),
];

// Sandwich-with-a-variable-total NFA: the first scanned cell is the clue
// Var, which fixes `target`; the rest of the scan is the row/column. Sum
// accumulates only between the first and second occurrence of 1 or 9,
// clamped at target+1 (a dead sink once it can only fail). Accept only once
// both sentinels have been seen and the accumulated sum equals the target.
const sandwichSpec = NFA.encodeSpec({
  startState: { target: null, phase: 'before', sum: 0 },
  transition: ({ target, phase, sum }, value) => {
    if (target === null) return { target: value, phase: 'before', sum: 0 };
    const isSentinel = value === 1 || value === 9;
    if (phase === 'before') {
      return isSentinel
        ? { target, phase: 'between', sum: 0 }
        : { target, phase: 'before', sum: 0 };
    }
    if (phase === 'between') {
      return isSentinel
        ? { target, phase: 'after', sum }
        : { target, phase: 'between', sum: Math.min(sum + value, target + 1) };
    }
    return { target, phase: 'after', sum };  // after: rest of the line is inert
  },
  accept: ({ phase, sum, target }) => phase === 'after' && sum === target,
}, 9);

const sandwiches = [
  new NFA(sandwichSpec, 'sandwichR1', R1clue, ...graph.row(1)),
  new NFA(sandwichSpec, 'sandwichR2', R2clue, ...graph.row(2)),
  new NFA(sandwichSpec, 'sandwichR5', R5clue, ...graph.row(5)),
  new NFA(sandwichSpec, 'sandwichR8', R8clue, ...graph.row(8)),
  new NFA(sandwichSpec, 'sandwichC1', C1clue, ...graph.column(1)),
  new NFA(sandwichSpec, 'sandwichC2', C2clue, ...graph.column(2)),
  new NFA(sandwichSpec, 'sandwichC5', C5clue, ...graph.column(5)),
  new NFA(sandwichSpec, 'sandwichC8', C8clue, ...graph.column(8)),
];

return [
  new Shape('9x9'),
  rowClue,
  colClue,
  ...cages,
  ...sandwiches,
];
