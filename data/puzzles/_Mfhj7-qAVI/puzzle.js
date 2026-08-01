// Title: Low clouds in a German city
// Author: Mennoo_
// Video: https://www.youtube.com/watch?v=_Mfhj7-qAVI
// Source: https://sudokupad.app/u2pnuvnrcy

// Normal Sudoku applies. Green lines are German whispers. Each outside 3 counts
// record-high buildings of height 6 or more when viewed along its row or column.
const whispers = [
  ['R4C3', 'R3C2'],
  ['R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'],
  ['R4C8', 'R3C7'], ['R3C8', 'R4C8'], ['R5C5', 'R4C5', 'R3C5'],
  ['R6C4', 'R7C4', 'R8C4'], ['R6C6', 'R7C6', 'R8C6'],
  ['R8C5', 'R8C6'], ['R9C5', 'R8C4'], ['R9C5', 'R8C5'],
  ['R7C7', 'R7C6'], ['R8C8', 'R7C8'], ['R7C9', 'R7C8'],
  ['R9C2', 'R8C2'], ['R9C3', 'R8C2'], ['R5C7', 'R6C7'],
  ['R7C3', 'R7C4'], ['R2C1', 'R2C2'], ['R1C8', 'R2C9'],
];

// The state stores the tallest building encountered and the number of visible
// buildings at least 6 high; a new record is the only kind that is visible.
const cloudyView = (target) => NFA.encodeSpec({
  startState: { tallest: 0, visible: 0 },
  transition: ({ tallest, visible }, value) => {
    const record = value > tallest;
    return {
      tallest: record ? value : tallest,
      visible: visible + (record && value >= 6 ? 1 : 0),
    };
  },
  accept: ({ visible }) => visible === target,
  maxDepth: 9,
}, 9);

const cloudyViews = [
  ['R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9'],
  ['R1C4', 'R2C4', 'R3C4', 'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4'],
  ['R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R8C6', 'R9C6'],
].map((cells) => new NFA(cloudyView(3), 'cloudy-view-3', ...cells));

return [
  new Shape('9x9'),
  new Given('R6C9', 1),
  ...whispers.map((line) => new Whisper(5, ...line)),
  ...cloudyViews,
];
