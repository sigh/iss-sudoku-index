// Title: Renrenbanban
// Author: Angelo
// Video: https://www.youtube.com/watch?v=hm7vBJGg1_A
// Source: https://app.crackingthecryptic.com/sudoku/4HJbTHdMfn

// Standard Sudoku (default 3x3 boxes), anti-knight, the one given, and five
// coloured lines. Each line's rule (from the rules text): "contains a set of
// consecutive digits" and "any digit appearing on a line must appear on that
// line at least twice" -- no upper bound on repeats. "Consecutive digits" is
// plural, so a window of exactly one repeated digit is not a candidate
// reading; every window has at least two distinct values.
//
// A window is realized as the branch of an Or: pin every line cell's
// candidates to the window (Given), and require each window value to occur
// at least twice on the line (ContainAtLeast, values doubled). A window of
// size k needs at least 2k cells for every value to reach its floor, so k is
// bounded by floor(line.length / 2); windows failing that bound are omitted
// as vacuous (ContainAtLeast could never be met), not as an approximation.
function consecutiveRepeatedLine(cells) {
  const maxK = Math.min(9, Math.floor(cells.length / 2));
  const branches = [];
  for (let k = 2; k <= maxK; k++) {
    for (let start = 1; start + k - 1 <= 9; start++) {
      const windowValues = Array.from({ length: k }, (_, i) => start + i);
      branches.push(new And([
        ...cells.map(cell => new Given(cell, ...windowValues)),
        new ContainAtLeast(
          windowValues.flatMap(v => [v, v]).join('_'), ...cells),
      ]));
    }
  }
  return new Or(branches);
}

// Cell lists transcribed from the drawn line waypoints.
const lines = [
  ['R3C7', 'R3C6', 'R3C5', 'R3C4', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3',
    'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R6C7', 'R5C7', 'R4C7'],
  ['R2C1', 'R2C2', 'R2C3', 'R3C4', 'R4C4', 'R5C3', 'R5C2'],
  ['R9C6', 'R8C6', 'R7C7', 'R6C8', 'R6C9'],
  ['R7C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R6C5'],
  ['R3C3', 'R2C4', 'R3C5', 'R4C6', 'R5C6'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  new Given('R2C4', 7),
  ...lines.map(consecutiveRepeatedLine),
];
