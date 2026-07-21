// Title: The Penrose Steps
// Author: Fenners
// Video: https://www.youtube.com/watch?v=TN87bNlBv9E
// Source: https://sudokupad.app/w4l55nhbav

// Normal sudoku rules apply.
//
// Penrose Lines: from the bulb, a strictly increasing sequence of at least
// two digits repeats in full at least once. Every repetition is complete.

// A legal period p divides the line length and occupies at most half of it.
// Equal positions in each repeated copy share a value, while a Thermo makes
// the first copy strictly increasing. The minimum period is two because the
// rule describes increasing digits, plural.
function penroseLine(cells) {
  const periods = [];
  for (let p = 2; p <= Math.floor(cells.length / 2); p++) {
    if (cells.length % p === 0) periods.push(p);
  }

  const periodConstraints = (period) => {
    const residueGroups = Array.from({length: period}, (_, offset) =>
      cells.filter((_, index) => index % period === offset));
    return [
      ...residueGroups.map(group => new SameValues(group.length, ...group)),
      new Thermo(...cells.slice(0, period)),
    ];
  };

  if (periods.length === 1) return periodConstraints(periods[0]);
  return [new Or(periods.map(period => new And(periodConstraints(period))))];
}

const penroseLines = [
  ['R4C1', 'R3C2', 'R2C3', 'R3C4', 'R2C5', 'R1C6'],
  ['R5C1', 'R4C2', 'R3C3', 'R4C4', 'R3C5', 'R2C6', 'R3C7', 'R2C8', 'R1C9'],
  ['R6C1', 'R5C2', 'R4C3', 'R5C4', 'R4C5', 'R3C6', 'R4C7', 'R3C8', 'R2C9'],
  ['R7C1', 'R6C2', 'R5C3', 'R6C4', 'R5C5', 'R4C6', 'R5C7', 'R4C8', 'R3C9'],
  ['R8C1', 'R7C2', 'R6C3', 'R7C4', 'R6C5', 'R5C6', 'R6C7', 'R5C8', 'R4C9'],
  ['R9C1', 'R8C2', 'R7C3', 'R8C4', 'R7C5', 'R6C6', 'R7C7', 'R6C8', 'R5C9'],
];

return [
  new Shape('9x9'),
  ...penroseLines.flatMap(penroseLine),
];
