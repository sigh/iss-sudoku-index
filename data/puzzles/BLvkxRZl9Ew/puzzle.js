// Title: Sawyer Beetle
// Author: BremSter, FullDeck & Missing A Few Cards
// Video: https://www.youtube.com/watch?v=BLvkxRZl9Ew
// Source: https://app.crackingthecryptic.com/sudoku/gM7M8432BJ
//
// Normal sudoku rules apply (default row/col/box all-different, standard
// boxes). No given digits.
//
// Orange lines: Entropic(...) -- every 3 sequential cells on the line hold
// one low (1-3), one mid (4-6) and one high (7-9) digit.
// Purple lines: Renban(...) -- consecutive, non-repeating digit set.
// X/V marks: X(a,b) sums to 10, V(a,b) sums to 5, adjacent cells only. Not
// all X/V pairs are marked, so unmarked adjacent pairs are unconstrained --
// no StrictXV negative is encoded. Two marks (see below) coincide with an
// edge on an entropic line; the rules describe X/V purely as an
// adjacent-cell sum, so each is encoded as its own independent clue.

const entropicLines = [
  // E1: three-cell entropic line, top-right box.
  ['R3C7', 'R2C8', 'R1C9'],
  // E2, E3: share their first cell (R3C5) with each other and with purple
  // line P3 below; each line is still its own separate clue (drawn as
  // separate stroke entries).
  ['R3C5', 'R2C4', 'R2C3'],
  ['R3C5', 'R2C6', 'R2C7'],
  // E4: six-cell entropic line, left-centre; V2 below marks its first edge.
  ['R4C4', 'R5C4', 'R5C3', 'R6C3', 'R6C2', 'R7C2'],
  ['R9C1', 'R8C1', 'R8C2', 'R9C2'],
  ['R9C8', 'R8C8', 'R8C9', 'R9C9'],
  ['R7C3', 'R8C3', 'R8C4', 'R9C4', 'R9C5', 'R9C6', 'R8C6', 'R8C7', 'R7C7'],
  // E8: six-cell entropic line, right-centre; X3 below marks its first edge.
  ['R4C6', 'R5C6', 'R5C7', 'R6C7', 'R6C8', 'R7C8'],
];

const renbanLines = [
  ['R6C1', 'R5C1', 'R4C2'],
  ['R1C1', 'R2C2', 'R3C3'],
  ['R3C5', 'R4C5', 'R5C5'],
  ['R4C8', 'R5C9', 'R6C9'],
];

// X/V marks. X1/X2/X4/V1 sit between the endpoints of two different lines
// (the touching antenna/leg shape the video title refers to); X3 and V2 fall
// on an edge that is itself part of entropic lines E8 and E4 respectively.
const xMarks = [
  ['R7C2', 'R7C3'],
  ['R6C1', 'R6C2'],
  ['R4C6', 'R5C6'],
  ['R7C7', 'R7C8'],
];
const vMarks = [
  ['R6C8', 'R6C9'],
  ['R4C4', 'R5C4'],
];

return [
  new Shape('9x9'),

  ...entropicLines.map((cells) => new Entropic(...cells)),
  ...renbanLines.map((cells) => new Renban(...cells)),
  ...xMarks.map(([a, b]) => new X(a, b)),
  ...vMarks.map(([a, b]) => new V(a, b)),
];
