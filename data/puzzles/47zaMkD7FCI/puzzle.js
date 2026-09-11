// Title: Treasure Maps Python
// Author: Eggr
// Video: https://www.youtube.com/watch?v=47zaMkD7FCI
// Source: https://app.crackingthecryptic.com/sudoku/dnHnLnTFQM

// Not a Sudoku: no digits, so the grid is Raw. Rules encoded:
// - Draw a snake: a 1-cell-wide path of orthogonally connected cells from a
//   head to a tail. It never touches itself orthogonally; diagonal touching is
//   allowed. (The "never doubles back to cover a 2x2" sentence is entailed:
//   a filled 2x2 would need every cell in it to touch two others.)
// - Clue cells (8 circles, 6 squares) are off the snake and carry no printed
//   value. A clue's value is an unknown that must equal BOTH its distance from
//   the head (squares) or the tail (circles), measured in orthogonal steps,
//   i.e. |row difference| + |column difference|, AND the number of the clue's
//   up-to-8 surrounding cells that are on the snake.
//
// Cell alphabet: each grid cell is OFF the snake or a snake cell coded by its
// role (BODY, HEAD, TAIL). The alphabet is widened to 10 so that Var cells can
// hold a row/column number (1-10) or a clue value; grid cells are restricted
// back to the four codes.

const OFF = 1;
const BODY = 2;
const HEAD = 3;
const TAIL = 4;
const SIZE = 10;

const shape = new Shape('10x10', SIZE, 'Raw');
const graph = cellGraph(shape);
const gridCells = graph.cells();

const isSnake = value => value === BODY || value === HEAD || value === TAIL;

// Clue markers, from the drawn grey underlays: circles (tail map) and squares
// (head map), as [row, col].
const circles = [[2, 6], [3, 8], [4, 6], [4, 9], [6, 2], [9, 5], [9, 8], [9, 9]];
const squares = [[4, 3], [5, 3], [6, 5], [8, 2], [10, 2], [10, 5]];

// --- Domain: every grid cell is one of the four codes; clue cells are OFF.
const domain = graph.makeReplicate(new Given(gridCells[0], OFF, BODY, HEAD, TAIL));
const clueGivens = [...circles, ...squares]
  .map(([row, col]) => new Given(makeCellId(row, col), OFF));

// --- Head and tail coordinates, and the unknown clue values.
// VH1/VH2 = head row/col, VT1/VT2 = tail row/col (1-10).
// VC1..VC8 = the circle values, VS1..VS6 = the square values, in the order
// the clue lists above give them.
const head = new Var('H', 'head', 2);
const tail = new Var('T', 'tail', 2);
const circleValues = new Var('C', 'circle-values', circles.length);
const squareValues = new Var('S', 'square-values', squares.length);
const [headRow, headCol] = head.cells();
const [tailRow, tailCol] = tail.cells();

// --- Degree: reads a cell's own code, then its orthogonal neighbours. A HEAD
// or TAIL cell has exactly one snake neighbour, a BODY cell exactly two, an
// OFF cell is unconstrained. With the snake connected (below) and exactly one
// HEAD and one TAIL (placement machines below), this leaves a single simple
// path: a disjoint extra loop or a branch cannot meet the degree counts.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, target, count }, value) => {
    if (phase === 'start') {
      if (!isSnake(value)) return { phase: 'off' };
      return { phase: 'on', target: value === BODY ? 2 : 1, count: 0 };
    }
    if (phase === 'off') return { phase: 'off' };
    const next = count + (isSnake(value) ? 1 : 0);
    return next > target ? undefined : { phase: 'on', target, count: next };
  },
  accept: ({ phase, target, count }) => phase === 'off' || count === target,
}, shape);

// Fixed up/down/left/right order so every interior cell's argument list is
// the same shift of its neighbours, which lets one template be Replicated
// over the 8x8 interior; edge and corner cells (2 or 3 neighbours) are
// stamped directly.
const ORTHOGONAL = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const orderedNeighbours = cell => ORTHOGONAL
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(c => c !== null);
const interior = gridCells.filter(cell => orderedNeighbours(cell).length === 4);
const interiorOrigin = interior[0];
const interiorDegree = new Replicate(
  [new NFA(degreeMachine, 'degree', interiorOrigin, ...orderedNeighbours(interiorOrigin))],
  Replicate.encodeTargetCells(interior, interiorOrigin, graph),
  interiorOrigin);
const interiorSet = new Set(interior);
const edgeDegrees = gridCells
  .filter(cell => !interiorSet.has(cell))
  .map(cell => new NFA(degreeMachine, 'degree', cell, ...orderedNeighbours(cell)));

// --- Single snake: the snake cells form one orthogonally-connected region.
const snakeConnected = new ConnectedValues('', [BODY, HEAD, TAIL]);

// --- End placement: reads (end row, end col) then the ten cells of one grid
// row; the cell at (end row, end col) holds `endValue` and no other cell of
// that row does. Over all ten rows this puts exactly one HEAD and one TAIL on
// the grid, at the coordinates the Vars name.
const placementMachine = (row, endValue) => NFA.encodeSpec({
  startState: { phase: 'row' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'row':
        // `col` stays null when this row is not the end's row.
        return { phase: 'col', col: value === row ? 0 : null };
      case 'col':
        return { phase: 'scan', col: state.col === null ? null : value, pos: 0 };
      case 'scan': {
        if (state.pos >= SIZE) return undefined;   // row fully scanned
        const pos = state.pos + 1;
        if ((value === endValue) !== (state.col === pos)) return undefined;
        return { phase: 'scan', col: state.col, pos };
      }
    }
  },
  accept: ({ phase, pos }) => phase === 'scan' && pos === SIZE,
  maxDepth: SIZE + 2,   // two coordinate cells, then the ten row cells
}, shape);
const placements = graph.rows().flatMap((cells, i) => [
  new NFA(placementMachine(i + 1, HEAD), 'head-at', headRow, headCol, ...cells),
  new NFA(placementMachine(i + 1, TAIL), 'tail-at', tailRow, tailCol, ...cells),
]);

// --- Clue value = distance: reads (end row, end col, clue value) and accepts
// when the value is |end row - clue row| + |end col - clue col|.
const distanceMachine = (row, col) => NFA.encodeSpec({
  startState: { phase: 'row', distance: 0 },
  transition: ({ phase, distance }, value) => {
    switch (phase) {
      case 'row': return { phase: 'col', distance: Math.abs(value - row) };
      case 'col': return { phase: 'value', distance: distance + Math.abs(value - col) };
      case 'value': return value === distance ? { phase: 'done' } : undefined;
      case 'done': return undefined;
    }
  },
  accept: ({ phase }) => phase === 'done',
}, shape);

// --- Clue value = count: reads the clue value, then each king-move
// neighbour of the clue cell, counting the snake cells (clamped one past the
// target, where the count can only fail).
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (isSnake(value) ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, shape);

const clueConstraints = (clues, valueCells, endRow, endCol) => clues.flatMap(([row, col], i) => [
  new NFA(distanceMachine(row, col), 'distance', endRow, endCol, valueCells[i]),
  new NFA(countMachine, 'count', valueCells[i], ...graph.kingNeighbours(makeCellId(row, col))),
]);

return [
  shape,
  domain,
  ...clueGivens,
  head,
  tail,
  circleValues,
  squareValues,
  interiorDegree,
  ...edgeDegrees,
  snakeConnected,
  ...placements,
  ...clueConstraints(circles, circleValues.cells(), tailRow, tailCol),
  ...clueConstraints(squares, squareValues.cells(), headRow, headCol),
];
