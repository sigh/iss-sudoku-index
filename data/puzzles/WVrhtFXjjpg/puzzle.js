// Title: Skiing through the fog
// Author: ElChiglia
// Video: https://www.youtube.com/watch?v=WVrhtFXjjpg
// Source: https://sudokupad.app/29nTttfqqt

// Normal 9x9 Sudoku, no givens, plus:
//  - Seven slalom gates. A gate is a grey line with a circled "pole" at either
//    end and exactly one cell in between; that middle cell must be strictly
//    between the two pole digits.
//  - A skier's route starts at the arrow in R2C1, steps orthogonally to an
//    adjacent cell, may only go left, right or down, never revisits a cell,
//    never enters a pole cell, and passes through all seven gates by crossing
//    all seven gate lines. Adjacent cells on the route alternate low (1-4) and
//    high (6-9).
//  - The gates are numbered 1 to 7 in the order the route crosses them, and
//    one of a gate's two poles holds its number.
//  - Along the route the gates alternate red and blue.
//  - Cells joined by a white dot are consecutive, by a black dot are in a 1:2
//    ratio, and across an X sum to 10.
// The fog is a play-time reveal effect and is not encoded. The route is not
// required to end at the arrow-to-bar mark in R7C9: the rules name only the
// start arrow, and give the finish no role.

// Pole/middle/pole cells of the seven grey gate lines, listed in the order the
// route crosses them (derived below); each gate's colour is the fill of the two
// circles at that line's ends. That order is blue, red, blue, red, blue, red,
// blue, so the red/blue alternation rule holds for every legal route and adds
// no constraint on the digits.
const gates = [
  ['R1C2', 'R2C2', 'R3C2'],  // gate 1, blue
  ['R3C3', 'R2C4', 'R1C5'],  // gate 2, red
  ['R3C7', 'R3C8', 'R3C9'],  // gate 3, blue
  ['R3C6', 'R4C6', 'R5C6'],  // gate 4, red
  ['R5C2', 'R5C3', 'R5C4'],  // gate 5, blue
  ['R6C5', 'R7C5', 'R8C5'],  // gate 6, red
  ['R6C8', 'R7C8', 'R8C8'],  // gate 7, blue
];

// Route. All twelve poles are barred and the route never goes up, so every row
// is entered at most once and crossed in a single monotone horizontal run.
// Row 3's gate cell R3C8 lies between the poles R3C7 and R3C9, so the row-3 run
// is exactly {R3C8}; likewise R5C3 lies between the poles R5C2 and R5C4, so the
// row-5 run is exactly {R5C3}. Those two pinch points fix the route from the
// R2C1 start all the way to R6C3: R2C1-R2C8 (crossing gates 1 and 2), R3C8
// (gate 3), R4C8-R4C3 (gate 4), R5C3 (gate 5), R6C3.
// From R6C3 the pole R6C5 blocks the way right past C4, so the route drops into
// row 7 from C4, C3, C2 or C1 and then runs right through R7C5 (gate 6) and
// R7C8 (gate 7). All four options place R7C4-R7C8 on the route at the same
// position parities as each other, and differ only in the cell that follows
// R6C3: R6C4 for the C4 drop, and R7C3 for the other three (a C2 or C1 drop
// reaches R7C3 two or four steps later, i.e. at the same parity). So a legal
// route exists exactly when the polarity alternates along one of these two
// shortest routes; every longer legal route contains one of them and imposes
// the alternation on further cells besides.
const routeHead = [
  'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8',
  'R3C8', 'R4C8', 'R4C7', 'R4C6', 'R4C5', 'R4C4', 'R4C3', 'R5C3', 'R6C3',
];
const routeTail = ['R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8'];
// One of the pair is low and the other high, which also keeps 5 off the route.
const oscillate = Pair.fnToKey(
  (a, b) => (a <= 4 && b >= 6) || (a >= 6 && b <= 4), 9);
const routes = ['R6C4', 'R7C3'].map(
  link => new Pair(oscillate, `skier-via-${link}`,
    ...routeHead, link, ...routeTail));

// Dot and X pairs, transcribed from the edge overlays.
const whites = [['R2C4', 'R3C4'], ['R1C5', 'R1C6'], ['R7C3', 'R8C3']];
const blacks = [['R1C1', 'R2C1'], ['R2C1', 'R3C1'], ['R6C1', 'R6C2']];
const xs = [['R2C1', 'R2C2'], ['R4C8', 'R4C9'], ['R9C6', 'R9C7']];

return [
  new Shape('9x9'),
  ...gates.map(cells => new Between(...cells)),
  // Gate n's number appears in one of its two poles.
  ...gates.map(([a, , b], i) => new ContainAtLeast(String(i + 1), a, b)),
  new Or(routes),
  ...whites.map(cells => new WhiteDot(...cells)),
  ...blacks.map(cells => new BlackDot(...cells)),
  ...xs.map(cells => new X(...cells)),
];
