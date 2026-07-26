// Title: Recounting the Rooms
// Author: pdyxs
// Video: https://www.youtube.com/watch?v=Wf_esVBjMm0
// Source: https://sudokupad.app/belm8cdujp

// Rules encoded here:
//   Sudoku - 9x9, digits 1-9 once per row, column and 3x3 box.
//   Kropki - a black dot between two digits means one is double the other.
//   Numbered Rooms - a clue outside the grid gives the digit in the Nth
//     *revealed* cell along its row/column, where N is the digit in the first
//     *revealed* cell in that direction.
//   Counting Circle - a digit X in a *revealed* circle appears in *revealed*
//     circles X times.
//   Dynamic Fog - the grid starts under fog; once all visible numbered room
//     clues are satisfied, some of the fog lifts to reveal more cells and clues.
//   Unstable Rooms - the digits outside the grid may change value as the fog
//     clears.
// Nothing is omitted.
//
// Both clue rules are worded against what is *revealed*, so neither is a single
// end-state condition: each one is applied once per fog stage, over that
// stage's revealed cells and revealed circles. The stage sequence is the same
// for every solver, because the fog lifts exactly when all visible room clues
// are satisfied, and the source stores that sequence as an ordered cascade
// (transcribed below). No room digit is ever given, so each is a Var; a room
// gets a fresh Var whenever its stage's revealed cells change, which is what
// "Unstable Rooms" allows.

// --- Drawn data, transcribed from the source ------------------------------

// The drawing canvas is 11x11: the played 9x9 grid occupies canvas r2c2-r10c10
// and the surrounding ring of canvas cells carries the outside clues. Canvas
// ids below are 1-indexed r<row>c<col>.

// Provenance: the two cells lit before any fog lifts.
const initialLit = 'r6c6 r1c6';

// Provenance: the drawn fog cascade, in order -- the cells uncovered by each
// successive lift.
const fogLifts = [
  'r3c6',
  'r9c6 r3c8 r3c9 r3c11 r11c6',
  'r10c6 r2c6 r6c3 r6c5 r6c7 r6c9 r3c7 r3c3 r3c4 r3c5 r3c1 r6c1 r6c11',
  'r6c4 r6c8 r3c10 r4c6 r5c6 r7c6 r8c6 r7c9 r4c9 r5c9 r4c3 r5c3 r6c2 r6c10 ' +
  'r1c9 r1c3 r11c9 r9c11 r9c1 r9c3 r9c4 r9c5 r8c9 r9c7 r9c8 r9c9',
  'r10c1 r10c2 r7c1 r5c5 r4c1 r1c5 r2c5 r4c8 r5c7 r5c8 r7c10 r1c7 r2c7 r2c8 ' +
  'r10c5 r7c5 r8c5 r2c10 r2c11 r4c10 r11c8',
  'r1c1 r1c2 r1c4 r2c1 r2c2 r2c3 r2c4 r3c2 r4c2 r5c1 r5c2 r4c4 r4c5 r5c4 ' +
  'r7c2 r7c3 r7c4 r8c1 r8c2 r8c3 r8c4 r9c2 r10c3 r10c4 r11c1 r11c2 r11c3 ' +
  'r11c4 r11c5 r7c11 r8c10 r8c11 r9c10 r10c7 r10c8 r10c9 r10c10 r10c11 ' +
  'r11c7 r11c10 r11c11 r7c7 r7c8 r8c7 r8c8 r4c7 r1c8 r2c9 r1c10 r1c11 ' +
  'r4c11 r5c10 r5c11',
];

// Provenance: the 31 drawn circles, all in one identical style. 29 sit on the
// border ring and mark the active numbered rooms; 2 sit inside the grid.
const circleMarks =
  'r1c3 r1c4 r1c5 r1c6 r1c7 r1c8 r1c9 r1c10 ' +
  'r11c2 r11c3 r11c4 r11c6 r11c8 r11c9 ' +
  'r3c1 r4c1 r6c1 r7c1 r8c1 r9c1 r10c1 ' +
  'r2c11 r3c11 r4c11 r5c11 r6c11 r7c11 r8c11 r9c11 ' +
  'r2c4 r4c2';

// --- Fog stages -----------------------------------------------------------

const parseCanvas = s => s.split(' ').map(id => {
  const m = /^r(\d+)c(\d+)$/.exec(id);
  return [+m[1], +m[2]];
});
const canvasKey = ([r, c]) => r * 100 + c;
// Canvas r2c2 is the played grid's R1C1.
const gridId = ([r, c]) => makeCellId(r - 1, c - 1);

// Cumulative revealed sets: stage 0 is the starting lights, stage k adds the
// kth lift.
const fogStages = fogLifts.reduce(
  (stages, lift) => stages.concat([new Set(
    [...stages[stages.length - 1], ...parseCanvas(lift).map(canvasKey)])]),
  [new Set(parseCanvas(initialLit).map(canvasKey))]);

// --- Rooms and circles ----------------------------------------------------

const onBorderRing = ([r, c]) => r === 1 || r === 11 || c === 1 || c === 11;
const circles = parseCanvas(circleMarks);
const rooms = circles.filter(onBorderRing);
const gridCircles = circles.filter(cell => !onBorderRing(cell));

const oneToNine = [1, 2, 3, 4, 5, 6, 7, 8, 9];
// The nine canvas cells a room looks along, nearest to the room first.
const roomLine = ([r, c]) => {
  if (r === 1) return oneToNine.map(i => [i + 1, c]);
  if (r === 11) return oneToNine.map(i => [11 - i, c]);
  if (c === 1) return oneToNine.map(i => [r, i + 1]);
  return oneToNine.map(i => [r, 11 - i]);
};

// One Var slot per (room, distinct revealed line). A room's displayed digit can
// only move when the set of revealed cells it counts along moves, so stages
// that leave a room's revealed line unchanged share its slot -- that is also
// what keeps the room's digit stable across those stages.
const slotLines = [];
const slotOfRoom = new Map();
const revealedLineOfRoom = new Map();
const stageCircleSlots = fogStages.map(revealed => {
  const slots = [];
  for (const room of rooms) {
    if (!revealed.has(canvasKey(room))) continue;
    const line = roomLine(room).filter(cell => revealed.has(canvasKey(cell)));
    const signature = line.map(canvasKey).join(',');
    if (revealedLineOfRoom.get(canvasKey(room)) !== signature) {
      revealedLineOfRoom.set(canvasKey(room), signature);
      slotOfRoom.set(canvasKey(room), slotLines.length);
      slotLines.push(line.map(gridId));
    }
    slots.push(slotOfRoom.get(canvasKey(room)));
  }
  return slots;
});

const roomDigits = new Var('O', 'room digit', slotLines.length);
const slotCell = i => roomDigits.cell(i + 1);

// ValueIndexing(valueCell, controlCell, ...indexedCells) sets
// valueCell = indexedCells[controlCell - 1] and clamps controlCell to the
// number of indexed cells. Here the indexed cells are the stage's revealed
// cells in room order, the control cell is the first of them (the rule's N),
// and the value cell is the room -- so the clamp is exactly the rule's
// requirement that an Nth revealed cell exists.
const numberedRooms = slotLines.map(
  (line, i) => new ValueIndexing(slotCell(i), line[0], ...line));

// One counting-circle set per fog stage: the rooms revealed at that stage
// (each at its current digit) plus any revealed in-grid circles. The rule
// scopes neither "a revealed circle" nor "revealed circles" to inside or
// outside the grid, and all 31 marks are drawn identically, so rooms and
// in-grid circles share one pool. Stages whose pool is unchanged are dropped
// as duplicates.
const stagePools = fogStages.map((revealed, stage) => [
  ...stageCircleSlots[stage].map(slotCell),
  ...gridCircles.filter(cell => revealed.has(canvasKey(cell))).map(gridId),
]);
const countingCircles = stagePools.filter(
  (pool, i) => i === 0 || pool.join(',') !== stagePools[i - 1].join(','))
  .map(pool => new CountingCircles(...pool));

return [
  new Shape('9x9'),

  new BlackDot('R5C2', 'R5C3'),

  roomDigits,
  ...numberedRooms,

  ...countingCircles,
];
