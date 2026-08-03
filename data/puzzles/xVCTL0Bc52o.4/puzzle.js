// Title: Determinant Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=xVCTL0Bc52o
// Source: https://tinyurl.com/5xxxctxm

// Normal Sudoku on the 9x9 grid (default rows/columns/boxes all-different).
//
// Eight of the grid's 2x2 boxes are marked with a printed number: the
// determinant of the 2x2 matrix formed by their four corner digits,
// a*d - b*c, where a/b/c/d are the top-left/top-right/bottom-left/
// bottom-right cells. Each box is encoded as a 4-cell NFA scanning
// (TL, TR, BL, BR): it reads the three corners into state, then on the
// fourth computes the determinant and accepts iff it equals the printed
// target. Corner cells and target values are transcribed from the source's
// `rectangle`/`text` overlay pairs (matched by shared cell set).

function determinantNFA(target) {
  return NFA.encodeSpec({
    startState: { step: 0 },
    transition: (state, value) => {
      const { step, a, b, c } = state;
      if (step === 0) return { step: 1, a: value };
      if (step === 1) return { step: 2, a, b: value };
      if (step === 2) return { step: 3, a, b, c: value };
      // step === 3: value is d (bottom-right). Stop tracking raw digits.
      return { step: 4, ok: a * value - b * c === target };
    },
    accept: (state) => state.step === 4 && state.ok === true,
  }, 9);
}

function determinantBox(topLeft, topRight, bottomLeft, bottomRight, target) {
  return new NFA(
    determinantNFA(target), `determinant=${target}`,
    [topLeft, topRight, bottomLeft, bottomRight]);
}

// Corners (TL, TR, BL, BR) and printed value per box, transcribed from the
// drawn rectangle outline and its centred text.
const determinantBoxes = [
  determinantBox('R2C2', 'R2C3', 'R3C2', 'R3C3', 0),
  determinantBox('R2C7', 'R2C8', 'R3C7', 'R3C8', 0),
  determinantBox('R7C7', 'R7C8', 'R8C7', 'R8C8', 0),
  determinantBox('R7C2', 'R7C3', 'R8C2', 'R8C3', 0),
  determinantBox('R6C3', 'R6C4', 'R7C3', 'R7C4', 79),
  determinantBox('R3C3', 'R3C4', 'R4C3', 'R4C4', 28),
  determinantBox('R6C6', 'R6C7', 'R7C6', 'R7C7', 2),
  determinantBox('R3C6', 'R3C7', 'R4C6', 'R4C7', -5),
];

// Givens, transcribed from the source grid.
const givens = [
  new Given('R1C1', 9), new Given('R1C2', 2),
  new Given('R1C8', 8), new Given('R1C9', 1),
  new Given('R2C1', 1), new Given('R2C3', 3), new Given('R2C9', 5),
  new Given('R3C8', 9),
  new Given('R4C4', 8), new Given('R4C6', 2),
  new Given('R5C5', 4),
  new Given('R6C4', 1), new Given('R6C6', 5),
  new Given('R7C2', 6),
  new Given('R8C1', 5), new Given('R8C7', 8), new Given('R8C9', 9),
  new Given('R9C1', 4), new Given('R9C2', 9), new Given('R9C8', 3), new Given('R9C9', 6),
];

return [
  new Shape('9x9'),
  ...givens,
  ...determinantBoxes,
];
