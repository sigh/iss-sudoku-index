// Title: Babbling Brook
// Author: Knickolas
// Video: https://www.youtube.com/watch?v=tNnSaQb2MP4
// Source: https://app.crackingthecryptic.com/sudoku/dh9t3PnBQ4

// Rules encoded here:
//  - Normal sudoku; the grid has no given digits.
//  - The grid is shaded in two colours, each colour orthogonally connected and
//    no 2x2 area monochrome (the YinYang layer YY).
//  - The shading cuts each blue line into maximal runs of consecutive cells of
//    one colour ("passes"). Every pass on a line sums to the same N; N is
//    per-line, not shared between lines. Every line crosses colours at least
//    once, i.e. has two or more passes.
//  - Cells separated by an X sum to 10. The rules do not say the X marks are
//    exhaustive, so no negative X rule is added.
// No rule is omitted. The two colours are unnamed and every rule above treats
// them alike, so the shading comes in swapped pairs; one cell's colour is
// pinned below to fix a representative.

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');

// The ten light-blue strokes, each as its cell path in drawn order. Only the
// order along the stroke matters; some steps are diagonal.
const blueLines = [
  ['R7C8', 'R6C8', 'R5C8', 'R4C8', 'R3C8'],
  ['R1C7', 'R2C6', 'R2C5', 'R2C4', 'R3C3'],
  ['R2C9', 'R2C8', 'R3C7'],
  ['R3C6', 'R4C7', 'R4C6'],
  ['R1C2', 'R2C2', 'R2C3'],
  ['R6C2', 'R5C2', 'R4C2', 'R4C3', 'R4C4'],
  ['R8C8', 'R9C7', 'R9C6'],
  ['R7C3', 'R7C2', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R8C3', 'R8C2'],
  ['R8C6', 'R8C5', 'R8C4'],
  ['R5C5', 'R6C5', 'R6C4'],
];

// Cut `cells` after every position i whose bit is set in `mask`, giving the
// passes that shading pattern produces.
const splitPasses = (cells, mask) => cells.reduce((passes, cell, i) => {
  passes[passes.length - 1].push(cell);
  if (i + 1 < cells.length && (mask & (1 << i))) passes.push([]);
  return passes;
}, [[]]);

// Which passes a line has is fixed by which of its L-1 consecutive pairs share
// a colour, so enumerate those patterns. The YY layer holds exactly two values,
// so "same colour" is SameValues on the pair and "colour change" is
// AllDifferent on it. mask starts at 1: mask 0 is the all-one-colour line the
// rules forbid.
const lineConstraint = (cells) => {
  const shadeCells = shade.at(cells);
  const masks = Array.from(
    { length: (1 << (cells.length - 1)) - 1 }, (_, i) => i + 1);

  return new Or(masks.map(mask => new And([
    ...shadeCells.slice(0, -1).map(
      (shadeCell, i) => ((mask & (1 << i))
        ? new AllDifferent(shadeCell, shadeCells[i + 1])
        : new SameValues(2, shadeCell, shadeCells[i + 1]))),
    new EqualSum(...splitPasses(cells, mask)),
  ])));
};

return [
  new Shape('9x9'),
  new YinYang(),
  // White X on the border between R1C1 and R2C1.
  new X('R1C1', 'R2C1'),
  // Representative of the colour swap, not a puzzle clue: R1C1 takes the YY
  // layer's first colour.
  new Given(shade.at('R1C1'), 1),
  ...blueLines.map(lineConstraint),
];
