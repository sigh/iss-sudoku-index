// Title: Colored Groups
// Author: Nahileon
// Video: https://www.youtube.com/watch?v=tsvO4kZKCuI
// Source: https://sudokupad.app/9cgfyvodo8

// Rules encoded, in full (nothing is omitted):
//   1. Normal sudoku.
//   2. Each cell is coloured in one of two colours, and cells containing the
//      same digit must be coloured the same.
//   3. If an orthogonally connected group of cells of the same colour contains
//      one or more circles, every circle in it holds the size of that group.
//
// The rules name no colour and give the two of them no distinguishing property,
// so the encoding pins digit 1 to colour 1; without that every solution would
// appear twice, once per naming of the colours.

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const gridCells = graph.cells();

// The 18 white circles drawn on the grid.
const circles = [
  'R2C2', 'R2C8', 'R3C4',
  'R4C1', 'R4C2', 'R4C3', 'R4C5', 'R4C7', 'R4C9',
  'R5C4', 'R5C5', 'R5C6',
  'R6C1', 'R6C3', 'R6C5',
  'R7C3', 'R9C5', 'R9C8',
];

// --- Rule 2: one colour per digit, copied onto every cell -------------------

// VM<d> holds the colour chosen for digit d; VK<cell> holds a cell's colour.
const digitColours = new Var('M', 'colour of each digit', 9);
const colour = graph.makeOverlay('VK');

// Reads [cell, that cell's colour, VM1..VM9] and checks the cell's colour
// against the entry its digit selects. Phase 0 takes the digit d, phase 1 takes
// the claimed colour k, phase 2 walks the map counting entries until it reaches
// entry d and compares it against k, and phase 3 is "matched" - acceptance also
// requires that all nine entries were read.
const colourLookup = NFA.encodeSpec({
  startState: { ph: 0 },
  transition: (s, v) => {
    switch (s.ph) {
      case 0: return { ph: 1, d: v };
      case 1: return v <= 2 ? { ph: 2, d: s.d, k: v, i: 0 } : undefined;
      case 2: {
        if (v > 2) return undefined;
        const i = s.i + 1;
        if (i === s.d) return v === s.k ? { ph: 3, i: i } : undefined;
        return { ph: 2, d: s.d, k: s.k, i: i };
      }
      case 3: return v <= 2 ? { ph: 3, i: s.i + 1 } : undefined;
    }
  },
  accept: (s) => s.ph === 3 && s.i === 9,
  maxDepth: 2 + 9,
}, shape);

const colourConstraints = [
  digitColours,
  colour.toVar('cell colours'),
  new Given(digitColours.cell(1), 1),
  ...[2, 3, 4, 5, 6, 7, 8, 9].map((d) => new Given(digitColours.cell(d), 1, 2)),
  colour.makeReplicate(new Given(colour.at(gridCells[0]), 1, 2)),
  ...gridCells.map((cell) => new NFA(
    colourLookup, 'digit colour',
    cell, colour.at(cell), ...digitColours.cells())),
];

// --- Rule 3: the size of each circled group ---------------------------------

// A circled group is traced on an overlay that labels every cell: 1 for "not in
// a group traced here", and 1 + n for "in the n-th group traced here".
const OUTSIDE = 1;

// Several circles share an overlay, which requires that no two of them can lie
// in the same group. Circles in a common row, column or box qualify: a shared
// group would write its one size into both of them, and normal sudoku forbids a
// repeated digit in a house. Overlays are filled greedily in reading order, up
// to eight circles each so that the labels stay within the digit range.
const houses = [graph.rows(), graph.columns(), graph.boxes()].flat();
const shareHouse = (a, b) => houses.some(
  (house) => house.includes(a) && house.includes(b));
const overlayCircles = [];
for (const circle of circles) {
  const shared = overlayCircles.find(
    (members) => members.length < 8 &&
      members.every((member) => shareHouse(member, circle)));
  if (shared) shared.push(circle); else overlayCircles.push([circle]);
}

// Reads one grid line as [label, colour, label, colour, ...] and compares each
// neighbouring pair of cells. Same-coloured neighbours are in the same
// connected group, so they must carry the same label; and a group is one colour
// throughout, so neighbours sharing a group label must share a colour.
// `cur` holds a label until its colour arrives; the previous cell's pair is
// carried alongside it.
const groupClosure = NFA.encodeSpec({
  startState: { label: 0, colour: 0, cur: 0 },
  transition: (s, v) => {
    if (s.cur === 0) return { label: s.label, colour: s.colour, cur: v };
    if (v > 2) return undefined;
    if (s.label !== 0) {
      if (s.colour === v && s.label !== s.cur) return undefined;
      if (s.label === s.cur && s.cur !== OUTSIDE && s.colour !== v) {
        return undefined;
      }
    }
    return { label: s.cur, colour: v, cur: 0 };
  },
  accept: (s) => s.cur === 0 && s.label !== 0,
  maxDepth: 2 * 9,
}, shape);

// Reads [circled cell, every overlay cell] and requires the number of cells
// carrying this group's label to equal the circled digit, by counting that
// digit down to zero.
const makeGroupSize = (label) => NFA.encodeSpec({
  startState: { rem: null },
  transition: (s, v) => {
    if (s.rem === null) return { rem: v };
    if (v !== label) return s;
    return s.rem === 0 ? undefined : { rem: s.rem - 1 };
  },
  accept: (s) => s.rem === 0,
  maxDepth: 1 + gridCells.length,
}, shape);

// Prefixes for the overlays, skipping the two already in use.
const prefixes = [...'ABCDEFGHIJ'].map((letter) => 'V' + letter);

const groupConstraints = overlayCircles.flatMap((members, index) => {
  const prefix = prefixes[index];
  const overlay = graph.makeOverlay(prefix);
  const labels = members.map((_, n) => OUTSIDE + 1 + n);
  return [
    overlay.toVar(`circled groups ${index + 1}`),
    overlay.makeReplicate(
      new Given(overlay.at(gridCells[0]), OUTSIDE, ...labels)),
    ...[...graph.rows(), ...graph.columns()].map((house) => new NFA(
      groupClosure, 'group closure',
      ...house.flatMap((cell) => [overlay.at(cell), colour.at(cell)]))),
    ...members.flatMap((circle, n) => [
      new Given(overlay.at(circle), labels[n]),
      // Closed under same-colour adjacency, connected, and holding the circle,
      // so the labelled cells are exactly the circle's group.
      new ConnectedValues(prefix, labels[n]),
      new NFA(
        makeGroupSize(labels[n]), 'group size',
        circle, ...overlay.at(gridCells)),
    ]),
  ];
});

return [shape, ...colourConstraints, ...groupConstraints];
