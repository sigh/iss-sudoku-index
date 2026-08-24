// Title: Creepy Crawlies Are Scary
// Author: Phil Preen
// Video: https://www.youtube.com/watch?v=mjHUeSfDi9E
// Source: https://app.crackingthecryptic.com/sudoku/L9t3JF79Jd

// Normal sudoku on a plain 9x9 grid (default rows/columns/boxes).
//
// Rules encoded here:
//   - Sandwich: an outside clue is the sum of the digits strictly between the
//     1 and the 9 of that row/column.
//   - Some clues are written as letters; each of A,C,E,L,P,R,S,W,Y is a
//     different digit 1-9. A two-character clue reads as a two-digit number,
//     most significant character first, so a literal leading "1" contributes
//     10.
//   - Flies: each fly cell is either sandwich filling (a digit strictly
//     between its clued line's 1 and 9) or sandwich crust (the 1 or the 9
//     itself).
//   - Two palindrome "worms": digits read the same from either end.
//
// Omitted: nothing. The alphabetical letter strip and the blank row drawn
// below the grid are the solver's own answer key (UI only, outside the 9x9
// board) and carry no constraint.

const LETTER_ORDER = ['A', 'C', 'E', 'L', 'P', 'R', 'S', 'W', 'Y'];
const letters = new Var('L', 'letters A,C,E,L,P,R,S,W,Y = 1-9', 9);
const letterCell = Object.fromEntries(
  LETTER_ORDER.map((ch, i) => [ch, letters.cell(i + 1)]));

const colCells = c => Array.from({ length: 9 }, (_, r) => makeCellId(r + 1, c));
const rowCells = r => Array.from({ length: 9 }, (_, c) => makeCellId(r, c + 1));

// In-grid letter clues, transcribed from the small in-cell text overlays.
// These are drawn in the same in-cell corner style and size as the fly marks,
// unlike the full-size cell-aligned text used for the outside clues and for
// the answer-key strip below the board. They spell ARE (row 2) and SCARY
// (row 4).
const GRID_LETTERS = [
  ['R2C1', 'A'], ['R2C2', 'R'], ['R2C3', 'E'],
  ['R4C5', 'S'], ['R4C6', 'C'], ['R4C7', 'A'], ['R4C8', 'R'], ['R4C9', 'Y'],
];

// Sandwich-with-flies NFA. Reads the clue's letter cells first (most
// significant digit first; `literalDigit` seeds the accumulator for a clue
// with a literal leading digit), assembles the target sum, and rejects
// immediately if it exceeds the largest possible sandwich sum (35 = the
// digits 2..8) -- collapsing every over-target branch into one dead state
// keeps the compiled state count small. It then scans the 9 line cells
// tracking a 'before'/'between'/'after' phase relative to the two crust
// digits (1 and 9) and a `remaining` countdown from the target, going dead
// the moment `remaining` would go negative. `flyPositions` names 0-indexed
// positions within the line where the digit must be a crust or must fall in
// the 'between' phase -- i.e. may not be a plain digit lying outside the
// sandwich span.
function makeSandwichSpec(extraCount, literalDigit, flyPositions) {
  const MAX_SUM = 35;
  return NFA.encodeSpec({
    startState: { stage: 'target', idx: 0, acc: literalDigit },
    transition: (state, value) => {
      if (state === 'dead') return 'dead';
      if (state.stage === 'target') {
        const acc = state.acc * 10 + value;
        const idx = state.idx + 1;
        if (idx < extraCount) return { stage: 'target', idx, acc };
        if (acc > MAX_SUM) return 'dead';
        return { stage: 'scan', phase: 'before', remaining: acc, pos: 0 };
      }
      const { phase, remaining, pos } = state;
      const isCrust = (value === 1 || value === 9);
      if (flyPositions.has(pos) && !isCrust && phase !== 'between') {
        return undefined;
      }
      let nextPhase = phase;
      let nextRemaining = remaining;
      if (phase === 'before') {
        nextPhase = isCrust ? 'between' : 'before';
      } else if (phase === 'between') {
        if (isCrust) {
          nextPhase = 'after';
        } else {
          nextRemaining = remaining - value;
          if (nextRemaining < 0) return 'dead';
        }
      }
      // Clamp: no fly sits past position 8, and after the line's 9 cells the
      // scan is functionally done, so further growth adds nothing to check.
      return {
        stage: 'scan', phase: nextPhase, remaining: nextRemaining,
        pos: Math.min(pos + 1, 9),
      };
    },
    accept: (state) => state !== 'dead' && state.stage === 'scan' &&
      state.phase === 'after' && state.remaining === 0,
  }, 9);
}

function sandwichClue(name, lineCells, flyPositions, literalDigit, letterChars) {
  const extraCells = letterChars.map(ch => letterCell[ch]);
  const spec = makeSandwichSpec(extraCells.length, literalDigit, flyPositions);
  return new NFA(spec, name, ...extraCells, ...lineCells);
}

// Outside clues, transcribed from the drawn text above the grid and to its
// left. Fly positions are 0-indexed offsets into the clued line's 9-cell
// scan: fly cells are R1C8, R3C2, R3C6, R6C9, R7C6, R8C1 and R8C9, none of
// which lies in a clued row, so every fly's clued sandwich is its column's.
const sandwiches = [
  sandwichClue('C1 sandwich (C)', colCells(1), new Set([7]), 0, ['C']),
  sandwichClue('C2 sandwich (RE)', colCells(2), new Set([2]), 0, ['R', 'E']),
  sandwichClue('C3 sandwich (EP)', colCells(3), new Set(), 0, ['E', 'P']),
  sandwichClue('C4 sandwich (Y)', colCells(4), new Set(), 0, ['Y']),
  sandwichClue('C5 sandwich (C)', colCells(5), new Set(), 0, ['C']),
  sandwichClue('C6 sandwich (RA)', colCells(6), new Set([2, 6]), 0, ['R', 'A']),
  sandwichClue('C7 sandwich (WL)', colCells(7), new Set(), 0, ['W', 'L']),
  sandwichClue('C8 sandwich (1E)', colCells(8), new Set([0]), 1, ['E']),
  sandwichClue('C9 sandwich (S)', colCells(9), new Set([5, 7]), 0, ['S']),
  sandwichClue('R5 sandwich (1A)', rowCells(5), new Set(), 1, ['A']),
];

// Row 9's clue lane carries two texts, "1A" and "1Y", drawn one on top of the
// other at the same anchor, and a row has one sandwich sum. Nothing in the
// rules or the drawing says which of the two is row 9's clue, so the
// encoding takes the disjunction over both readings rather than picking one.
const row9Sandwich = new Or([
  sandwichClue('R9 sandwich (1A)', rowCells(9), new Set(), 1, ['A']),
  sandwichClue('R9 sandwich (1Y)', rowCells(9), new Set(), 1, ['Y']),
]);

// Palindrome worms. The second passes through R8C4, the cell interpolated
// between the drawn waypoints R9C5 and R7C3, which are two rows and two
// columns apart.
const wormA = new Palindrome(
  'R3C2', 'R4C3', 'R4C2', 'R3C1', 'R4C1');
const wormB = new Palindrome(
  'R6C4', 'R7C4', 'R8C5', 'R9C5', 'R8C4', 'R7C3', 'R7C2', 'R8C2', 'R8C3');

return [
  new Shape('9x9'),
  letters,
  new AllDifferent(...letters.cells()),
  // Each in-grid letter clue fixes its cell to that letter's digit.
  ...GRID_LETTERS.map(([cell, ch]) => new SameValues(2, cell, letterCell[ch])),
  ...sandwiches,
  row9Sandwich,
  wormA,
  wormB,
];
