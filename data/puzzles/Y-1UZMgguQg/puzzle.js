// Title: Diagonal Sum Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=Y-1UZMgguQg
// Source: https://cracking-the-cryptic.web.app/sudoku/hLN6FQ33d8

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Ten clues printed outside the grid each point along one diagonal. A clue's
// value is the total of the digits on its diagonal that come strictly after
// the first appearance of that diagonal's largest digit, reading from the
// clue inward; the largest digit itself, and every cell before it, is
// excluded. Two diagonals (the two length-9 ones) are clued from both ends,
// so the "largest digit" and its first appearance are found independently
// per clue, scanning from that clue's own end.
//
// Each clue is one NFA scanning its diagonal from the clue inward. State
// carries {max: largest digit seen so far, sum: running total since max was
// last strictly increased}. A strictly larger digit becomes the new split
// point (sum resets to 0, that cell itself is not counted); a digit equal to
// or below the current max is "after" the max's first appearance and adds to
// sum -- including a later tie, which is not a new split point. sum is
// clamped at target+1 (an unrecoverable-reject sink) so state stays bounded
// regardless of how large the true running total could get.
function sumAfterMaxNFA(target) {
  return NFA.encodeSpec({
    startState: { max: 0, sum: 0 },
    transition: ({ max, sum }, value) => {
      if (value > max) return { max: value, sum: 0 };
      return { max, sum: Math.min(sum + value, target + 1) };
    },
    accept: ({ max, sum }) => sum === target,
  }, 9);
}

// [clue total, diagonal cells ordered from the clue inward] -- each cell path
// starts at the clue's adjacent corner/edge cell and follows the diagonal to
// the far side of the grid.
const diagonalClues = [
  [52, ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9']],
  [46, ['R9C9', 'R8C8', 'R7C7', 'R6C6', 'R5C5', 'R4C4', 'R3C3', 'R2C2', 'R1C1']],
  [13, ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1']],
  [2, ['R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9']],
  [5, ['R1C3', 'R2C2', 'R3C1']],
  [6, ['R3C9', 'R2C8', 'R1C7']],
  [11, ['R7C1', 'R8C2', 'R9C3']],
  [9, ['R9C7', 'R8C8', 'R7C9']],
  [17, ['R1C6', 'R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C1']],
  [31, ['R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9']],
];

return [
  new Shape('9x9'),
  ...diagonalClues.map(
    ([target, cells]) => new NFA(sumAfterMaxNFA(target), `Diag${target}`, ...cells)),
];
