// Title: Ready, Set, Go
// Author: Michael Lefkowitz & Riffclown
// Video: https://www.youtube.com/watch?v=S0MqPK2bl5c
// Source: https://sudokupad.app/fup09zll9h

// Normal Sudoku. Opposite immediate neighbours of each stone obey its
// difference (white) or ratio (black), using the stone cell as N.
// Only axes with a neighbour on both sides have an opposite pair.

// Stone centres and colours from the drawn circles.
const white = [[4,4], [4,2], [4,8], [2,6], [7,6], [7,1], [7,4], [9,3]];
const black = [[5,5], [3,7], [3,1], [8,9]];

// Scan [N, first flank, second flank]; state retains N and the first flank,
// then accepts precisely the specified arithmetic relation.
function stoneSpec(ratio) {
  return NFA.encodeSpec({
    startState: {phase: 0},
    transition: (s, v) => {
      if (s.phase === 0) return {phase: 1, n: v};
      if (s.phase === 1) return {phase: 2, n: s.n, a: v};
      if (s.phase === 2 && (ratio
          ? Math.max(s.a, v) === s.n * Math.min(s.a, v)
          : Math.abs(s.a - v) === s.n)) return {phase: 3};
      return undefined;
    },
    accept: s => s.phase === 3,
    maxDepth: 3,
  }, 9);
}
const difference = stoneSpec(false);
const ratio = stoneSpec(true);
function stones(positions, spec, name) {
  return positions.flatMap(([r,c]) => {
    const axes = [];
    if (r > 1 && r < 9) axes.push([[r-1,c], [r+1,c]]);
    if (c > 1 && c < 9) axes.push([[r,c-1], [r,c+1]]);
    return axes.map(pair => new NFA(spec, name,
      [makeCellId(r,c), ...pair.map(([a,b]) => makeCellId(a,b))]));
  });
}
return [
  new Shape('9x9'),
  ...stones(white, difference, 'White stone'),
  ...stones(black, ratio, 'Black stone'),
];
