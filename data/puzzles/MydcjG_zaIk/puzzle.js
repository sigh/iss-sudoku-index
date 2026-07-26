// Title: Never Odd Or Even
// Author: trufflebear
// Video: https://www.youtube.com/watch?v=MydcjG_zaIk
// Source: https://sudokupad.app/kqj790q2xw

// Normal sudoku, anti-king (native AntiKing), and anti-long-knight (no
// native class -- no two cells a long knight's move apart, i.e. 3 cells
// orthogonally and 1 at right angles, may repeat a digit). Grey lines are
// palindromes. White/black Kropki dots mark consecutive/1:2 pairs; the
// rules state not all dots are shown, so an undotted pair carries no
// information (no StrictKropki).

// A long-knight offset is 3 cells one way, 1 the other, at right angles.
// Restricting to dr > 0 lists each unordered cell pair exactly once; the
// four offsets below are the four directions named in the rules text
// (from R1C4: R2C1, R4C3, R4C5, R2C7). Each offset is replicated across
// every position where both cells stay on the grid; the Replicate's origin
// is the lexicographically-first such position (not R1C1 -- a negative-
// column offset needs a shifted anchor to stay a valid cell id), so this
// uses the raw Replicate constructor rather than graph.makeReplicate().
const graph = cellGraph('9x9');
const longKnightOffsets = [[1, -3], [1, 3], [3, -1], [3, 1]];

const antiLongKnight = longKnightOffsets.map(([dr, dc]) => {
  const r0 = 1;
  const c0 = dc < 0 ? 1 - dc : 1;
  const origin = makeCellId(r0, c0);
  const partner = makeCellId(r0 + dr, c0 + dc);

  const targets = [];
  for (let r = 1; r <= 9; r++) {
    for (let c = 1; c <= 9; c++) {
      if (r + dr >= 1 && r + dr <= 9 && c + dc >= 1 && c + dc <= 9) {
        targets.push(makeCellId(r, c));
      }
    }
  }

  // lint-ok: bare-replicate-constructor
  return new Replicate(
    [new AllDifferent(origin, partner)],
    Replicate.encodeTargetCells(targets, origin, graph),
    origin,
  );
});

// Grey palindrome lines (drawn as five separate grey strokes).
const palindromes = [
  new Palindrome('R3C4', 'R4C5', 'R5C6'),
  new Palindrome('R5C4', 'R6C5', 'R7C6'),
  new Palindrome(
    'R3C1', 'R2C2', 'R1C3', 'R2C3', 'R2C4', 'R3C5', 'R4C6', 'R3C7', 'R2C7',
    'R1C7', 'R1C8'),
  new Palindrome(
    'R7C9', 'R8C8', 'R9C7', 'R8C7', 'R8C6', 'R7C5', 'R6C4', 'R7C3', 'R8C3',
    'R9C3', 'R9C2'),
  new Palindrome('R3C9', 'R4C8', 'R4C7'),
];

// Kropki dots (drawn as edge marks; white background -> white/consecutive
// dot, black background -> black/ratio dot).
const whiteDots = [
  new WhiteDot('R4C3', 'R5C3'),
  new WhiteDot('R4C1', 'R4C2'),
  new WhiteDot('R6C1', 'R7C1'),
  new WhiteDot('R8C8', 'R8C9'),
  new WhiteDot('R6C9', 'R7C9'),
  new WhiteDot('R8C1', 'R9C1'),
];
const blackDots = [
  new BlackDot('R1C9', 'R2C9'),
  new BlackDot('R1C1', 'R1C2'),
];

return [
  new Shape('9x9'),
  new AntiKing(),
  ...antiLongKnight,
  ...palindromes,
  ...whiteDots,
  ...blackDots,
];
