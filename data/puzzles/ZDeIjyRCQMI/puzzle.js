// Title: Triple Point
// Author: shady moon
// Video: https://www.youtube.com/watch?v=ZDeIjyRCQMI
// Source: https://sudokupad.app/uwygvvt8nd

// Normal Sudoku rules apply (default Shape gives the standard row/column/box
// all-different; the drawn regions are the ordinary 3x3 boxes).
//
// Rule 1 ("Lines contain digits in order with a constant difference"): each
// drawn line, taken independently, must read as an arithmetic sequence along
// its path -- the difference between consecutive cells is constant for that
// line (positive or negative), fixed by its own first two cells.
//
// Rule 2 ("Lines of the same colour cannot contain repeated digits"): the
// union of every cell belonging to a given line colour holds no repeated
// digit, even across separate line segments of that colour.
//
// Rule 3 (black dot): a 1:2 ratio between the two dotted cells.

// Arithmetic-progression NFA: consecutive cells differ by one constant
// amount, discovered from the line's own first two cells and then held
// fixed for the rest of the path.
const arithmeticProgressionSpec = NFA.encodeSpec({
  startState: { lastVal: null, diff: null },
  transition: ({ lastVal, diff }, value) => {
    if (lastVal === null) return { lastVal: value, diff };
    const newDiff = value - lastVal;
    if (diff === null || diff === newDiff) {
      return { lastVal: value, diff: newDiff };
    }
    // diff mismatch -> reject this branch.
  },
  accept: () => true,
}, 9);

// Drawn line paths, transcribed from the puzzle's line geometry.
const skyBlueLine = ['R9C9', 'R8C8', 'R7C7', 'R6C6', 'R5C5', 'R4C4', 'R3C3', 'R2C2', 'R1C1'];
const sandyBrownLines = [
  ['R6C1', 'R7C2', 'R8C3', 'R9C4'],
  ['R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9'],
];
const orchidLines = [
  ['R7C3', 'R8C4', 'R9C5'],
  ['R5C7', 'R6C8', 'R7C9'],
  ['R2C7', 'R3C8', 'R4C9'],
];

const allLines = [skyBlueLine, ...sandyBrownLines, ...orchidLines];
const lineNfas = allLines.map(
  cells => new NFA(arithmeticProgressionSpec, 'AP', ...cells));

// Same-colour non-repeat groups. The single-line sky blue colour is included
// for faithfulness even though its 9-cell arithmetic run already forces
// distinctness; the sandy brown and orchid groups each combine separate
// line segments into one 9-cell set, which is a real extra constraint.
const colourGroups = [skyBlueLine, sandyBrownLines.flat(), orchidLines.flat()];
const colourAllDifferent = colourGroups.map(cells => new AllDifferent(...cells));

return [
  new Shape('9x9'),
  ...lineNfas,
  ...colourAllDifferent,
  new BlackDot('R5C3', 'R6C3'),
  new BlackDot('R8C3', 'R9C3'),
];
