// Title: Island Hopping
// Author: Hypocaustum
// Video: https://www.youtube.com/watch?v=qjf1ytw0VvY
// Source: https://sudokupad.app/e7kgnmlm76

// Normal Sudoku; nine non-touching connected islands sized by their circled
// digits; connected water with no all-water 2x2; island digits distinct;
// black dots have ratio 1:2 and join cells of the same land/water status.
const shape = new Shape('9x9', '1-10');
const graph = cellGraph('9x9');
const cells = graph.cells();
// Labels 1..9 are island sizes, and 10 is water, so labels have no permutation freedom.
const land = graph.makeOverlay('VL');
// Drawn circles.
const circles = ['R1C1','R9C1','R9C5','R5C6','R7C8','R4C8','R1C7','R4C4','R4C1'];
// Drawn black-dot pairs.
const dots = [['R1C2','R2C2'],['R1C4','R1C3'],['R1C5','R1C6'],
 ['R4C1','R3C1'],['R4C4','R3C4'],['R4C4','R5C4'],['R6C8','R6C9'],
 ['R6C9','R7C9'],['R8C8','R9C8'],['R8C2','R8C1'],['R8C2','R9C2'],
 ['R7C2','R7C3'],['R3C9','R3C8'],['R2C7','R2C6']];
// Neighbouring land cells must name the same island; water separates different labels.
const separationKey = Pair.fnToKey((a,b) => a === 10 || b === 10 || a === b, shape);
// This predicate exempts pairs outside a common island from digit distinctness.
const exemptKey = Pair.fnToKey((a,b) => a === 10 || b === 10 || a !== b, shape);
// Dots require both cells to agree on whether their label denotes water.
const statusKey = Pair.fnToKey((a,b) => (a === 10) === (b === 10), shape);
const separation = [
 ['R1C1','R1C2',9,8], ['R1C1','R2C1',8,9],
 ['R1C1','R2C2',8,8], ['R1C2','R2C1',8,8]
].map(([a,b,rows,cols]) => land.makeReplicate(
 new Pair(separationKey,'Island separation',land.at(a),land.at(b)),
 land.at(cells.filter(c => { const {row,col} = parseCellId(c); return row <= rows && col <= cols; }))));
const distinct = cells.flatMap((a,i) => cells.slice(i+1).map(b =>
 new Or([new Pair(exemptKey, 'Different island or water', land.at(a),land.at(b)),
        new AllDifferent(a,b)])));
const blocks = cells.map(a => graph.block(a,2,2)).filter(Boolean)
 .map(block => new Or(block.map(a => new Given(land.at(a),1,2,3,4,5,6,7,8,9))));
return [shape,
 graph.makeReplicate(new Given('R1C1',1,2,3,4,5,6,7,8,9)),
 land.toVar('Island size or water'),
 new AllDifferent(...circles),
 ...circles.map(a => new SameValues(2,a,land.at(a))),
 ...Array.from({length:9}, (_,i) => new ConnectedValues('VL',i+1,i+1)),
 new ConnectedValues('VL',10),
 ...separation,...blocks,...distinct,
 ...dots.map(([a,b]) => new BlackDot(a,b)),
 ...dots.map(([a,b]) => new Pair(statusKey,'Dot land/water agreement',land.at(a),land.at(b)))
];
