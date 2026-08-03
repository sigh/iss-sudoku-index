// Title: Dead Ends
// Author: trufflebear
// Video: https://www.youtube.com/watch?v=xR8c8a7Fsik
// Source: https://app.crackingthecryptic.com/sudoku/4pgH6FFrmd

// Normal sudoku rules apply, standard boxes, no given digits.
//
// Thermometer (bulb R9C1): digits strictly increase from the bulb.
//
// Five V clues (adjacent-cell pairs summing to 5), drawn as a white "V" on
// the shared edge.
//
// Eight orange "dead end" lines (three horizontal, five vertical -- the
// drawn payload splits the leftmost vertical line into two touching strokes
// that meet at R3C3; merged into one 4-cell line here to match the stated
// "five vertical", per the rules text's explicit count). Each line:
//   - consecutive digits differ by at least 4 (a Dutch-whisper rule);
//   - no two lines carry the same digit sequence;
//   - the final digit (in the stated read direction) is a "dead end": no
//     digit consistent with the difference rule could validly go in the
//     cell one further along the line's direction. "Validly" is ordinary
//     sudoku legality for that cell -- not already used in its row, column,
//     or box -- which is what the rules' own worked example reduces to when
//     the line spans a whole row. The three horizontal lines all run to the
//     grid's right edge, so there is no such cell and the property holds
//     vacuously; only the five vertical lines get an explicit constraint.

const graph = cellGraph('9x9');

const thermo = ['R9C1', 'R8C2', 'R7C2', 'R6C3', 'R7C3', 'R7C4'];

const vPairs = [
  ['R7C8', 'R8C8'],
  ['R7C9', 'R8C9'],
  ['R2C4', 'R2C5'],
  ['R9C5', 'R9C6'],
  ['R5C2', 'R5C3'],
];

// Each line's cells in the stated read order (left-to-right / top-to-bottom),
// plus the real grid cell one further along that direction, or null when the
// line already runs to the grid edge (see note above).
const lines = [
  { cells: ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'], next: null },
  { cells: ['R1C3', 'R2C3', 'R3C3', 'R4C3'], next: 'R5C3' },
  { cells: ['R1C9', 'R2C9', 'R3C9', 'R4C9'], next: 'R5C9' },
  { cells: ['R4C7', 'R4C8', 'R4C9'], next: null },
  { cells: ['R4C8', 'R5C8', 'R6C8', 'R7C8'], next: 'R8C8' },
  { cells: ['R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R6C9'], next: null },
  { cells: ['R3C4', 'R4C4', 'R5C4', 'R6C4'], next: 'R7C4' },
  { cells: ['R6C6', 'R7C6', 'R8C6'], next: 'R9C6' },
];

const whispers = lines.map(({ cells }) => new Whisper(4, ...cells));

// No two lines carry the same digit sequence: only lines of equal length can
// possibly match, so compare pairwise within each length group. "Not the
// same sequence" means some position differs -- a two-cell AllDifferent is
// the two-cell "differs" relation.
const byLength = new Map();
for (const { cells } of lines) {
  const group = byLength.get(cells.length) || [];
  group.push(cells);
  byLength.set(cells.length, group);
}
const distinctSequences = [];
for (const group of byLength.values()) {
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const [a, b] = [group[i], group[j]];
      distinctSequences.push(new Or(
        a.map((cell, k) => new AllDifferent(cell, b[k]))));
    }
  }
}

// Dead-end constraint for a line ending at `lastCell` with a real next cell
// `nextCell`: for every possible value of lastCell, every digit that would
// satisfy the >=4 difference rule from it must already be unavailable at
// nextCell -- i.e. already present somewhere in nextCell's row, column, or
// box (nextCell itself excluded).
function peersOf(cell) {
  const box = graph.boxes().find(b => b.includes(cell));
  const peers = new Set([...graph.row(cell), ...graph.column(cell), ...box]);
  peers.delete(cell);
  return [...peers];
}

function deadEnd(lastCell, nextCell) {
  const peers = peersOf(nextCell);
  // hasDigit[d]: some peer of nextCell already holds digit d.
  const hasDigit = {};
  for (let d = 1; d <= 9; d++) {
    hasDigit[d] = new Or(peers.map(p => new Given(p, d)));
  }
  const clauses = [];
  for (let l = 1; l <= 9; l++) {
    const blockers = [];
    for (let d = 1; d <= 9; d++) {
      if (Math.abs(d - l) >= 4) blockers.push(hasDigit[d]);
    }
    const otherValues = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(v => v !== l);
    // lastCell != l, OR every blocking digit is already used among nextCell's peers.
    clauses.push(new Or([new Given(lastCell, ...otherValues), new And(blockers)]));
  }
  return new And(clauses);
}

const deadEnds = lines
  .filter(({ next }) => next !== null)
  .map(({ cells, next }) => deadEnd(cells[cells.length - 1], next));

return [
  new Shape('9x9'),
  new Thermo(...thermo),
  ...vPairs.map(([a, b]) => new V(a, b)),
  ...whispers,
  ...distinctSequences,
  ...deadEnds,
];
