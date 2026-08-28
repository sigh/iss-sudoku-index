// Title: Pi-Crossed
// Author: Joe Moed
// Video: https://www.youtube.com/watch?v=R3F9LXFhHks
// Source: https://tinyurl.com/8dp9vayb

// Rules encoded:
// - Normal sudoku rules (9x9, rows/columns/3x3 boxes all-different -- ISS
//   default).
// - Digits cannot repeat along either main diagonal.
// - Digits in cages must sum to the cage total, no repeats within a cage.
// - Digits on a green line must differ by at least 5 (adjacent cells).
// - Digits separated by a white dot must be consecutive. The payload's
//   "difference" entries carry no explicit value, which is the f-puzzles
//   default for a white (Kropki) dot.
// - Digits in each coloured ring must form the first eight digits of Pi
//   (3, 1, 4, 1, 5, 9, 2, 6), read starting from any cell of the ring, going
//   either clockwise or counter-clockwise. The source marks no start cell or
//   direction, so every one of the 8 starting points x 2 directions is a live
//   candidate; encoded as a disjunction over all 16 full-ring assignments per
//   ring (see ringReading below).

const graph = cellGraph('9x9');

// -- Pi rings -------------------------------------------------------------
// The first eight digits of Pi: 3.1415926.
const PI_DIGITS = [3, 1, 4, 1, 5, 9, 2, 6];

// Each ring is an octagon of 8 shaded cells (from the payload's "c" cell
// colours: #FFD0D0 pink, #B0FFB0 palegreen) surrounding an unshaded 2x2
// block. Listed here in clockwise geometric order starting at the ring's
// top-left cell.
const PINK_RING = ['R2C3', 'R2C4', 'R3C5', 'R4C5', 'R5C4', 'R5C3', 'R4C2', 'R3C2'];
const GREEN_RING = ['R5C6', 'R5C7', 'R6C8', 'R7C8', 'R8C7', 'R8C6', 'R7C5', 'R6C5'];

// Disjoin over every (start cell, direction) pairing: for each of the 8
// possible starting positions in the clockwise list and each direction
// (+1 = clockwise, -1 = counter-clockwise), pin the ring cells to the digits
// of Pi read from that start in that direction. 8 starts x 2 directions = 16
// candidate full assignments.
function ringReading(ring) {
  const n = ring.length;
  const readings = [];
  for (let start = 0; start < n; start++) {
    for (const dir of [1, -1]) {
      const assignment = PI_DIGITS.map(
        (digit, i) => new Given(ring[(((start + dir * i) % n) + n) % n], digit));
      readings.push(new And(assignment));
    }
  }
  return new Or(readings);
}

// -- Cages ------------------------------------------------------------------
// Cells/totals from the payload's killercage array.
const cages = [
  [7, 'R4C5', 'R4C6', 'R5C6'],
  [22, 'R8C1', 'R9C1', 'R9C2'],
  [22, 'R5C4', 'R6C4', 'R6C5'],
];

// -- White dots ---------------------------------------------------------
// From the payload's difference array (no "value" -> default white/Kropki
// dot, consecutive).
const whiteDots = [
  ['R7C2', 'R7C3'],
  ['R6C6', 'R7C6'],
];

return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  new Whisper(5, 'R1C8', 'R2C9'),
  ringReading(PINK_RING),
  ringReading(GREEN_RING),
];
