// Title: Billionaires' Row
// Author: Not Details
// Video: https://www.youtube.com/watch?v=loJPwt1mCz8
// Source: https://app.crackingthecryptic.com/sudoku/BmdrRqggdn

// Rules: normal sudoku (9x9, nine 3x3 boxes, no givens). Each digit is a
// building height. An outside clue is the sum of every digit "seen" from
// that side of the grid: scanning inward from the clue, a building is seen
// unless a taller building already scanned (closer to the clue) obscures
// it, so the nearest cell is always seen and a seen value always exceeds
// every value seen before it on that line. Digits joined by a white V sum
// to 5; digits joined by a white X sum to 10 -- only the four marked edges
// below carry a V or X, no claim is made about any unmarked pair.

// There is no built-in outside-clue class for a *sum* of seen values (only
// counted-visible, first-hidden, etc.), so each clue is one running
// max/sum NFA over its line, ordered from the clue's near cell outward.
// State {max, sum}: a cell is "seen" (added to sum) iff its value exceeds
// every value seen so far; sum is clamped at target+1, a permanent-reject
// sink, to bound the state space.
const skyscraperSum = (target, cells) => new NFA(
  NFA.encodeSpec({
    startState: { max: 0, sum: 0 },
    transition: ({ max, sum }, value) => value <= max
      ? { max, sum }
      : { max: value, sum: Math.min(sum + value, target + 1) },
    accept: ({ sum }) => sum === target,
  }, 9),
  `SkyscraperSum(${target})`, ...cells);

// Cell-line helpers for the four scan directions an outside clue can use.
const col = c => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(r => makeCellId(r, c));
const colRev = c => col(c).slice().reverse();
const row = r => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(c => makeCellId(r, c));
const rowRev = r => row(r).slice().reverse();

// Outside-clue [lane, sum] pairs, transcribed from the drawn clue text and
// its position relative to the grid, grouped by scan direction.
const topClues = [[3, 28], [4, 12], [6, 30], [8, 44], [9, 24]];     // top-down columns
const bottomClues = [[1, 16], [5, 14], [6, 18]];                   // bottom-up columns
const leftClues = [[3, 15], [4, 22], [7, 25]];                     // left-right rows
const rightClues = [[1, 12], [6, 28], [8, 11]];                    // right-left rows

const skyscraperClues = [
  ...topClues.map(([c, v]) => skyscraperSum(v, col(c))),
  ...bottomClues.map(([c, v]) => skyscraperSum(v, colRev(c))),
  ...leftClues.map(([r, v]) => skyscraperSum(v, row(r))),
  ...rightClues.map(([r, v]) => skyscraperSum(v, rowRev(r))),
];

return [
  new Shape('9x9'),
  ...skyscraperClues,
  // V/X edges, from the drawn overlay positions.
  new V('R2C3', 'R3C3'),
  new V('R3C3', 'R3C4'),
  new V('R8C5', 'R9C5'),
  new X('R5C5', 'R5C6'),
];
