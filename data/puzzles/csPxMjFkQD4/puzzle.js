// Title: Buddy System
// Author: rysmyth
// Video: https://www.youtube.com/watch?v=csPxMjFkQD4
// Source: https://sudokupad.app/mr3vsn89ww

// Normal Sudoku rules apply. Outlined squares are the given friendly cells:
// their digits equal their row, column, or box number. One buddy digit is
// adjacent to every marked friendly cell. Its three friendly occurrences are
// unmarked, and every other friendly occurrence is marked.
const marked = [
  'R1C5', 'R1C8', 'R2C2', 'R2C6', 'R2C7', 'R3C5', 'R4C2', 'R4C7', 'R4C9',
  'R5C2', 'R5C6', 'R6C1', 'R6C4', 'R6C5', 'R6C7', 'R7C5', 'R7C6', 'R7C9',
  'R8C3', 'R8C4', 'R9C2',
];
const markedSet = new Set(marked);
const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const graph = cellGraph('9x9');
const gridCells = graph.cells();

function friendlyDigits(row, column) {
  const box = Math.floor((row - 1) / 3) * 3 + Math.floor((column - 1) / 3) + 1;
  return [...new Set([row, column, box])];
}

// Each branch fixes the one possible buddy digit. This lets the candidate
// restrictions express the rule that an unmarked friendly cell must be one of
// the buddy digit's three friendly occurrences.
function buddyCase(buddy) {
  const unmarkedBuddyFriendly = gridCells.filter((id, index) => {
    const row = Math.floor(index / 9) + 1;
    const column = index % 9 + 1;
    return !markedSet.has(id) && friendlyDigits(row, column).includes(buddy);
  });

  return new And([
    ...gridCells.flatMap((id, index) => {
      const row = Math.floor(index / 9) + 1;
      const column = index % 9 + 1;
      const friendly = friendlyDigits(row, column);
      return markedSet.has(id)
        ? [
          new Given(id, ...friendly.filter(value => value !== buddy)),
          new ContainAtLeast(String(buddy), ...graph.neighbours(id)),
        ]
        : [new Given(id, ...digits.filter(
          value => !friendly.includes(value) || value === buddy))];
    }),
    new ContainExact(`${buddy}_${buddy}_${buddy}`, ...unmarkedBuddyFriendly),
  ]);
}

return [
  new Shape('9x9'),
  new Given('R1C9', 5),
  new Given('R7C1', 8),
  new Given('R8C1', 4),
  new Or(digits.map(buddyCase)),
];
