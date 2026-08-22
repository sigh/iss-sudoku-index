// Title: Whisperstop World Tour
// Author: starwarigami
// Video: https://www.youtube.com/watch?v=1et1CaeJ9ko
// Source: https://app.crackingthecryptic.com/sudoku/PtD46JNLTP

// Standard 9x9 sudoku (rows/columns/3x3 boxes).
//
// Nine cities, each a pair of orthogonally-adjacent cells: a green departure
// lounge and a red arrival hall. Each city's arrival-hall digit is the
// minimum difference for the whisper leg that starts at that same city's own
// departure lounge and runs to the next city's arrival hall. Each city's two
// cells also carry a control-tower dot: white = consecutive, black = 1:2
// ratio. Every city pair shares a row or column, so the two cells are already
// forced distinct by ordinary sudoku rules -- the dot is the only extra
// content the pairing carries.

const given = new Given('R3C1', 5); // Berlin's arrival hall, printed given.

// Control-tower dots, one per city (edge overlay between its two cells).
const whiteDots = [ // consecutive
  ['R2C1', 'R3C1'], // Berlin
  ['R3C3', 'R3C4'], // Amsterdam
  ['R3C5', 'R3C6'], // Moscow
  ['R1C6', 'R1C7'], // Beijing
  ['R7C8', 'R8C8'], // Sydney
].map(cells => new WhiteDot(...cells));

const blackDots = [ // 1:2 ratio
  ['R2C7', 'R3C7'], // Singapore
  ['R6C2', 'R6C3'], // London
  ['R8C1', 'R8C2'], // Los Angeles
  ['R7C5', 'R7C6'], // Tokyo
].map(cells => new BlackDot(...cells));

// Whisper legs: [minimum-difference reference cell (the leg's departure
// city's own arrival hall), ...leg cells in order]. The reference cell is
// never one of the leg's own cells -- it sits in the adjacent city pair.
// Route and cell lists are read off the drawn line geometry and cage/underlay
// labels.
const legs = [
  ['R3C1', ['R2C1', 'R1C1', 'R1C2', 'R1C3', 'R2C3', 'R2C2', 'R3C2', 'R3C3']], // Berlin -> Amsterdam
  ['R3C3', ['R3C4', 'R4C4', 'R4C3', 'R4C2', 'R4C1', 'R5C1', 'R5C2', 'R6C2']], // Amsterdam -> London
  ['R6C2', ['R6C3', 'R6C4', 'R7C4', 'R7C3', 'R7C2', 'R7C1', 'R8C1']], // London -> Los Angeles
  ['R8C1', ['R8C2', 'R8C3', 'R8C4', 'R9C4', 'R9C5', 'R9C6', 'R8C6', 'R7C6']], // Los Angeles -> Tokyo
  ['R7C6', ['R7C5', 'R6C5', 'R5C5', 'R4C5', 'R4C6', 'R5C6', 'R6C6', 'R6C7', 'R7C8']], // Tokyo -> Sydney
  ['R7C8', ['R8C8', 'R8C9', 'R7C9', 'R6C8', 'R5C8', 'R5C7', 'R4C7', 'R3C7']], // Sydney -> Singapore
  ['R3C7', ['R2C7', 'R2C8', 'R2C9', 'R1C9', 'R1C8', 'R1C7']], // Singapore -> Beijing
  ['R1C7', ['R1C6', 'R1C5', 'R2C5', 'R3C5']], // Beijing -> Moscow
];

// NFA reading [referenceCell] as one segment then the leg cells as a second
// segment (multiSegment): the reference digit becomes the fixed "threshold"
// once read, then every consecutive pair of leg cells must differ by at
// least that threshold. This lets one machine encode a whisper whose minimum
// difference is itself a solved digit rather than a fixed constant.
const minDiffSpec = NFA.encodeSpec({
  startState: { threshold: null, prev: null },
  transition: ({ threshold, prev }, value) => {
    if (value === SEGMENT_BREAK) return { threshold: prev, prev: null };
    if (threshold === null) return { threshold: null, prev: value }; // reading the reference cell
    if (prev === null) return { threshold, prev: value }; // first leg cell, nothing to check yet
    if (Math.abs(value - prev) < threshold) return undefined; // reject: too close
    return { threshold, prev: value };
  },
  accept: ({ threshold }) => threshold !== null,
  // Longest leg is the reference cell + break + 9 leg cells (Tokyo -> Sydney).
  maxDepth: 11,
}, 9, { multiSegment: true });

const whisperLegs = legs.map(
  ([refCell, cells]) => new NFA(minDiffSpec, 'min-diff', [refCell], cells));

return [
  new Shape('9x9'),
  given,
  ...whiteDots,
  ...blackDots,
  ...whisperLegs,
];
