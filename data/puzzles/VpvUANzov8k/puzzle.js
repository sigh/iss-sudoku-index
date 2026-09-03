// Title: Sudokulike (Dynamic Fog Edition)
// Author: Nurator
// Video: https://www.youtube.com/watch?v=VpvUANzov8k
// Source: https://sudokupad.app/j22idv1qhe

// Rules encoded here:
//   Normal sudoku rules apply.
//   Digits in cages (rooms) do not repeat and sum to the total if given.
//   Adventure Path: draw a path starting at the first check point (the green
//     square with a 1) to every visible checkpoint in ascending order. The path
//     only travels orthogonally and must visit each cage (room). The path can
//     never travel outside of rooms nor checkpoints and can only enter and exit
//     any cage (room) exactly once.
//   Dutch Whisper, the class the path carries once all five checkpoints are
//     visible: two cells connected by a Dutch Whisper path must have a
//     difference of at least 4.
//
// The board is played under fog in four stages, each lighting more rooms and one
// more checkpoint, and each redrawing the path under a new class -- Palindrome
// (checkpoints 1-2), German Whisper (1-2-3), Region Sum (1-2-3-4), Dutch Whisper
// (1-2-3-4-5). Only the last of those speaks about the finished grid: "delete the
// path and all entered digits that are not on checkpoints" wipes each earlier
// stage's digits, so a Palindrome, German Whisper or Region Sum path constrains a
// provisional filling of a partly-lit board rather than the answer. Those three
// stages are omitted; what they leave behind is the digit each one forces in its
// own highest lit checkpoint, and forcing is a property of that stage's whole
// solution set rather than of any one grid.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// The rooms as drawn (killer cages), with the printed total where one is given.
const ROOMS = [
  { cells: ['R6C6', 'R6C7', 'R6C8'], total: 23 },
  { cells: ['R3C5', 'R4C5', 'R5C4', 'R5C5', 'R6C5'], total: 23 },
  { cells: ['R2C2', 'R3C2', 'R3C3', 'R3C4'], total: 13 },
  { cells: ['R2C3', 'R2C4'], total: 17 },
  { cells: ['R7C5', 'R7C6', 'R7C7', 'R7C8'], total: 21 },
  { cells: ['R8C6', 'R8C7', 'R9C5', 'R9C6'], total: null },
  { cells: ['R8C8', 'R8C9'], total: null },
  { cells: ['R5C9', 'R6C9', 'R7C9'], total: null },
  { cells: ['R3C6', 'R3C7'], total: null },
  { cells: ['R8C2', 'R8C3', 'R9C3'], total: null },
  { cells: ['R3C8', 'R4C8'], total: null },
  { cells: ['R5C1', 'R6C1', 'R7C1'], total: 15 },
  { cells: ['R4C3', 'R5C2', 'R5C3'], total: 21 },
  { cells: ['R1C2', 'R1C3'], total: 10 },
  { cells: ['R4C9'], total: null },
];

// The five green checkpoint squares, in the order of the numbers drawn on them.
// None of them lies inside a room.
const CHECKPOINTS = ['R2C5', 'R5C8', 'R9C4', 'R7C2', 'R1C4'];

const rooms = ROOMS.map(({ cells, total }) => total === null
  ? new AllDifferent(...cells)
  : new Cage(total, ...cells));

const roomOf = new Map();
ROOMS.forEach((room, i) => room.cells.forEach((cell) => roomOf.set(cell, i)));
const stopIndex = new Map(CHECKPOINTS.map((cell, i) => [cell, i]));
const allowed = new Set([...ROOMS.flatMap((room) => room.cells), ...CHECKPOINTS]);

// The path itself is not drawn, so the routes are walked out from the Adventure
// Path rule: start on checkpoint 1, step orthogonally, never repeat a cell, stay
// on room cells and checkpoints, meet the checkpoints in ascending order, stop on
// checkpoint 5, touch every room, and hold each room in one unbroken run (which
// is entering and exiting it exactly once). Every route the rule permits becomes
// a branch below, so the path stays the solver's to choose.
const adventureRoutes = () => {
  // Per-room occupancy: UNSEEN until the path first steps in, INSIDE while it is
  // in the room, DONE once it has left. A step into a DONE room would be a second
  // entry.
  const UNSEEN = 0, INSIDE = 1, DONE = 2;
  const occupancy = ROOMS.map(() => UNSEEN);
  const roomAt = (cell) => roomOf.has(cell) ? roomOf.get(cell) : -1;

  const routes = [];
  const path = [CHECKPOINTS[0]];
  const onPath = new Set(path);
  let nextStop = 1;

  const walk = () => {
    const cell = path[path.length - 1];
    if (cell === CHECKPOINTS[CHECKPOINTS.length - 1]) {
      // Reached only once every earlier checkpoint has been met in order.
      if (occupancy.every((state) => state !== UNSEEN)) routes.push(path.slice());
      return;
    }
    const here = roomAt(cell);
    for (const next of graph.neighbours(cell)) {
      if (!onPath.has(next) && allowed.has(next)) {
        const there = roomAt(next);
        if (there !== -1 && there !== here && occupancy[there] !== UNSEEN) continue;
        if (stopIndex.has(next) && stopIndex.get(next) !== nextStop) continue;

        const restore = [];
        if (here !== -1 && there !== here) {
          restore.push([here, occupancy[here]]);
          occupancy[here] = DONE;
        }
        if (there !== -1 && there !== here) {
          restore.push([there, occupancy[there]]);
          occupancy[there] = INSIDE;
        }
        const savedStop = nextStop;
        if (stopIndex.has(next)) nextStop += 1;
        path.push(next);
        onPath.add(next);

        walk();

        path.pop();
        onPath.delete(next);
        nextStop = savedStop;
        for (const [i, state] of restore) occupancy[i] = state;
      }
    }
  };

  walk();
  return routes;
};

const adventurePath = new Or(
  adventureRoutes().map((route) => new Whisper(4, ...route)));

return [
  shape,
  new Given('R2C9', 5),
  ...rooms,
  adventurePath,
];
