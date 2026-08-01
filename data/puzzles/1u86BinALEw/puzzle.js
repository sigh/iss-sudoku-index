// Title: 10! ('10 Factorial')
// Author: bfranj17
// Video: https://www.youtube.com/watch?v=1u86BinALEw
// Source: https://sudokupad.app/QBmD43GFg3

// Normal Sudoku rules apply. The drawn grey arrows, grey thermometer, green
// whisper line, white dot, and yellow Phistomefel Ring are encoded below.
const arrows = [
  ['R8C1', 'R9C1', 'R9C2'],
  ['R6C4', 'R7C4', 'R7C3', 'R6C3', 'R5C3'],
  ['R3C2', 'R2C2', 'R2C1', 'R1C1'],
  ['R4C5', 'R3C5', 'R3C4', 'R3C3'],
  ['R4C6', 'R5C6', 'R4C7', 'R3C7', 'R3C6'],
  ['R6C6', 'R7C6', 'R6C7'],
  ['R1C8', 'R1C9', 'R2C8', 'R2C7'],
]; // Each list is transcribed bulb-first from a drawn grey arrow.

const ring = [
  'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R4C3', 'R5C3', 'R6C3',
  'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R6C7', 'R5C7', 'R4C7',
]; // The 16 yellow cells surrounding the central 3x3 box.

// Track the prime factors 2^8 * 3^4 * 5^2 * 7 in 10!, saturating each
// exponent once the required factor has been accumulated.
const digitFactors = {
  1: [0, 0, 0, 0], 2: [1, 0, 0, 0], 3: [0, 1, 0, 0],
  4: [2, 0, 0, 0], 5: [0, 0, 1, 0], 6: [1, 1, 0, 0],
  7: [0, 0, 0, 1], 8: [3, 0, 0, 0], 9: [0, 2, 0, 0],
};
const factorialRing = NFA.encodeSpec({
  startState: { two: 0, three: 0, five: 0, seven: 0 },
  transition: (state, value) => {
    const [two, three, five, seven] = digitFactors[value];
    return {
      two: Math.min(8, state.two + two),
      three: Math.min(4, state.three + three),
      five: Math.min(2, state.five + five),
      seven: Math.min(1, state.seven + seven),
    };
  },
  accept: state => state.two === 8 && state.three === 4 && state.five === 2 && state.seven === 1,
}, 9);

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  new Thermo('R9C5', 'R8C5', 'R8C6'),
  new Whisper(5, 'R7C7', 'R8C7', 'R8C8', 'R9C8', 'R9C9'),
  new WhiteDot('R1C9', 'R2C9'),
  new NFA(factorialRing, '10 factorial Phistomefel Ring', ...ring),
];
