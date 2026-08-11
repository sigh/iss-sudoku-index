// Title: Yin Yang Vaults
// Author: Schwupel
// Video: https://www.youtube.com/watch?v=onz3V98dc3I
// Source: https://app.crackingthecryptic.com/sudoku/brQJjfHMDb

// Normal sudoku (rows, columns, boxes). Shade some cells so shaded cells form
// one orthogonally-connected region and unshaded cells form another, and no
// 2x2 block is fully shaded or fully unshaded (standard Yin-Yang shading).
// Six outside clues give the sum of the first continuous run of shaded cells
// seen scanning in from that side (any leading unshaded cells before the run
// are simply skipped). The five drawn cages are the puzzle's only cage type,
// and the rules describe only one ("Blue cages are 'vaults'"), so all five
// are read as vaults: digits may repeat inside a vault, no vault digit may
// equal an orthogonally-adjacent exterior digit, and a vault's largest digit
// equals its count of shaded cells.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const shade = graph.makeOverlay('VS');

// Every shade Var is either shaded or unshaded.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

// No 2x2 block may be all shaded or all unshaded: one NFA on the top-left
// block, replicated to every block origin.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// Outside-clue lines (top C2, left R3, left R6, right R3, right R9, bottom
// C6), each running from its labelled edge inward.
const row3 = graph.row('R3C1');
const row6 = graph.row('R6C1');
const row9 = graph.row('R9C1');
const col2 = graph.column('R1C2');
const col6 = graph.column('R1C6');
const outsideClues = [
  { total: 5, line: col2 },
  { total: 2, line: row3 },
  { total: 16, line: row6 },
  { total: 5, line: [...row3].reverse() },
  { total: 31, line: [...row9].reverse() },
  { total: 8, line: [...col6].reverse() },
];

// The clue is the sum of the first run of shaded cells scanning inward: any
// cells before the run are unshaded, the run itself is shaded, and the cell
// after it (if any) is unshaded. Enumerate every [start, end] window and Or
// them -- exactly one window is the true run.
function edgeSumConstraint(total, line) {
  const windows = [];
  for (let start = 0; start < line.length; start++) {
    for (let end = start; end < line.length; end++) windows.push([start, end]);
  }
  return new Or(windows.map(([start, end]) => new And([
    new Sum(total, ...line.slice(start, end + 1)),
    ...shade.at(line.slice(start, end + 1)).map(cell => new Given(cell, SHADED)),
    // The whole prefix before the window must be unshaded, not just the one
    // adjacent cell, or a window could be picked even with an earlier,
    // separate shaded island still ahead of it.
    ...shade.at(line.slice(0, start)).map(cell => new Given(cell, UNSHADED)),
    ...(end + 1 < line.length
      ? [new Given(shade.at(line[end + 1]), UNSHADED)] : []),
  ])));
}

// Vault cell lists are transcribed from the drawn cage boundaries.
const vaults = [
  ['R3C3', 'R3C4', 'R4C3', 'R4C4'],
  ['R2C3', 'R2C4', 'R2C5', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R5C7'],
  ['R2C7', 'R3C7', 'R3C8', 'R3C9', 'R4C9', 'R5C9'],
  ['R7C2', 'R7C3', 'R7C4'],
  ['R6C6', 'R7C6', 'R8C6', 'R8C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
];

// A vault digit differs from every orthogonally-adjacent exterior digit: the
// first symbol is the exterior neighbour, later symbols the vault cells; the
// state keeps the neighbour's digit and rejects a matching vault digit.
const vaultBoundarySpec = NFA.encodeSpec({
  startState: { outside: null },
  transition: ({ outside }, value) =>
    outside === null ? { outside: value } : value === outside ? undefined : { outside },
  accept: ({ outside }) => outside !== null,
}, geometry.numValues);
function vaultExclusions(vault) {
  const memberSet = new Set(vault);
  const exterior = new Set(vault.flatMap(cell => graph.neighbours(cell)
    .filter(neighbor => !memberSet.has(neighbor))));
  return [...exterior].map(neighbor =>
    new NFA(vaultBoundarySpec, 'Vault boundary', neighbor, ...vault));
}

// A vault's largest digit equals its shaded-cell count. Scans (shade, digit)
// pairs for the vault's cells in order, alternating phase between the two,
// tracking the running shaded count and running max digit; accepts only if
// they end equal. count is clamped at numValues+1: once it exceeds the
// largest possible digit it can never match max again, so every such count
// collapses to one sink state.
const vaultMaxEqualsShadedSpec = NFA.encodeSpec({
  startState: { phase: 'shade', shaded: null, count: 0, max: 0 },
  transition: ({ phase, shaded, count, max }, value) => {
    if (phase === 'shade') {
      return { phase: 'digit', shaded: value === SHADED, count, max };
    }
    return {
      phase: 'shade', shaded: null,
      count: Math.min(count + (shaded ? 1 : 0), geometry.numValues + 1),
      max: Math.max(max, value),
    };
  },
  accept: ({ phase, count, max }) => phase === 'shade' && count === max,
}, geometry.numValues);
function vaultMaxEqualsShaded(vault) {
  return new NFA(vaultMaxEqualsShadedSpec, 'Vault max = shaded count',
    ...vault.flatMap(cell => [shade.at(cell), cell]));
}

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  // Yin-Yang connectivity: each shade forms one orthogonally connected region.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...outsideClues.map(({ total, line }) => edgeSumConstraint(total, line)),
  ...vaults.flatMap(vaultExclusions),
  ...vaults.map(vaultMaxEqualsShaded),
];
