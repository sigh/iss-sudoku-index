// Title: Buffet
// Author: zetamath
// Video: https://www.youtube.com/watch?v=getFbxo3NHM
// Source: https://app.crackingthecryptic.com/sudoku/9R8DNm8dq6

// Rules encoded here, in full:
//   Normal sudoku rules apply.
//   Each of the 11 circles marks the head of a "snake": a path of 2-9 cells that
//   starts at the circled cell and steps orthogonally between cell centres. The
//   digit placed in the circled cell is that snake's length.
//   A snake never touches itself orthogonally, so two cells of one snake are
//   orthogonally adjacent only when they are consecutive along it.
//   Snakes may touch each other, but no cell lies on two snakes.
//   R5C2 and R6C2 (drawn grey, in box 4) lie on no snake.
//   The circle's colour -- and the letter in the same cell's cage -- gives the
//   line type carried by the snake:
//     R renban, S region sum, W German whispers (difference >= 5),
//     M modular (mod 3), E entropic, P parity, T ten line (groups summing to 10).
//   Region sum lines occupy at least two boxes.
// No rule is omitted.

const OUT = 1;
const IN = 2;
const MIN_LEN = 2;
const MAX_LEN = 9;

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// Drawn clue data. Each head is a coloured ring with a white inner disc drawn on a
// cell centre, and the same cell carries a single-cell cage holding the
// colour-blind letter; colour and letter agree on all 11.
const HEADS = [
  ['R1C1', 'S'],  // blue circle,   cage "S"
  ['R1C3', 'T'],  // grey circle,   cage "T"
  ['R1C6', 'R'],  // purple circle, cage "R"
  ['R2C1', 'W'],  // green circle,  cage "W"
  ['R2C4', 'W'],  // green circle,  cage "W"
  ['R2C5', 'T'],  // grey circle,   cage "T"
  ['R2C9', 'E'],  // orange circle, cage "E"
  ['R3C2', 'R'],  // purple circle, cage "R"
  ['R3C6', 'M'],  // yellow circle, cage "M"
  ['R3C8', 'R'],  // purple circle, cage "R"
  ['R4C4', 'P'],  // red circle,    cage "P"
];
// The two grey shaded cells drawn in box 4.
const GREY = ['R5C2', 'R6C2'];

const headCells = HEADS.map(([cell]) => cell);
// A head belongs to its own snake and no cell lies on two snakes, so no snake may
// step onto another snake's head; the grey cells are barred outright.
const blocked = new Set([...GREY, ...headCells]);

const neighbours = (cellId) => graph.neighbours(cellId);

const boxOf = new Map();
graph.boxes().forEach((cells, i) => cells.forEach((c) => boxOf.set(c, i)));

// The snake routes are not drawn, so each snake's route is whatever the geometric
// rules above permit. This walks out every such route from a head: orthogonal
// steps, 2-9 cells, no revisits, and each new cell orthogonally adjacent to
// exactly one cell already on the path -- its own predecessor -- which is the
// no-self-touch rule.
const routesFrom = (head) => {
  const out = [];
  const path = [head];
  const onPath = new Set(path);
  const walk = () => {
    if (path.length >= MIN_LEN) out.push(path.slice());
    if (path.length === MAX_LEN) return;
    for (const next of neighbours(path[path.length - 1])) {
      if (onPath.has(next) || blocked.has(next)) continue;
      if (neighbours(next).filter((m) => onPath.has(m)).length !== 1) continue;
      path.push(next);
      onPath.add(next);
      walk();
      path.pop();
      onPath.delete(next);
    }
  };
  walk();
  return out;
};

const mod3Differ = Pair.fnToKey((a, b) => a % 3 !== b % 3, shape);
const bandDiffer = Pair.fnToKey(
  (a, b) => Math.floor((a - 1) / 3) !== Math.floor((b - 1) / 3), shape);
// Two membership flags may not both be IN: this is what keeps snakes off each
// other's cells once each snake has picked a route.
const notBothIn = Pair.fnToKey((a, b) => !(a === IN && b === IN), shape);

const lineRule = (type, cells) => {
  switch (type) {
    case 'R': return new Renban(...cells);
    case 'W': return new Whisper(5, ...cells);
    case 'P': return new Modular(2, ...cells);
    case 'T': return new SumLine(10, ...cells);
    // Modular and Entropic constrain windows of three cells, so on a two-cell
    // snake they say nothing and the rules' own two-cell case has to be stated:
    // "Length two modular lines contain one of each of two of these groups".
    case 'M': return cells.length > 2
      ? new Modular(3, ...cells)
      : new Pair(mod3Differ, 'modular pair', ...cells);
    case 'E': return cells.length > 2
      ? new Entropic(...cells)
      : new Pair(bandDiffer, 'entropic pair', ...cells);
    // "The cells along a region sum line in each 3x3 box it passes through sum to
    // the same total" -- one total per box, so a route that leaves a box and comes
    // back adds those cells to that box's single total rather than opening a new
    // segment. That wording is why this is EqualSum over box groups and not
    // RegionSumLine, whose totals are per visit.
    case 'S': {
      const byBox = new Map();
      for (const cell of cells) {
        const box = boxOf.get(cell);
        if (!byBox.has(box)) byBox.set(box, []);
        byBox.get(box).push(cell);
      }
      return new EqualSum(...byBox.values());
    }
  }
};

const PREFIXES = ['VA', 'VB', 'VC', 'VD', 'VE', 'VF', 'VG', 'VH', 'VI', 'VJ', 'VK'];

const snakes = HEADS.map(([head, type], i) => {
  const routes = routesFrom(head).filter(
    // "Region sum lines always occupy at least two regions."
    (r) => type !== 'S' || new Set(r.map((c) => boxOf.get(c))).size >= 2);
  // One membership flag per cell this snake can reach on some route.
  const cells = [...new Set(routes.flat())];
  return { head, type, routes, cells, flags: graph.makeOverlay(PREFIXES[i], cells) };
});

// One 2-valued membership flag per (snake, cell the snake can reach). These carry
// each snake's chosen route out to the other snakes; nothing else reads them.
const membership = snakes.flatMap((s) => [
  s.flags.toVar(`snake at ${s.head}`),
  s.flags.makeReplicate(new Given(s.flags.cells()[0], OUT, IN)),
  new Given(s.flags.at(s.head), IN),
  // The flags total s.cells.length + (number of IN flags), so this pins the count
  // of IN cells to the head cell's digit: the snake is as long as its head says.
  new Sum(s.cells.length, ...s.flags.cells(), [s.head, -1]),
]);

// One branch per route the geometry allows. A branch fixes the head digit to that
// route's length, flags the route's cells IN -- the Sum above then forces every
// other reachable cell OUT -- and applies the head's line rule to the route, which
// inside the branch is an ordered list of known cells.
const routeChoice = snakes.map((s) => new Or(
  s.routes.map((route) => new And([
    new Given(s.head, route.length),
    ...route.slice(1).map((c) => new Given(s.flags.at(c), IN)),
    lineRule(s.type, route),
  ]))));

const disjoint = snakes.flatMap((s, i) => snakes.slice(i + 1).flatMap(
  (t) => s.cells.filter((c) => t.flags.at(c)).map(
    (c) => new Pair(notBothIn, 'no shared cell', s.flags.at(c), t.flags.at(c)))));

return [
  shape,
  ...membership,
  ...routeChoice,
  ...disjoint,
];
