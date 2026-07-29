// Title: CottonTail
// Author: MavericksJD
// Video: https://www.youtube.com/watch?v=Kye27Vr0sGw
// Source: https://app.crackingthecryptic.com/3xnydynuih

// Standard Sudoku. Purple lines are renban, green lines are whispers, grey
// circles are odd, and projected sums total all coloured-line cells in a lane.

const renbans = [
  ['R3C3','R2C3','R1C4','R2C4','R3C5'],['R2C6','R1C7','R2C8','R2C7','R3C6'],['R9C4','R9C5','R9C6','R8C7'],['R7C2','R8C2','R9C3'],
  ['R7C3','R7C4','R7C5','R7C6'],['R6C2','R5C3','R4C4'],['R7C7','R6C7','R5C7','R4C6'],['R3C2','R3C1','R2C1'],
];
const whispers = [
  ['R6C2','R7C2'],['R3C3','R4C4'],['R3C5','R2C6'],['R4C6','R3C6'],['R9C3','R9C4'],['R8C7','R7C7'],['R5C9','R4C9','R4C8'],['R1C8','R1C9'],
];
const coloured = new Set([...renbans.flat(), ...whispers.flat()]);
const projected = (total, cells) => new Sum(total, ...cells.filter(cell => coloured.has(cell)));
const graph = cellGraph('9x9');
return [
  new Shape('9x9'),
  ...renbans.map(cells => new Renban(...cells)), ...whispers.map(cells => new Whisper(5, ...cells)),
  new Given('R5C4', 1,3,5,7,9), new Given('R5C6', 1,3,5,7,9),
  projected(13, graph.column(5)), projected(35, graph.column(7)), projected(33, graph.row(7)), projected(13, graph.row(9)),
];
