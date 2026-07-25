// Title: 1. Same Diffurence
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=OSMDYUt6kuA
// Source: https://sudokupad.app/osvatsuvjs
//
// Normal 4x4 sudoku (rows, columns, 2x2 boxes). An eye marks two orthogonally
// adjacent cells whose digits are consecutive (Kropki white dot). A nose
// marks two orthogonally adjacent cells and points at the lower of the two.
// A yellow Same Difference line requires every pair of adjacent digits along
// it to have the same difference; that common difference is not given and
// is not necessarily the same from one Same Difference line to another
// (there is only one line here).

// Eye: drawn on the vertical edges R2C2/R3C2 and R2C3/R3C3.
const eyes = [
  ['R2C2', 'R3C2'],
  ['R2C3', 'R3C3'],
];

// Nose: drawn as ">" on the horizontal edge R3C2/R3C3. The tip points right,
// at R3C3, so R3C3 is the lower value: GreaterThan reads its first cell as
// the larger one.
const nose = ['R3C2', 'R3C3'];

// Same Difference line: the single yellow line's cell path, running around
// the grid's outer ring and back in through the two upper-centre cells.
const sameDifferenceLine = [
  'R2C2', 'R1C1', 'R2C1', 'R3C1', 'R4C2', 'R4C3', 'R3C4', 'R2C4', 'R1C4', 'R2C3',
];

// The common difference is unknown up front and must be established from the
// line's own first step, then held constant: state carries the previous
// digit and the difference fixed by the first pair (null until then).
const sameDifferenceSpec = NFA.encodeSpec({
  startState: { prev: null, diff: null },
  transition: ({ prev, diff }, value) => {
    if (prev === null) return { prev: value, diff: null };
    const d = Math.abs(value - prev);
    if (diff === null) return { prev: value, diff: d };
    if (d !== diff) return undefined;
    return { prev: value, diff };
  },
  accept: () => true,
}, 4);

return [
  new Shape('4x4'),

  ...eyes.map(cells => new WhiteDot(...cells)),
  new GreaterThan(...nose),
  new NFA(sameDifferenceSpec, 'SameDifference', ...sameDifferenceLine),
];
