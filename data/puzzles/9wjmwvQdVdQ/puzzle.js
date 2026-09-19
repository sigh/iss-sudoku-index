// Title: Mark tackles Rachel Riley's 'sleepless night' problem
// Author: Unknown
// Video: https://www.youtube.com/watch?v=9wjmwvQdVdQ

// Not a Sudoku puzzle: no payload was ever recorded for this row (status
// no-source), and the video itself has nothing to decode -- it is a solver
// working a tweet shown on screen (external-video-frame-35s.jpg /
// -90s.jpg, identical): "@RachelRileyRR Can you number the colours 1-12
// ???", a handwritten list of 12 colour names with an empty box beside each,
// and seven colour-mixing equations to its right, each lined up with the
// colour it defines. The rules are exactly those equations plus the
// question itself: assign each colour a distinct whole number 1-12 so every
// equation holds.
//
// Encoded as a 1x12 row of cells, one per colour, in the alphabetical order
// the tweet lists them -- the row's own all-different is exactly the
// "number the colours 1-12" bijection, so no separate AllDifferent is
// needed. NoBoxes drops the box region a 1x12 grid would otherwise tile
// (identical to the row itself, so meaningless here). Each drawn equation
// "X = A + B[ + C]" is a literal linear equation over the colour cells via
// Sum's coefficient form (the defined colour's coefficient is -1, giving
// A + B [+ C] - X = 0). BLACK, BLUE, RED, WHITE and YELLOW carry no drawn
// equation of their own -- the tweet leaves that column blank beside them --
// so they are constrained only by all-different and by appearing on the
// right of other colours' equations.

const shape = new Shape('1x12', 12);

// Column order transcribed top-to-bottom from the tweet image (both frames
// agree): BLACK, BLUE, BROWN, GREEN, GREY, ORANGE, PINK, PURPLE, RED,
// TURQUOISE, WHITE, YELLOW.
const NAMES = [
  'BLACK', 'BLUE', 'BROWN', 'GREEN', 'GREY', 'ORANGE',
  'PINK', 'PURPLE', 'RED', 'TURQUOISE', 'WHITE', 'YELLOW',
];
const C = {};
NAMES.forEach((name, i) => { C[name] = makeCellId(1, i + 1); });

// Each equation is transcribed from the row of the image it is printed on
// (aligned with the colour it defines; RED's row carries no equation).
// EqualSum('s equal-segment-totals form states each one directly: the
// defined colour is a one-cell segment, equal in sum (i.e. equal in value)
// to the segment of colours it is defined from.
const equations = [
  new EqualSum([C.RED, C.BLUE, C.YELLOW], [C.BROWN]),  // BROWN = RED + BLUE + YELLOW
  new EqualSum([C.BLUE, C.YELLOW], [C.GREEN]),          // GREEN = BLUE + YELLOW
  new EqualSum([C.BLACK, C.WHITE], [C.GREY]),           // GREY = BLACK + WHITE
  new EqualSum([C.RED, C.YELLOW], [C.ORANGE]),          // ORANGE = RED + YELLOW
  new EqualSum([C.RED, C.WHITE], [C.PINK]),             // PINK = RED + WHITE
  new EqualSum([C.RED, C.BLUE], [C.PURPLE]),            // PURPLE = RED + BLUE
  new EqualSum([C.BLUE, C.GREEN], [C.TURQUOISE]),       // TURQUOISE = BLUE + GREEN
];

return [
  shape,
  new NoBoxes(),
  ...equations,
];
