// Title: The Song of the Serpent and the Wanderer
// Author: Damasosos92
// Video: https://www.youtube.com/watch?v=6re4WlQkr9A
// Source: https://app.crackingthecryptic.com/sudoku/hf4Jjm3H3J

// Rules encoded:
// - Sudokuland: the grid divides into nine 9-cell orthogonally-connected
//   regions, each holding 1-9 once -- ChaosConstruction (region size/
//   connectivity/distinctness) + NoBoxes (drop the fixed 3x3 boxes).
// - King's Palace: the drawn 9-cell region is one of those nine regions --
//   pin its cells to one shared (solver-chosen) region label with SameValues,
//   never a constant label.
// - The Serpent: shaded cells form a single snake, one cell wide, that does
//   not branch and cannot touch itself, not even diagonally, and holds only
//   odd digits. "Does not branch" is a max-degree-2 bound on shaded
//   orthogonal neighbours; the rules do not say whether the snake is an open
//   path or a closed loop, so degree is bounded at <=2 rather than forced to
//   exactly 2, which is satisfied by either reading and does not tighten past
//   what "does not branch" states. The diagonal non-touch is a separate,
//   local 2x2-block rule (a legitimate corner turn also puts two shaded
//   cells diagonally adjacent, so this checks for the *unconnected* diagonal
//   pattern, not any diagonal adjacency).
// - The Watchtowers: a watchtower's own digit counts its shaded knight-move
//   cells; those shaded cells' digits sum to its printed corner total. Every
//   region holds exactly one watchtower (AllDifferent over their region
//   labels -- 9 cells into 9 regions is a bijection). The snake may not pass
//   through a watchtower (its shading is fixed off).
// - The Spell: every region holds the same number of snake cells -- one
//   shared auxiliary Var carries that common count, checked once per region
//   label with a compact counting NFA.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const SHADED = 1;
const UNSHADED = 2;

// The chaos-construction region-label cell paired with each grid cell.
const cc = graph.makeOverlay('CC');
// The serpent-shading cell paired with each grid cell.
const shade = graph.makeOverlay('VS');

// King's Palace cells (drawn region, hole at R6C6).
const KINGS_PALACE = [
  'R5C4', 'R5C5', 'R5C6', 'R5C7',
  'R6C4', 'R6C5', 'R6C7',
  'R7C4', 'R7C5',
];

// Watchtowers: squared overlay cell + its drawn top-left corner total.
const WATCHTOWERS = [
  { cell: 'R2C3', total: 14 },
  { cell: 'R1C9', total: 4 },
  { cell: 'R9C9', total: 3 },
  { cell: 'R7C4', total: 17 },
  { cell: 'R9C6', total: 10 },
  { cell: 'R9C4', total: 20 },
  { cell: 'R9C3', total: 15 },
  { cell: 'R4C6', total: 18 },
  { cell: 'R3C2', total: 14 },
];

const KNIGHT_OFFSETS = [
  [-1, -2], [-1, 2], [1, -2], [1, 2],
  [-2, -1], [-2, 1], [2, -1], [2, 1],
];
const knightNeighbours = cell => KNIGHT_OFFSETS.map(([dr, dc]) => graph.step(cell, dr, dc)).filter(c => c !== null);

// --- Givens (R2C1, R5C6, R6C2, R6C5). ---
const givens = [
  new Given('R2C1', 7),
  new Given('R5C6', 9),
  new Given('R6C2', 3),
  new Given('R6C5', 4),
];

// --- Sudokuland + King's Palace. ---
const chaosConstruction = [
  new ChaosConstruction(),
  new NoBoxes(),
  new SameValues(9, ...cc.at(KINGS_PALACE)),
];

// --- Serpent shading domain: every cell is on (1) or off (2) the snake. ---
const firstShadeCell = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShadeCell, SHADED, UNSHADED));

// The snake may not pass through a watchtower.
const watchtowersUnshaded = WATCHTOWERS.map(
  w => new Given(shade.at(w.cell), UNSHADED));

// Single connected snake (orthogonal adjacency).
const snakeConnected = new ConnectedValues('VS', SHADED);

// Does not branch: each shaded cell has at most 2 shaded orthogonal
// neighbours (see header note on the open-path-vs-loop reading).
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membership) => {
    if (phase === 'start') {
      return membership === SHADED
        ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membership === SHADED ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: () => true,
}, geometry.numValues);
const noBranch = gridCells.map(cell => new NFA(degreeMachine, 'no-branch',
  ...shade.at([cell, ...graph.neighbours(cell)])));

// Cannot touch itself, not even diagonally: no 2x2 block may hold shaded
// cells on exactly one diagonal with the other diagonal both unshaded (a
// real corner turn also shades the connecting orthogonal cell(s), so this
// only forbids the disconnected diagonal pattern).
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, membership) => {
    if (block === null) return { block: null };
    const next = [...block, membership === SHADED];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = shade.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no-diagonal-touch',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// Snake cells hold only odd digits: a 2-cell relation between a cell's own
// shading and its own digit, so this is a Pair, not an NFA.
const oddIfShadedKey = Pair.fnToKey(
  (shadeValue, digit) => shadeValue === UNSHADED || digit % 2 === 1,
  geometry.numValues);
const oddSnakeDigits = gridCells.map(cell =>
  new Pair(oddIfShadedKey, 'odd-if-shaded', shade.at(cell), cell));

// --- Watchtowers. ---

// Every region holds exactly one watchtower: 9 cells into 9 region labels,
// so AllDifferent is exactly a bijection.
const oneWatchtowerPerRegion = new AllDifferent(
  ...cc.at(WATCHTOWERS.map(w => w.cell)));

// A watchtower's own digit counts its shaded knight-move cells.
const watchtowerCountMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const hit = value === SHADED ? 1 : 0;
    return { target, count: Math.min(count + hit, target + 1) };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const watchtowerCounts = WATCHTOWERS.map(w => new NFA(
  watchtowerCountMachine, 'watchtower-count',
  w.cell, ...shade.at(knightNeighbours(w.cell))));

// Those shaded knight-move cells' digits sum to the watchtower's corner
// total (a fixed constant per watchtower, baked into its own machine).
const makeWatchtowerSumMachine = total => NFA.encodeSpec({
  startState: { phase: 'shade', sum: 0 },
  transition: ({ phase, sum, pendingShade }, value) => {
    if (phase === 'shade') {
      return { phase: 'digit', sum, pendingShade: value === SHADED };
    }
    const hit = pendingShade ? value : 0;
    return { phase: 'shade', sum: Math.min(sum + hit, total + 1) };
  },
  accept: ({ phase, sum }) => phase === 'shade' && sum === total,
}, geometry.numValues);
const watchtowerSums = WATCHTOWERS.map(w => new NFA(
  makeWatchtowerSumMachine(w.total), 'watchtower-sum',
  ...knightNeighbours(w.cell).flatMap(n => [shade.at(n), n])));

// --- The Spell: every region holds the same number of snake cells. ---

// One shared aux cell carries that common per-region count.
const spellCount = new Var('K', 'snake cells per region', 1);
const spellCountCell = spellCount.cell(1);

// One counting NFA per region label, scanning every cell's (region, shade)
// pair and comparing the shaded-cells-with-this-label count to the shared
// aux cell.
const ccShadePairs = gridCells.flatMap(cell => [cc.at(cell), shade.at(cell)]);
const makeSpellMachine = label => NFA.encodeSpec({
  startState: { phase: 'target', target: null, count: 0 },
  transition: ({ phase, target, count, pendingLabel }, value) => {
    if (phase === 'target') return { phase: 'label', target: value, count: 0 };
    if (phase === 'label') {
      return { phase: 'shade', target, count, pendingLabel: value };
    }
    const hit = (pendingLabel === label && value === SHADED) ? 1 : 0;
    return { phase: 'label', target, count: Math.min(count + hit, target + 1) };
  },
  accept: ({ phase, target, count }) => phase === 'label' && count === target,
}, geometry.numValues);
const spellCounts = Array.from({ length: geometry.numValues }, (_, i) => i + 1)
  .map(label => new NFA(
    makeSpellMachine(label), `spell-count-${label}`,
    spellCountCell, ...ccShadePairs));

return [
  new Shape('9x9'),
  ...givens,
  ...chaosConstruction,
  shade.toVar('serpent shading'),
  shadeDomain,
  ...watchtowersUnshaded,
  snakeConnected,
  ...noBranch,
  noDiagonalTouches,
  ...oddSnakeDigits,
  oneWatchtowerPerRegion,
  ...watchtowerCounts,
  ...watchtowerSums,
  spellCount,
  ...spellCounts,
];
