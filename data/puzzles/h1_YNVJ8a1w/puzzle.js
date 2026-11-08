// Title: Zipper Lies
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=h1_YNVJ8a1w
// Source: https://sudokupad.app/pk72qqn9hy

// Normal Sudoku applies to digits. Each house has one liar whose value differs
// from its digit; liar digits and liar values each use 1-9 once. Lavender
// zipper pairs sum to their central value; marked X pairs have value sum 10.
// The optional right-hand trackers are not puzzle cells.
const shape = new Shape('9x9');
const graph = cellGraph(shape);
const values = graph.makeOverlay('VV');
const flags = graph.makeOverlay('VF');
const rows = graph.rows();
const houses = graph.rowsColumnsBoxes();
const cells = graph.cells();
const liarDigits = new Var('VD','Liar digits by row',9);
const liarValues = new Var('VL','Liar values by row',9);
const truth = cells.map(c => new Or([
  new And([new Given(flags.at(c), 1), new SameValues(2, c, values.at(c))]),
  new And([new Given(flags.at(c), 2), new AllDifferent(c, values.at(c))])
]));
// One representative per row carries that row's liar digit and value.
const representatives = rows.map((row, i) => new Or(row.map(c => new And([
  new Given(flags.at(c), 2),
  new SameValues(2, c, liarDigits.cell(i+1)),
  new SameValues(2, values.at(c), liarValues.cell(i+1))
]))));
// Drawn lavender paths, in endpoint-to-endpoint order; middle cells bear spots.
const paths = [
 ['R4C2','R3C3','R2C4','R1C5','R1C6','R2C6','R2C7'],
 ['R6C5','R5C5','R4C5','R3C5','R2C5'],
 ['R5C7','R5C8','R5C9'],
 ['R2C8','R2C9','R1C9'],
 ['R7C2','R7C3','R7C4','R7C5','R7C6','R7C7','R7C8','R7C9','R6C9'],
 ['R7C1','R8C2','R8C3','R8C4','R8C5','R8C6','R8C7','R8C8','R8C9'],
 ['R9C1','R9C2','R9C3','R9C4','R9C5','R9C6','R9C7','R9C8','R9C9']
];
const zippers = paths.flatMap(path => {
 const mid = (path.length-1)/2;
 return Array.from({length:mid}, (_,i) => new EqualSum([values.at(path[i]), values.at(path[path.length-1-i])], [values.at(path[mid])]));
});
// X glyphs drawn on shared cell borders.
const crosses = [
 ['R8C1','R9C1'],['R8C9','R9C9'],['R1C5','R2C5'],
 ['R2C7','R2C8'],['R1C7','R2C7'],['R1C2','R2C2'],['R4C4','R5C4']
];
return [shape,
 values.toVar('Real cell values'), flags.toVar('Liar flags: 1 truthful, 2 liar'),
 liarDigits, liarValues,
 ...truth,
 ...houses.map(h => new ContainExact('2', ...flags.at(h))),
 ...representatives,
 new AllDifferent(...rows.map((_,i)=>liarDigits.cell(i+1))),
 new AllDifferent(...rows.map((_,i)=>liarValues.cell(i+1))),
 ...zippers, ...crosses.map(pair => new Sum(10,...values.at(pair)))
];
