// Title: Desert Mirage Double Vision
// Author: TheKingofApples
// Video: https://www.youtube.com/watch?v=wIAkfaSRZqE
// Source: https://app.crackingthecryptic.com/sudoku/g9mprpmd3g

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Givens: R1C8=9, R7C1=4, R8C2=8, R9C3=7.
//
// Nine diagonal lines are each drawn twice: once grey (thermometer colour)
// and once orange (palindrome colour), both times over the identical pair
// of drawn endpoints -- one drawn line per position, not two clues. The
// rules make this explicit: "All thermometers have palindromes above them
// and all Palindromes have thermometers under them." So every one of the
// nine lines carries BOTH the thermometer rule ("digits ... increase from
// the bulb end") and the palindrome rule ("reading the same when reversed")
// at once.
//
// Applying both rules to one end-to-end direction is unsatisfiable for any
// line with >= 2 cells: a strictly increasing run cannot also read the same
// forwards and backwards (that refutes the plain single-bulb-at-an-end
// reading without needing to solve the puzzle). Each line also carries a
// filled grey circle underlay, matching the thermometer layer's colour,
// that sits at the path's geometric CENTRE cell, not at either drawn end --
// true for all nine lines. Both the drawn-art fact (the bulb marker at the
// centre) and the unsatisfiability of the naive reading point to the same
// resolution: the bulb is the centre cell, and each line is really two
// thermometer arms sharing that one bulb, increasing outward in both
// directions from it, while the same (odd-length) full path is
// simultaneously one palindrome about that centre.
//
// Endpoints below are each line's two drawn waypoints (the grey layer; the
// orange layer repeats the same endpoints in reverse). The cells between
// them are filled in by unit diagonal steps -- every one of these lines is
// a straight diagonal.

function diagonalPath(r1, c1, r2, c2) {
  const dr = Math.sign(r2 - r1);
  const dc = Math.sign(c2 - c1);
  const len = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1));
  const cells = [];
  for (let i = 0; i <= len; i++) {
    cells.push(makeCellId(r1 + dr * i, c1 + dc * i));
  }
  return cells;
}

// [r1, c1, r2, c2] per line, transcribed from the drawn line endpoints
// (converted from the source's 0-indexed [row+0.5, col+0.5] coordinate
// format to 1-indexed row/col).
const LINE_ENDPOINTS = [
  [1, 4, 3, 2],
  [3, 3, 5, 1],
  [1, 7, 7, 1],
  [1, 9, 5, 5],
  [6, 4, 8, 2],
  [7, 4, 5, 6],
  [9, 3, 3, 9],
  [6, 9, 8, 7],
  [7, 7, 9, 5],
];

const doubleVisionLines = LINE_ENDPOINTS.flatMap(([r1, c1, r2, c2]) => {
  const path = diagonalPath(r1, c1, r2, c2);
  const mid = (path.length - 1) / 2; // every path here has odd length
  const armToStart = path.slice(0, mid + 1).reverse(); // bulb (centre) first
  const armToEnd = path.slice(mid); // bulb (centre) first
  return [
    new Thermo(...armToStart),
    new Thermo(...armToEnd),
    new Palindrome(...path),
  ];
});

return [
  new Shape('9x9'),
  new Given('R1C8', 9),
  new Given('R7C1', 4),
  new Given('R8C2', 8),
  new Given('R9C3', 7),
  ...doubleVisionLines,
];
