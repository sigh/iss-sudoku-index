// Title: Duplicitous Arrows
// Author: Calvinball
// Video: https://www.youtube.com/watch?v=YrJZmCMXWZE
// Source: https://sudokupad.app/4x1yza1olm

// Normal Sudoku uses digits; clues use real values. Exactly one liar per
// row, column and box changes its digit, with distinct liar digits and values.
// Each double arrow equates its circle sum and shaft sum; X pairs sum to 10.
const shape = new Shape('9x9');
const indices = [1,2,3,4,5,6,7,8,9];
const rows = indices.map(r=>indices.map(c=>makeCellId(r,c))); 
const value = cell => { const {row,col}=parseCellId(cell); return 'VV'+((row-1)*9+col); };
const eq = Pair.fnToKey((a,b)=>a===b,shape);
const ne = Pair.fnToKey((a,b)=>a!==b,shape);
// VP records the liar column in each row. Distinct column thirds in each
// three-row band put precisely one liar in each box.
const differentStacks = Pair.fnToKey((a,b)=>Math.floor((a-1)/3)!==Math.floor((b-1)/3),shape);
const liarRelations=rows.flatMap((row,r)=>row.map((cell,c)=>new Or([
  new And([new Given('VP'+(r+1),c+1),new Pair(ne,'liar',cell,value(cell))]),
  new And([new Given('VP'+(r+1),...Array.from({length:9},(_,i)=>i+1).filter(i=>i!==c+1)),new Pair(eq,'truth',cell,value(cell))])
])));
const selectedLiars=rows.map((row,r)=>new Or(row.map((cell,c)=>new And([
  new Given('VP'+(r+1),c+1),
  new SameValues(2,'VD'+(r+1),cell),
  new SameValues(2,'VL'+(r+1),value(cell))
]))));
// Circle endpoints and shaft cells transcribed from the cyan double arrows.
const arrows = [
 [['R3C1','R3C2'],['R2C1','R2C2']],
 [['R3C1','R3C2'],['R4C1','R5C1','R6C1','R6C2','R5C2','R4C2']],
 [['R2C3','R3C3'],['R2C4','R2C5','R3C5','R3C4']],
 [['R3C2','R6C3'],['R4C3','R5C3']],
 [['R6C3','R9C3'],['R7C4','R7C5','R7C6','R8C6','R8C5','R8C4']],
 [['R6C3','R9C3'],['R7C3','R8C3','R7C2','R8C2','R9C2']],
 [['R6C5','R3C6'],['R5C6','R4C6']],
 [['R1C6','R4C9'],['R2C7','R3C8']],
 [['R4C9','R6C6'],['R4C8','R5C7']],
 [['R7C7','R7C9'],['R6C7','R6C8','R6C9']],
 [['R8C7','R8C9'],['R8C8','R9C9']]
];
// The five printed X marks.
const xs=[['R4C5','R5C5'],['R5C5','R6C5'],['R2C6','R3C6'],['R7C8','R8C8'],['R1C8','R1C9']];
return [shape,new Var('V','Real values',81),new Var('P','Liar column',9),
 new Var('D','Liar digits',9),new Var('L','Liar values',9),
 ...liarRelations,...selectedLiars,
 new AllDifferent(...rows.map((_,r)=>'VP'+(r+1))),
 ...[0,3,6].flatMap(b=>[[b,b+1],[b,b+2],[b+1,b+2]].map(([a,c])=>new Pair(differentStacks,'different boxes','VP'+(a+1),'VP'+(c+1)))),
 new AllDifferent(...rows.map((_,r)=>'VD'+(r+1))),
 new AllDifferent(...rows.map((_,r)=>'VL'+(r+1))),
 ...arrows.map(([circles,shaft])=>new EqualSum(circles.map(value),shaft.map(value))),
 ...xs.map(cells=>new Sum(10,...cells.map(value)))
];
