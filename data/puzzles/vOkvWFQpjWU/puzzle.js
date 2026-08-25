// Title: ABC Sudoku
// Author: Danny Demeersseman
// Video: https://www.youtube.com/watch?v=vOkvWFQpjWU
// Source: https://app.crackingthecryptic.com/webapp/BGDNFM23F8

// Normal sudoku rules apply. Each outside clue shows the first digit below 6
// (i.e. in 1-5) visible from that direction: a digit 6-9 in the way is
// transparent, neither blocking the view nor itself reportable. Every row
// and column holds one each of 6, 7, 8, 9, so a digit below 6 is always
// found before the far edge -- every lane is satisfiable.
//
// Encoded as one NFA per lane, scanning from the clue inward: stay in the
// "seeking" state on a transparent (>=6) value; on the first value below 6,
// accept only if it equals the clue, then absorb (accepting) regardless of
// what follows.

const graph = cellGraph('9x9');

// One compiled NFA per distinct clue value (1-5), shared by every lane with
// that value.
const specForTarget = {};
const nfaFor = (target) => {
  if (!specForTarget[target]) {
    specForTarget[target] = NFA.encodeSpec({
      startState: { found: false },
      transition: ({ found }, value) => {
        if (found) return { found: true };
        if (value < 6) return value === target ? { found: true } : undefined;
        return { found: false };
      },
      accept: ({ found }) => found,
    }, 9);
  }
  return specForTarget[target];
};

// Outside clue values, transcribed from the drawn text overlays outside the
// grid, one per row/column/direction.
const topClues = [5, 1, 3, 2, 5, 4, 3, 1, 4];     // C1..C9, scanned downward
const bottomClues = [3, 5, 2, 4, 3, 1, 5, 2, 1];  // C1..C9, scanned upward
const leftClues = [5, 4, 3, 1, 2, 3, 3, 4, 5];    // R1..R9, scanned rightward
const rightClues = [4, 5, 5, 3, 4, 2, 4, 1, 2];   // R1..R9, scanned leftward

const laneConstraints = [
  ...topClues.map((target, i) =>
    new NFA(nfaFor(target), 'outside', graph.column(i + 1))),
  ...bottomClues.map((target, i) =>
    new NFA(nfaFor(target), 'outside', graph.column(i + 1).slice().reverse())),
  ...leftClues.map((target, i) =>
    new NFA(nfaFor(target), 'outside', graph.row(i + 1))),
  ...rightClues.map((target, i) =>
    new NFA(nfaFor(target), 'outside', graph.row(i + 1).slice().reverse())),
];

return [
  new Shape('9x9'),
  new Given('R2C7', 6),
  new Given('R3C1', 6),
  new Given('R3C2', 8),
  new Given('R4C3', 8),
  new Given('R4C7', 7),
  new Given('R5C2', 7),
  new Given('R5C9', 8),
  new Given('R6C4', 6),
  new Given('R8C1', 8),
  new Given('R8C5', 9),
  ...laneConstraints,
];
