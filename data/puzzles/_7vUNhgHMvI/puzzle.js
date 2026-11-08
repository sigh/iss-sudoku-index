// Title: Greatest Lies
// Author: Marty Sears and Dorlir
// Video: https://www.youtube.com/watch?v=_7vUNhgHMvI
// Source: https://sudokupad.app/lobbo5pxv4

// Normal Sudoku applies to digits. Each house has one liar; liar digits and
// real values each run 1-9. Olive lines, black dots and Xs use real values.
// The right-hand notes record each row's liar digit and value.
const shape = new Shape('9x9');
const graph = cellGraph(shape);
const cells = graph.rows().flat();
const values = new Var('VV','Real values',81);
const markers = new Var('VM','Liar markers',81);
const digits = new Var('VD','Liar digits by row',9);
const real = new Var('VL','Liar values by row',9);
const value = c => values.cell(cells.indexOf(c) + 1);
const marker = c => markers.cell(cells.indexOf(c) + 1);
const equal = Pair.fnToKey((a,b) => a === b, shape);
const unequal = Pair.fnToKey((a,b) => a !== b, shape);
const ratio = Pair.fnToKey((a,b) => a === 2*b || b === 2*a, shape);
const ten = Pair.fnToKey((a,b) => a+b === 10, shape);
// Marker 1 is truthful, marker 2 is a liar. Each liar links to its row's notes.
const liars = cells.map(c => {
  const r = parseCellId(c).row;
  return new Or([
    new And([new Given(marker(c),1), new Pair(equal,'truth',c,value(c))]),
    new And([new Given(marker(c),2), new Pair(unequal,'liar',c,value(c)),
      new Pair(equal,'liar digit',c,digits.cell(r)),
      new Pair(equal,'liar value',value(c),real.cell(r))])]);
});
// Nine markers sum to 10 precisely when one is 2 and the other eight are 1.
const houses = graph.rowsColumnsBoxes().map(h => new Sum(10,...h.map(marker)));
// Olive centre lines, with intermediate cell centres included along straight strokes.
const lines = [
 'R9C8 R9C7 R8C6 R9C5 R8C4 R9C3 R9C2 R8C2 R8C1 R7C1 R6C2 R5C3 R4C2 R3C1 R2C1 R1C1 R1C2 R1C3 R2C4 R3C5 R2C6 R1C7 R1C8 R2C8 R2C9 R3C9 R4C9 R5C8 R6C8 R7C9 R8C9 R8C8 R7C7',
 'R6C6 R6C7 R5C7 R4C6',
 'R7C4 R7C5 R7C6'
].map(s => s.split(' '));
// State retains the three greatest occurrences, including ties. The greatest
// exceeds every other pair exactly when it exceeds second plus third greatest.
const greatest = NFA.encodeSpec({
  startState: {top:[0,0,0]},
  transition: ({top},v) => ({top:[...top,v].sort((a,b)=>b-a).slice(0,3)}),
  accept: ({top}) => top[0] > top[1]+top[2],
},shape);
// Six black edge dots and three printed X marks.
const dots = [['R1C4','R2C4'],['R3C4','R3C5'],['R1C8','R1C9'],['R1C9','R2C9'],['R8C1','R9C1'],['R9C1','R9C2']];
const xs = [['R8C6','R9C6'],['R1C2','R2C2'],['R4C2','R4C3']];
return [shape,
 values,markers,digits,real,
 ...liars,...houses,
 new AllDifferent(...digits.cells()),
 new AllDifferent(...real.cells()),
 ...lines.map(l=>new NFA(greatest,'greatest value',l.map(value))),
 ...dots.map(p=>new Pair(ratio,'black dot',...p.map(value))),
 ...xs.map(p=>new Pair(ten,'X',...p.map(value)))
];
