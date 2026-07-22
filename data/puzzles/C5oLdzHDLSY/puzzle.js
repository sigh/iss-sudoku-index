// Title: Quincunx
// Author: Freegerator
// Video: https://www.youtube.com/watch?v=C5oLdzHDLSY
// Source: https://sudokupad.app/41837g4m94

// Normal sudoku rules apply. In each box, the four corner digits and center
// digit have a sum divisible by 5. Orange lines are Dutch whispers (minimum
// difference 4), green lines are German whispers (minimum difference 5),
// white dots join consecutive digits, shaded circles are odd, and the arrow
// arm sums to its circle.

const quincunxNFA = NFA.encodeSpec({
  startState: 0,
  transition: (sumMod5, value) => (sumMod5 + value) % 5,
  accept: sumMod5 => sumMod5 === 0,
}, 9);

const graph = cellGraph('9x9');
const quincunxes = graph.boxes().map(box =>
  [0, 2, 4, 6, 8].map(index => box[index])
);

const dutchWhispers = [
  ['R1C1', 'R2C2', 'R3C3', 'R4C4'],
  ['R3C1', 'R2C2', 'R1C3'],
  ['R2C2', 'R1C2'],
  ['R1C7', 'R2C8', 'R3C9'],
  ['R4C6', 'R3C7', 'R2C8', 'R1C9'],
  ['R2C8', 'R1C8'],
];

const germanWhispers = [
  ['R8C4', 'R8C3', 'R9C3', 'R9C2', 'R9C1', 'R8C1', 'R7C1', 'R6C2'],
  ['R9C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9', 'R7C8', 'R7C7', 'R6C6'],
];

const whiteDots = [
  ['R1C6', 'R1C7'],
  ['R1C3', 'R1C4'],
  ['R6C3', 'R7C3'],
  ['R3C8', 'R4C8'],
  ['R8C6', 'R8C7'],
];

return [
  new Shape('9x9'),
  ...quincunxes.map(cells => new NFA(quincunxNFA, 'Quincunx mod 5', ...cells)),
  ...dutchWhispers.map(cells => new Whisper(4, ...cells)),
  ...germanWhispers.map(cells => new Whisper(5, ...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...['R4C4', 'R4C6', 'R5C5', 'R6C6'].map(
    cell => new Given(cell, 1, 3, 5, 7, 9)
  ),
  new Arrow('R6C4', 'R5C5', 'R4C6'),
];
