// Title: There's a Wolf Under There
// Author: ViKingPrime
// Video: https://www.youtube.com/watch?v=2O7JJsAvLY4
// Source: https://sudokupad.app/g63hqgbauq

// Normal sudoku rules apply.
//
// Cells along a pink line form a Renban set: consecutive, non-repeating
// values in any order.
//
// A black dot between two cells means one value is double the other.
//
// Werewolf cells: there is exactly one Werewolf cell in each row, column
// and box. A Werewolf cell contains (displays) the digit that matches its
// box number (boxes counted left-to-right, top-to-bottom, 1-9), but it
// secretly carries a hidden VALUE selected from the remaining digits of its
// box (i.e. any digit other than its own box number). The values of the
// nine Werewolf cells are all different. Pink lines and black dots operate
// on VALUES: a Werewolf cell participates in any line or dot through it
// with its hidden value, not its displayed digit. All other cells' values
// equal their digits.
//
// Encoding: the Werewolf in box B is, by definition, the unique cell of box
// B containing digit B. Var cells VW1..VW9 hold the hidden values. Each
// line/dot is an NFA that scans its grid cells followed by the wolf-value
// Vars of the boxes it crosses, substituting the Var value for any cell
// whose digit equals its own box number, then checks the Renban/ratio
// property on the substituted values. One-wolf-per-row and per-column are
// small counting NFAs (one per box is automatic from box uniqueness).

// Box number (1-9, row-major) of a cell; the API has no box-index helper.
function boxOf(cell) {
  const { row, col } = parseCellId(cell);
  return 3 * Math.floor((row - 1) / 3) + Math.floor((col - 1) / 3) + 1;
}

const werewolfVar = new Var('W', 'werewolf values', 9);
const wolfVar = b => werewolfVar.cell(b);

// Exactly one cell among the given cells has a digit equal to its own box
// number (used once per row and once per column to place the Werewolves).
function exactlyOneWolf(cells) {
  const targets = cells.map(boxOf);
  const spec = {
    startState: { idx: 0, count: 0 },
    transition: ({ idx, count }, value) => {
      const matched = value === targets[idx];
      return { idx: idx + 1, count: count + (matched ? 1 : 0) };
    },
    accept: ({ count }) => count === 1,
    maxDepth: cells.length,
  };
  const encoded = NFA.encodeSpec(spec, 9);
  return new NFA(encoded, 'WW', ...cells);
}

// A line/dot constraint on effective values: scans the marking's grid
// cells, then the wolf-value Vars of the boxes the marking crosses. A cell
// whose digit equals its own box number is that box's Werewolf; its
// effective value is the Var. Every other cell's effective value is its
// digit. acceptFn receives the sorted effective values.
function wolfAwareMarking(name, cells, acceptFn) {
  const boxes = cells.map(boxOf);
  const varBoxes = [...new Set(boxes)].sort((a, b) => a - b);
  const spec = {
    startState: { idx: 0, resolved: [], pending: [] },
    transition: ({ idx, resolved, pending }, value) => {
      if (idx < cells.length) {
        const b = boxes[idx];
        if (value === b) {
          // This cell is box b's Werewolf; wait for VW{b} to resolve it.
          // Two wolves in one box is impossible (box uniqueness): dead end.
          if (pending.includes(b)) return undefined;
          return {
            idx: idx + 1, resolved,
            pending: [...pending, b].sort((x, y) => x - y),
          };
        }
        return {
          idx: idx + 1, pending,
          resolved: [...resolved, value].sort((x, y) => x - y),
        };
      }
      // Scanning wolf-value Vars, in varBoxes order.
      const b = varBoxes[idx - cells.length];
      if (pending.includes(b)) {
        return {
          idx: idx + 1,
          resolved: [...resolved, value].sort((x, y) => x - y),
          pending: pending.filter(x => x !== b),
        };
      }
      return { idx: idx + 1, resolved, pending };
    },
    accept: ({ resolved, pending }) =>
      pending.length === 0 && acceptFn(resolved),
    maxDepth: cells.length + varBoxes.length,
  };
  const encoded = NFA.encodeSpec(spec, 9);
  return new NFA(encoded, name, ...cells, ...varBoxes.map(wolfVar));
}

const renbanAccept = vals =>
  new Set(vals).size === vals.length &&
  Math.max(...vals) - Math.min(...vals) === vals.length - 1;

const kropkiAccept = ([a, b]) => a === 2 * b || b === 2 * a;

const renbanLines = [
  ['R9C1', 'R9C2', 'R9C3'],
  ['R9C4', 'R9C5', 'R9C6'],
  ['R9C7', 'R9C8', 'R9C9'],
  ['R1C1', 'R1C2', 'R1C3'],
  ['R1C4', 'R1C5', 'R1C6'],
  ['R1C7', 'R1C8', 'R1C9'],
  ['R7C3', 'R8C3'],
  ['R2C7', 'R3C7'],
  ['R4C4', 'R5C4', 'R6C4'],
  ['R4C6', 'R5C6', 'R6C6'],
  ['R3C4', 'R3C5', 'R4C5'],
  ['R6C5', 'R7C5', 'R7C6'],
  ['R6C7', 'R6C8', 'R7C7'],
  ['R3C3', 'R4C3', 'R4C2'],
  ['R2C3', 'R3C2'],
  ['R7C8', 'R8C7'],
];

const kropkiDots = [
  ['R9C6', 'R9C7'],
  ['R9C3', 'R9C4'],
  ['R1C3', 'R1C4'],
  ['R1C6', 'R1C7'],
  ['R1C7', 'R2C7'],
  ['R8C3', 'R9C3'],
  ['R7C1', 'R7C2'],
  ['R3C8', 'R3C9'],
  ['R5C6', 'R5C7'],
  ['R5C3', 'R5C4'],
];

return [
  new Shape('9x9'),
  werewolfVar,
  new AllDifferent(...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(wolfVar)),
  // A wolf's value is selected from the remaining digits of its box: any
  // digit except its own box number.
  ...Array.from({ length: 9 }, (_, i) => {
    const b = i + 1;
    const allowed = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(v => v !== b);
    return new Given(wolfVar(b), ...allowed);
  }),
  ...renbanLines.map((cells, i) =>
    wolfAwareMarking(`RB${i + 1}`, cells, renbanAccept)),
  ...kropkiDots.map((cells, i) =>
    wolfAwareMarking(`KD${i + 1}`, cells, kropkiAccept)),
  ...Array.from({ length: 9 }, (_, r) => {
    const rowCells = [];
    for (let c = 1; c <= 9; c++) rowCells.push(makeCellId(r + 1, c));
    return exactlyOneWolf(rowCells);
  }),
  ...Array.from({ length: 9 }, (_, c) => {
    const colCells = [];
    for (let r = 1; r <= 9; r++) colCells.push(makeCellId(r, c + 1));
    return exactlyOneWolf(colCells);
  }),
];
