// Title: Spirals
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=-Z1YhoTS4Y4
// Source: https://app.crackingthecryptic.com/sudoku/6G9qPHDDGT

// Normal sudoku rules apply. Adjacent cells along a grey line differ by 1 or
// 2. One `Pair` per drawn stroke below applies that relation to every
// consecutive cell pair in the stroke's path; the stroke cell lists are
// transcribed from the drawn line geometry. Two cells (R3C3, R7C7) each end
// one stroke and start another, so the grey-line network branches rather
// than forming a single path -- each stroke's own consecutive pairs still
// apply independently.
const diffOneOrTwo = Pair.fnToKey((a, b) => {
  const d = Math.abs(a - b);
  return d === 1 || d === 2;
}, 9);

const greyLines = [
  ['R2C2', 'R2C3', 'R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1', 'R3C2', 'R3C3',
   'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7', 'R7C8',
   'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7', 'R8C7', 'R8C8'],
  ['R1C7', 'R2C7', 'R2C8', 'R3C8', 'R3C9', 'R2C9', 'R1C9', 'R1C8', 'R1C7'],
  ['R3C3', 'R4C3', 'R5C3', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R5C6', 'R4C6',
   'R4C5', 'R4C4', 'R5C4', 'R5C5'],
  ['R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3'],
  ['R7C2', 'R8C2', 'R8C3'],
  ['R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7'],
];

const lines = greyLines.map(
  (cells, i) => new Pair(diffOneOrTwo, `Grey line ${i + 1}`, ...cells));

return [
  new Shape('9x9'),
  new Given('R1C1', 7),
  new Given('R4C2', 6),
  ...lines,
];
