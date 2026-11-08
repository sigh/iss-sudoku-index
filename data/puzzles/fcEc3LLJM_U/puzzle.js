// Title: Three Pounds, Fifteen Shillings
// Author: sisaloofafump
// Video: https://www.youtube.com/watch?v=fcEc3LLJM_U
// Source: https://sudokupad.app/5w6o2pvrh3

// Normal Sudoku; three disjoint digit triples each sum to 15; each 2x2
// contains a digit from every triple; arrow arms sum to their circle.
const groupVar = new Var('G', 'Digit set members', 9);
const groups = Array.from({length: 3}, (_, g) =>
  groupVar.cells().slice(3*g, 3*g+3));
const members = groups.flat();
// Increasing triples and increasing minima remove only auxiliary naming freedom.
const partition = [groupVar,
  new AllDifferent(...members),
  ...groups.map(g => new Thermo(...g)),
  new Thermo(...groups.map(g => g[0])),
  ...groups.map(g => new Sum(15, ...g))];
// A window meets a triple iff at least one of its four cells equals a member.
const windows = Array.from({length: 64}, (_, k) => {
  const r = Math.floor(k / 8) + 1, c = k % 8 + 1;
  const cells = [makeCellId(r,c), makeCellId(r,c+1),
    makeCellId(r+1,c), makeCellId(r+1,c+1)];
  return groups.map(g => new Or(cells.flatMap(cell =>
    g.map(member => new SameValues(2, cell, member)))));
}).flat();
// The sixteen printed givens.
const givens = [["R1C5", 2], ["R1C9", 3], ["R4C4", 6], ["R4C5", 3], ["R4C6", 2], ["R5C1", 4], ["R5C4", 9], ["R5C5", 5], ["R5C6", 1], ["R5C9", 6], ["R6C4", 8], ["R6C5", 7], ["R6C6", 4], ["R7C8", 7], ["R9C5", 8], ["R9C9", 9]];
// Paths follow the five drawn arrows, circle first.
const arrows = [
 ['R6C6','R6C7','R5C7'], ['R4C3','R5C3','R6C3'],
 ['R7C8','R8C9','R9C8'], ['R7C4','R8C4','R7C5'],
 ['R2C4','R1C3','R1C4']
];
return [new Shape('9x9'), ...givens.map(([c,v]) => new Given(c,v)),
 ...partition, ...windows, ...arrows.map(a => new Arrow(...a))];
