// Title: Yin Doubles Yang
// Author: damo_89
// Video: https://www.youtube.com/watch?v=ZZglfDTQ2zQ
// Source: https://sudokupad.app/p0xbzd5rlx

// Normal Sudoku applies. Yin-Yang shading uses two connected orthogonal regions
// with no monochrome 2x2 block. Each drawn cage has distinct digits and sums its
// digits with shaded digits counted twice.

// The doubled-cage NFA multiplies each digit by its shade cell's raw value
// (1 or 2), so it only needs the shade Var group; the native YinYang
// constraint assigns those same two values, one per region, and with no
// pin fixing which physical region is which, the formula's result is the
// same regardless of which region ends up holding value 2.
const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');

// Drawn cage cells and corner totals from the source payload.
const cages = [
  [51, ['R8C1', 'R8C2', 'R9C1', 'R9C2']],
  [19, ['R1C1', 'R2C1']], [19, ['R1C4', 'R2C3', 'R2C4']],
  [28, ['R2C5', 'R3C5']], [39, ['R8C4', 'R8C5', 'R8C6']],
  [20, ['R9C8', 'R9C9']], [9, ['R8C8', 'R8C9']],
  [10, ['R7C7', 'R8C7']], [7, ['R4C9', 'R5C9', 'R6C9']],
  [35, ['R2C7', 'R2C8', 'R2C9', 'R3C8']], [12, ['R1C6', 'R2C6']],
  [12, ['R3C6', 'R3C7', 'R4C6']], [49, ['R4C7', 'R4C8', 'R5C6', 'R5C7']],
  [12, ['R5C5', 'R6C5']], [10, ['R7C5', 'R7C6']],
  [15, ['R7C2', 'R7C3']], [11, ['R4C3', 'R5C3']], [16, ['R4C4', 'R4C5']],
];

// The NFA reads each cage as digit, shade, ...; its state stores the pending
// digit and adds digit * shade (the shade Var's raw value, 1 or 2) after
// each shade flag.
function doubledCage(total, cageCells) {
  const machine = NFA.encodeSpec({
    startState: { sum: 0 },
    transition: (state, value) => {
      if (state.digit === undefined) return { sum: state.sum, digit: value };
      const sum = state.sum + state.digit * value;
      return sum <= total ? { sum } : undefined;
    },
    accept: state => state.digit === undefined && state.sum === total,
  }, 9);
  return new NFA(machine, `doubled-cage-${total}`,
    ...cageCells.flatMap(cell => [cell, shade.at(cell)]));
}

return [
  new Shape('9x9'),
  new YinYang(),
  ...cages.flatMap(([total, cageCells]) => [
    new AllDifferent(...cageCells),
    doubledCage(total, cageCells),
  ]),
];
