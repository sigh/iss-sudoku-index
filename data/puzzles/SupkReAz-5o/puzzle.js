// Title: Renrenbanban
// Author: Darth Paradox
// Video: https://www.youtube.com/watch?v=SupkReAz-5o
// Source: https://app.crackingthecryptic.com/sudoku/J74NR4224q

// Standard sudoku, plus:
// - Digits must not repeat along the marked diagonal (Diagonal).
// - Grey lines are palindromes: same sequence of digits in both directions
//   along the line (Palindrome).
// - Purple lines are Double Renban lines: each contains two equal-sized sets
//   of consecutive digits, which may overlap partially or completely, with
//   the digits in any order along the line.

// A Double Renban line's digit multiset is the bag-union of two equal-length
// runs of consecutive integers (the two runs may be identical or overlap).
// Since order along the line is unconstrained, this is a pure multiset-
// membership check: enumerate every admissible pair of same-length runs
// drawn from 1-9, merge each pair's digit counts into a ContainExact value
// string, and accept the line if any pairing's bag matches (Or). Checked
// against the rules' own worked examples for a six-cell line (123123,
// 172839, 142332).
const doubleRenban = (...cells) => {
  const k = cells.length / 2;
  const runs = [];
  for (let start = 1; start + k - 1 <= 9; start++) {
    const run = [];
    for (let v = start; v < start + k; v++) run.push(v);
    runs.push(run);
  }
  const options = [];
  for (let i = 0; i < runs.length; i++) {
    for (let j = i; j < runs.length; j++) {
      const counts = new Map();
      for (const v of [...runs[i], ...runs[j]]) {
        counts.set(v, (counts.get(v) || 0) + 1);
      }
      const valueStr = [...counts.entries()]
        .sort((a, b) => a[0] - b[0])
        .flatMap(([v, c]) => Array(c).fill(v))
        .join('_');
      options.push(new ContainExact(valueStr, ...cells));
    }
  }
  return new Or(options);
};

return [
  new Shape('9x9'),
  new Given('R5C5', 4),

  new Diagonal(-1),

  // Palindromes (grey); cell paths from the drawn line geometry.
  new Palindrome('R6C1', 'R6C2', 'R7C3'),
  new Palindrome('R4C1', 'R4C2', 'R3C3', 'R2C3', 'R1C3'),

  // Double Renban lines (purple); cell paths from the drawn line geometry.
  doubleRenban('R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R1C4'),
  doubleRenban('R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9'),
  doubleRenban('R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7', 'R9C6'),
  doubleRenban('R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1', 'R8C1', 'R7C1', 'R6C1'),
  doubleRenban(
    'R2C4', 'R2C3', 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2',
    'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R7C8'),
  doubleRenban('R6C8', 'R5C8', 'R4C8', 'R3C8', 'R2C8', 'R2C7', 'R2C6', 'R2C5'),
  doubleRenban('R3C3', 'R4C3', 'R5C3', 'R5C4'),
  doubleRenban('R7C3', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R7C6'),
  doubleRenban('R7C7', 'R6C7', 'R5C7', 'R4C7'),
];
