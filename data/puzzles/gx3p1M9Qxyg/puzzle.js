// Title: First Row Service
// Author: Manus Hand
// Video: https://www.youtube.com/watch?v=gx3p1M9Qxyg
// Source: https://app.crackingthecryptic.com/sudoku/mfL29d7tG7

// Normal sudoku (9x9, standard 3x3 boxes, digits 1-9), no givens.
//
// Arrows: an arm's digits sum to the value shown in its attached circle
// (the circle's own cell, whose digit equals the sum) or pill (a 2-cell
// mark read downwards, top cell = tens digit, bottom cell = ones digit).
// Several arms are drawn from the same circle/pill (multiple strokes
// converging on one bulb mark); each still gets its own
// arm-sums-to-bulb constraint. Cell lists below are transcribed from
// the puzzle's drawn arrow paths.
//
// Purple lines: Renban (consecutive digits, any order, non-repeating).
// The 4-cell mark is a closed loop (drawn with its first cell repeated
// at the end); Renban is a set-based class so the repeated endpoint is
// simply dropped -- no wraparound edge to add.
//
// Green lines: Whisper(5) (adjacent digits differ by at least 5).
//
// White dots: WhiteDot (Kropki consecutive). Black dots: BlackDot
// (Kropki 1:2 ratio). Both sit on cell edges (white fill = white dot,
// black fill = black dot).

const pillCells = ['R3C7', 'R4C7'];
const pillArms = [
  ['R2C7', 'R2C8', 'R2C9'],
  ['R2C7', 'R2C6', 'R2C5', 'R2C4', 'R2C3'],
];

const circleArrows = [
  { bulb: 'R3C2', arms: [
    ['R3C1', 'R4C1'],
    ['R4C2', 'R5C2', 'R6C2', 'R7C1'],
    ['R4C2', 'R5C3'],
    ['R4C2', 'R5C2', 'R6C3', 'R7C3'],
  ]},
  { bulb: 'R7C4', arms: [['R6C4', 'R5C4']] },
  { bulb: 'R7C6', arms: [['R6C6', 'R5C6']] },
  { bulb: 'R4C9', arms: [
    ['R5C9', 'R4C8', 'R3C8'],
    ['R5C9', 'R6C9', 'R6C8', 'R7C7'],
  ]},
];

const whisperPairs = [
  ['R5C3', 'R5C4'],
  ['R5C6', 'R5C7'],
];

const renbanLines = [
  ['R8C1', 'R8C2'],
  ['R8C4', 'R8C5'],
  ['R8C7', 'R8C8'],
  ['R5C5', 'R6C4', 'R6C5', 'R6C6'],
];

const whiteDots = [
  ['R1C2', 'R1C3'],
  ['R9C6', 'R9C7'],
];

const blackDots = [
  ['R3C1', 'R4C1'],
  ['R5C9', 'R6C9'],
];

return [
  new Shape('9x9'),

  ...pillArms.map((arm) => new PillArrow(2, ...pillCells, ...arm)),

  ...circleArrows.flatMap(({ bulb, arms }) =>
    arms.map((arm) => new Arrow(bulb, ...arm))),

  ...whisperPairs.map(([a, b]) => new Whisper(5, a, b)),

  ...renbanLines.map((cells) => new Renban(...cells)),

  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),

  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
];
