// Title: Against the Odds
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=V4tTkMKlzTw
// Source: https://sudokupad.app/qbg612qq8c

// Green lines are German whispers: adjacent digits differ by at least 5.
const greenLines = [
  ['R4C1', 'R3C2', 'R2C3', 'R1C4', 'R1C3', 'R1C2', 'R2C1'],
  ['R1C6', 'R2C7', 'R3C8', 'R4C9'],
  ['R7C9', 'R6C9', 'R7C8', 'R8C7'],
  ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1', 'R6C2', 'R7C3', 'R8C4'],
  ['R5C9', 'R5C8', 'R4C7'],
  ['R9C6', 'R8C6', 'R9C5', 'R9C4', 'R9C3'],
  // Repeat R4C5 so the closing edge of the loop is constrained.
  ['R4C5', 'R5C4', 'R6C5', 'R5C6', 'R4C5'],
];

const thermo = ['R4C3', 'R5C2', 'R6C3', 'R7C4', 'R8C5'];

// Each square's value equals the number of odd digits on its entire clue.
// The square is scanned first to set the target, then the full clue is scanned
// (including the square itself) to count its odd digits.
const oddCountConstraint = (name, square, cells) => {
  const spec = NFA.encodeSpec({
    startState: {phase: 'target', target: null, count: 0},
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) {
        return {phase: 'count', target: state.target, count: 0};
      }
      if (state.phase === 'target') {
        return {phase: 'target', target: value, count: 0};
      }
      const count = state.count + value % 2;
      if (count > state.target) return undefined;
      return {phase: 'count', target: state.target, count};
    },
    accept: state => state.phase === 'count' && state.count === state.target,
    maxDepth: cells.length + 2,
  }, 9, {multiSegment: true});
  return new NFA(spec, name, [square], cells);
};

const squareClues = [
  ['odd count 1', 'R1C4', greenLines[0]],
  ['odd count 2', 'R4C9', greenLines[1]],
  ['odd count 3', 'R6C9', greenLines[2]],
  ['odd count 4', 'R6C2', greenLines[3]],
  ['odd count 5', 'R5C8', greenLines[4]],
  ['odd count 6', 'R8C6', greenLines[5]],
  ['odd count 7', 'R6C5', greenLines[6].slice(0, -1)],
  ['thermo odd count', 'R5C2', thermo],
];

return [
  new Shape('9x9'),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
  new Thermo(...thermo),
  ...squareClues.map(args => oddCountConstraint(...args)),
];
