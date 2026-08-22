// Title: Siren, Octal, Dumpy
// Author: wooferzfg
// Video: https://www.youtube.com/watch?v=BYG1K8gUQLA
// Source: https://app.crackingthecryptic.com/sudoku/fPB7jpgLm8

// Normal sudoku rules apply (default Shape('9x9') row/column/box AllDifferent).
//
// Wordle rule: there is a secret five digit number, read at R9C5-R9C9 (the
// guess row that is drawn entirely green, so it equals the secret verbatim).
// Each of the other four guess rows is a 5-cell diagonal band read left to
// right as a guess at the secret, with each cell coloured green (right digit,
// right position), yellow (right digit, wrong position) or grey (digit absent
// from the secret). Row/column AllDifferent already keeps the five secret
// cells mutually distinct, so "in the secret, in another position" reduces to
// "equals exactly one of the other four secret cells".
//
// Black dot (1:2 ratio) and white dot (consecutive) marks are drawn only
// where shown; the rules note not all dots are given, so no negative
// (StrictKropki-style) constraint is added for undrawn pairs.

const givens = [
  new Given('R1C1', 5),
  new Given('R5C4', 6),
  new Given('R9C9', 9),
];

// Secret digits in reading order, from the all-green guess row (R9C5-R9C9).
const secret = ['R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'];

const eqKey = Pair.fnToKey((a, b) => a === b, 9);

// Guess rows and their per-cell colours, transcribed from the underlay fills
// (green #A3E048, yellow #F7D038, grey #CFCFCF) left to right; each row's
// cells line up position-for-position with `secret`. R9C5-R9C9 (all green) is
// the secret's own definition and needs no separate constraint.
const guesses = [
  { cells: ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5'], colors: ['green', 'yellow', 'grey', 'yellow', 'grey'] },
  { cells: ['R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6'], colors: ['grey', 'yellow', 'green', 'grey', 'grey'] },
  { cells: ['R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7'], colors: ['green', 'green', 'yellow', 'grey', 'yellow'] },
  { cells: ['R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8'], colors: ['yellow', 'grey', 'grey', 'yellow', 'yellow'] },
];

// A "grey" or "yellow, own position" cell only needs pairwise inequality, so
// it canonicalizes to a 2-cell AllDifferent (grey: against every secret
// digit; yellow: against its own-position secret digit only).
const wordleConstraints = guesses.flatMap(({ cells, colors }) =>
  cells.flatMap((cell, p) => {
    switch (colors[p]) {
      case 'green':
        return [new SameValues(2, cell, secret[p])];
      case 'grey':
        return [new AllDifferent(cell, ...secret)];
      case 'yellow':
        return [
          new AllDifferent(cell, secret[p]),
          new Or(secret
            .filter((_, q) => q !== p)
            .map(s => new Pair(eqKey, 'wordle yellow', cell, s))),
        ];
    }
  }));

const whiteDots = [
  ['R2C5', 'R2C6'],
  ['R1C8', 'R1C9'],
  ['R1C9', 'R2C9'],
  ['R7C1', 'R8C1'],
  ['R3C1', 'R4C1'],
  ['R6C5', 'R6C6'],
  ['R8C4', 'R8C5'],
  ['R9C6', 'R9C7'],
  ['R5C8', 'R6C8'],
].map(cells => new WhiteDot(...cells));

const blackDots = [
  ['R9C1', 'R9C2'],
  ['R9C3', 'R9C4'],
].map(cells => new BlackDot(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...wordleConstraints,
  ...whiteDots,
  ...blackDots,
];
