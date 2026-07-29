// Title: Cornered Parity
// Author: Lulero
// Video: https://www.youtube.com/watch?v=R8oNw1TbyYM
// Source: https://sudokupad.app/378yd1xsg9

// Standard 6x6 Sudoku uses 2x3 boxes. No three consecutive cells in any row
// or column may share a parity; cages have distinct digits and the two lines
// are thermometers increasing from their circular bulbs.
const noParityTriple = NFA.encodeSpec({
  startState: { history: [] },
  transition({ history }, value) {
    const parity = value % 2;
    if (history.length === 2 && history[0] === parity && history[1] === parity) {
      return undefined;
    }
    return { history: [...history, parity].slice(-2) };
  },
  accept: () => true,
}, 6);

const graph = cellGraph('6x6');

return [
  new Shape('6x6'),
  ...[...graph.rows(), ...graph.columns()]
    .map(cells => new NFA(noParityTriple, 'no parity triple', ...cells)),
  // Cages transcribed from the drawn top-left totals.
  new Cage(6, 'R1C1', 'R2C1'),
  new Cage(7, 'R1C4', 'R2C4'),
  new Cage(7, 'R1C6', 'R2C6'),
  new Cage(7, 'R3C3', 'R4C3'),
  new Cage(7, 'R4C6', 'R5C6'),
  new Cage(6, 'R6C5', 'R6C6'),
  new Thermo('R3C1', 'R4C1'),
  new Thermo('R5C4', 'R4C5'),
];
