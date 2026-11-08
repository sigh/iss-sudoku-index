// Title: can you pick the plumpest pumpkin puzzle?
// Author: aqjhs
// Video: https://www.youtube.com/watch?v=JlGCTO3p7A0
// Source: https://sudokupad.app/t35slg1dee

// Normal Sudoku; orange blobs have equal sums. Black shapes specify integer
// ratios and white shapes specify differences, equal iff the shapes match.
const shape = new Shape('9x9');
// Orange rounded rectangles: top-left row/column and cell height/width.
const rectangles = [[1,6,2,2],[2,4,2,2],[3,8,2,2],[4,2,2,3],
  [4,5,2,2],[5,7,2,2],[7,1,2,2],[7,7,2,3],[8,2,2,2]];
const blobs = rectangles.map(([r,c,h,w]) => Array.from({length:h*w},
  (_,i) => makeCellId(r+Math.floor(i/w),c+i%w)));
// Black square, circle and triangle glyphs on pumpkin cell boundaries.
const black = [
 [['R1C6','R2C6'],['R7C1','R8C1'],['R8C3','R9C3']],
 [['R4C3','R4C4'],['R5C8','R6C8']],
 [['R1C7','R2C7'],['R4C2','R4C3'],['R4C5','R5C5'],
  ['R4C6','R5C6'],['R7C7','R7C8'],['R7C8','R7C9']]
];
// White four-point star, eight-point star, five-point star and cross glyphs.
const white = [
 [['R2C4','R3C4']],
 [['R3C8','R3C9']],
 [['R5C7','R6C7'],['R8C2','R9C2']],
 [['R2C5','R3C5'],['R4C8','R4C9'],['R7C2','R8C2']]
];
// Each selector records its shape's numeric ratio/difference. Pair predicates
// compare the marked digits; AllDifferent implements the reverse implication.
const families = (groups, prefix, ratio) => groups.map((edges,i) =>
  new Or(Array.from({length:8},(_,j) => {
    const n=j+(ratio?2:1);
    const key=Pair.fnToKey((a,b) => ratio ? a===n*b || b===n*a : Math.abs(a-b)===n,shape);
    return new And([new Given(`${prefix}${i+1}`,n),
      ...edges.map(edge => new Pair(key,`${ratio?'ratio':'difference'} ${n}`,...edge))]);
  })));
return [shape,new EqualSum(...blobs),
  new Var('R','Black shape ratios',3),new Var('D','White shape differences',4),
  new AllDifferent('VR1','VR2','VR3'),new AllDifferent('VD1','VD2','VD3','VD4'),
  ...families(black,'VR',true),...families(white,'VD',false)];
