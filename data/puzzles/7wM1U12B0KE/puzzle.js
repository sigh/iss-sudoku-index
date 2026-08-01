// Title: Factor Me In The Corner
// Author: Amin Khalek
// Video: https://www.youtube.com/watch?v=7wM1U12B0KE
// Source: https://app.crackingthecryptic.com/ben75yl8kq

// Normal Sudoku applies. Each drawn dotted cage has distinct digits, and its
// total equals the product of the cage cells bordering both horizontal and vertical dotted edges.
function factorCage(cells, cornerCount) {
  const machine = NFA.encodeSpec({
    // Corner cells are read first. Once their product is fixed, difference is total-minus-product.
    startState: { position: 0, sum: 0, product: 1 },
    transition: (state, value) => {
      if ('difference' in state) {
        return { position: state.position + 1, difference: state.difference + value };
      }
      const { position, sum, product } = state;
      const nextSum = sum + value;
      const nextProduct = product * value;
      if (nextProduct > 72) return undefined;
      if (position + 1 === cornerCount) {
        return { position: position + 1, difference: nextSum - nextProduct };
      }
      return { position: position + 1, sum: nextSum, product: nextProduct };
    },
    accept: ({ position, difference }) => position === cells.length && difference === 0,
    maxDepth: cells.length,
  }, 9);
  return [new AllDifferent(...cells), new NFA(machine, 'corner-product cage', ...cells)];
}

// Cell lists are transcribed from the dotted cage outlines; each begins with its corner cells.
const cages = [
  [['R7C2', 'R9C2', 'R8C2'], 2],
  [['R7C3', 'R7C5', 'R7C4'], 2],
  [['R9C3', 'R9C5', 'R9C4'], 2],
  [['R2C1', 'R6C1', 'R6C4', 'R3C1', 'R4C1', 'R5C1', 'R6C2', 'R6C3'], 3],
  [['R2C2', 'R2C4', 'R3C2', 'R3C4', 'R2C3', 'R3C3'], 4],
  [['R2C5', 'R4C2', 'R5C2', 'R5C5', 'R3C5', 'R4C5', 'R5C3', 'R5C4'], 4],
  [['R2C7', 'R2C9', 'R2C8'], 2],
  [['R3C7', 'R5C7', 'R4C7'], 2],
  [['R3C9', 'R5C9', 'R4C9'], 2],
];

return [
  new Shape('9x9'),
  new Given('R1C9', 4),
  new Given('R9C1', 4),
  ...cages.flatMap(([cells, cornerCount]) => factorCage(cells, cornerCount)),
];
