// Title: Uptown
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=zGtZMGR2un0
// Source: https://app.crackingthecryptic.com/sudoku/q36fnnDF9M

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9')). Digits are building heights. Each outside diagonal clue
// gives the count of buildings visible looking inward along its diagonal: a
// building is visible unless an earlier (nearer to the clue) building on the
// same diagonal is at least as tall (equal height also hides it). None of the
// four diagonals is a full grid diagonal, row, column or box, so a diagonal
// need not hold distinct digits -- the rules' own worked example "3141592"
// repeats the digit 1.

// Visible-count NFA: `high` is the tallest height seen so far, `visible`
// counts cells that beat it. `target` is fixed per clue and never changes
// mid-scan, so folding it into the state costs nothing.
const skyscraperNFA = (target) => NFA.encodeSpec({
  startState: { high: 0, visible: 0 },
  transition: ({ high, visible }, value) => ({
    high: Math.max(high, value),
    visible: visible + (value > high ? 1 : 0),
  }),
  accept: ({ visible }) => visible === target,
  maxDepth: 9,
}, 9);

// Diagonal cell lists, ordered clue-inward, derived from each drawn arrow's
// off-grid ray paired with its nearest number label.
const diagTopC3 = ['R1C3', 'R2C4', 'R3C5', 'R4C6', 'R5C7', 'R6C8', 'R7C9']; // top clue over column 3, value 7
const diagTopC7 = ['R1C7', 'R2C6', 'R3C5', 'R4C4', 'R5C3', 'R6C2', 'R7C1']; // top clue over column 7, value 7
const diagBottomC3 = ['R9C3', 'R8C4', 'R7C5', 'R6C6', 'R5C7', 'R4C8', 'R3C9']; // bottom clue over column 3, value 7
const diagLeftR2 = ['R2C1', 'R3C2', 'R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7', 'R9C8']; // left clue over row 2, value 6

return [
  new Shape('9x9'),
  new NFA(skyscraperNFA(7), 'Skyscraper diagonal', ...diagTopC3),
  new NFA(skyscraperNFA(7), 'Skyscraper diagonal', ...diagTopC7),
  new NFA(skyscraperNFA(7), 'Skyscraper diagonal', ...diagBottomC3),
  new NFA(skyscraperNFA(6), 'Skyscraper diagonal', ...diagLeftR2),
];
