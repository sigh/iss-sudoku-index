// Title: Sixteen Quad Sums
// Author: curlingclips
// Video: https://www.youtube.com/watch?v=KKZTUBLzCto
// Source: https://sudokupad.app/c2a6l3i1vz

// Normal sudoku rules apply.
//
// A black dot sits at the corner shared by four cells. Around each black
// dot, one of the four surrounding digits equals the sum of the other
// three.

// Each quad is named by its top-left cell (row, col); the other three
// cells are its right, below, and diagonal neighbours.
const quadTopLefts = [
  [1, 1], [2, 2], [1, 4], [2, 5], [1, 7], [2, 7], [4, 7], [5, 8],
  [4, 5], [5, 4], [7, 2], [8, 1], [6, 3], [4, 6], [3, 5], [8, 8],
];

// One of the 4 scanned cells equals the sum of the other 3, i.e. one digit
// v satisfies v == total - v, i.e. total == 2v: the total of all 4 digits
// is even and half the total appears among them. NFA state must not itself
// be a bare array (the builder treats an array result as a set of
// alternate next states), so the seen-values multiset is wrapped in an
// object; values are kept sorted (order doesn't affect the sum condition)
// to collapse permutations into one state and stay under the state limit.
function oneIsSumOfOthers(name, cells) {
  const spec = {
    startState: { values: [] },
    transition: ({ values }, value) =>
      ({ values: [...values, value].sort((a, b) => a - b) }),
    accept: ({ values }) => {
      const total = values.reduce((a, b) => a + b, 0);
      return total % 2 === 0 && values.includes(total / 2);
    },
    maxDepth: cells.length,
  };
  const encoded = NFA.encodeSpec(spec, 9);
  return new NFA(encoded, name, ...cells);
}

return [
  new Shape('9x9'),
  ...quadTopLefts.map(([r, c], i) => {
    const cells = [
      makeCellId(r, c), makeCellId(r, c + 1),
      makeCellId(r + 1, c), makeCellId(r + 1, c + 1),
    ];
    return oneIsSumOfOthers(`QD${i + 1}`, cells);
  }),
];
