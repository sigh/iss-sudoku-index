// Title: Vaulted Lattice
// Author: Blobz
// Video: https://www.youtube.com/watch?v=p-6xy-yjSHo
// Source: https://sudokupad.app/blobz/vaulted-lattice

// Normal Sudoku, the three given digits, and the eleven pink renban lines.
// Each listed Vault allows repeats; a numbered Vault also has its shown sum.
// Every Vault digit differs from every orthogonally adjacent exterior cell.
const vaults = [
  ['R1C2', 'R1C3', 'R1C4', 'R2C2'],
  ['R1C6', 'R1C7', 'R2C7', 'R2C8', 'R3C8', 'R3C9', 'R4C9', 'R5C8', 'R5C9', 'R6C8'],
  ['R8C8', 'R9C6', 'R9C7', 'R9C8'],
  ['R4C2', 'R5C1', 'R5C2', 'R6C1', 'R7C1', 'R7C2', 'R8C2', 'R8C3', 'R9C3', 'R9C4'],
  ['R3C4', 'R3C5', 'R3C6', 'R4C5', 'R4C6', 'R4C7', 'R5C7', 'R6C7'],
  ['R4C3', 'R5C3', 'R6C3', 'R6C4', 'R6C5', 'R7C4', 'R7C5', 'R7C6'],
  ['R3C2', 'R3C3'], ['R7C7', 'R7C8'], ['R8C1', 'R9C1'],
  ['R1C9', 'R2C9'], ['R8C5', 'R9C5'], ['R1C5', 'R2C5'],
];

// The Vault cell lists above are transcribed from the drawn cage boundaries.
const vaultSums = [
  [3, ...vaults[6]], [5, ...vaults[7]], [7, ...vaults[8]],
  [6, ...vaults[9]], [10, ...vaults[10]], [10, ...vaults[11]],
];

const renbans = [
  ['R9C3', 'R8C4', 'R7C5', 'R6C6', 'R5C7'],
  ['R8C3', 'R7C4', 'R6C5', 'R5C6', 'R4C7'],
  ['R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7'],
  ['R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7'],
  ['R5C3', 'R4C4', 'R3C5', 'R2C6', 'R1C7'],
  ['R4C3', 'R3C4', 'R2C5', 'R1C6'],
  ['R3C3', 'R2C4', 'R1C5'], ['R1C4', 'R2C3'],
  ['R9C4', 'R8C5', 'R7C6', 'R6C7'],
  ['R9C5', 'R8C6', 'R7C7'], ['R8C7', 'R9C6'],
];

// The first symbol is a boundary neighbor; later symbols are Vault cells.
// The state keeps that neighbor's digit and rejects any matching Vault digit.
const vaultBoundarySpec = NFA.encodeSpec({
  startState: {outside: null},
  transition: ({outside}, value) =>
    outside === null ? {outside: value} : value === outside ? undefined : {outside},
  accept: ({outside}) => outside !== null,
}, 9);

const graph = cellGraph('9x9');
function vaultExclusions() {
  return vaults.flatMap(vault => {
    const memberSet = new Set(vault);
    const exterior = new Set(vault.flatMap(cell => graph.neighbours(cell)
      .filter(neighbor => !memberSet.has(neighbor))));
    return [...exterior].map(neighbor =>
      new NFA(vaultBoundarySpec, 'Vault boundary', neighbor, ...vault));
  });
}

return [
  new Shape('9x9'),
  new Given('R1C7', 1), new Given('R5C5', 2), new Given('R9C3', 3),
  ...renbans.map(cells => new Renban(...cells)),
  ...vaultSums.map(([total, ...cells]) => new Sum(total, ...cells)),
  ...vaultExclusions(),
];
