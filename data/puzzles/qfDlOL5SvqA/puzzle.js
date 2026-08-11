// Title: Archery Target
// Author: Nahileon
// Video: https://www.youtube.com/watch?v=qfDlOL5SvqA
// Source: https://app.crackingthecryptic.com/sudoku/Hdpt6h9nBt

// Normal sudoku (default row/col/box all-different from Shape). Three givens.
// The grey loop around box 5's outer 8 cells is a thermometer: digits must
// strictly increase from a hidden bulb to a hidden tip. Since the loop is
// closed and neither endpoint is marked, "hidden bulb/tip" is read as: some
// edge of the 8-cycle is the (unmarked) join between tip and bulb, and going
// the other way around from bulb to tip the 8 values strictly increase. That
// is encoded as an Or over every (starting cell, direction) pair -- 8
// rotations x 2 directions -- rather than choosing one, since the rules
// state the positions are genuinely hidden.
//
// The "outer three rings" equal-sum-between-9s rule is NOT encoded. It
// requires comparing sums of solver-discovered segments (cut wherever a 9
// lands) around a 32/24/16-cell cyclic sequence, with an unknown,
// solver-chosen number of segments. A hand-built NFA comparing two such
// accumulated sums was probed directly against ISS's 4096 compile-time state
// cap: even a 24-cell chain with the running sum clamped at 60 sits right at
// the cap, and a clamp of 80 already exceeds it -- and this puzzle's rings
// need sums well above that (a single segment can legitimately span most of
// a 32-cell ring).

const LOOP = ['R4C6', 'R4C5', 'R4C4', 'R5C4', 'R6C4', 'R6C5', 'R6C6', 'R5C6'];

// Every (start cell, direction) reading of the closed 8-cell loop as an open
// thermometer chain: 8 rotations, each taken forwards and reversed.
const rotate = (arr, i) => arr.slice(i).concat(arr.slice(0, i));
const thermoOrderings = [];
for (let i = 0; i < LOOP.length; i++) {
  const rotated = rotate(LOOP, i);
  thermoOrderings.push(rotated);
  thermoOrderings.push([...rotated].reverse());
}
const thermoBranches = thermoOrderings.map(order => new Thermo(...order));

return [
  new Shape('9x9'),
  new Given('R2C8', 5),
  new Given('R7C6', 7),
  new Given('R8C1', 3),
  new Or(thermoBranches),
];
