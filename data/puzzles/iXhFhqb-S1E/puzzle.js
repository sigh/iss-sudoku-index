// Title: Ramor
// Author: Aeon
// Video: https://www.youtube.com/watch?v=iXhFhqb-S1E
// Source: https://sudokupad.app/ec2ufpzyp1

// Normal Sudoku; one tripler in every row, column and box, with repeated
// tripler digits allowed. Non-circle triplers triple values in sums;
// circle triplers instead count three times. Arrows and cages sum values.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const digits = [1,2,3,4,5,6,7,8,9];
// Circles drawn as overlays and underlays; coincident circles count once.
const circles = ['R3C3','R7C3','R3C9','R6C6','R2C7','R7C8','R8C1','R8C8','R3C1','R1C2','R2C5'];
const circleSet = new Set(circles);
// Drawn arrow bulbs followed by every shaft cell traversed.
const arrows = [
 ['R3C3','R4C2','R4C1','R5C1'],
 ['R7C3','R8C4','R8C5','R9C6'],
 ['R3C9','R4C8','R5C8'],
 ['R3C9','R3C8','R3C7','R3C6'],
 ['R6C6','R6C5','R5C4','R4C5'],
 ['R2C7','R2C6','R1C6','R1C5'],
 ['R7C8','R6C8','R6C9','R5C9'],
 ['R8C1','R9C2','R8C2','R7C2'],
 ['R8C8','R8C7','R7C6'],
 ['R3C1','R3C2','R2C3','R1C3']
];
// Four dashed cages and their printed corner totals.
const cages = [[23,['R1C4','R1C5','R1C6']], [6,['R4C1','R5C1','R6C1']], [24,['R4C9','R5C9','R6C9']], [29,['R9C4','R9C5','R9C6']]];
const flags = graph.makeOverlay('VT');
const used = [...new Set([...arrows.flatMap(a => a.slice(1)), ...cages.flatMap(c => c[1])])].filter(c => !circleSet.has(c));
const extra = graph.makeOverlay('VE', used);
// Flag 1 is ordinary and flag 2 is tripler. Extra holds zero or the digit,
// so a coefficient of two adds the two extra copies to an ordinary digit.
const extraRules = used.map(c => new Or([
 new And([new Given(flags.at(c),1), new Given(extra.at(c),0)]),
 new And([new Given(flags.at(c),2), new SameValues(2,c,extra.at(c))])
]));
const terms = cells => [...cells, ...cells.filter(c => !circleSet.has(c)).map(c => [extra.at(c),2])];
// Each tally is 0 for a different digit, 1 for an ordinary matching circle,
// or 3 for a tripler matching circle. A present digit requires its own tally.
const tallies = digits.map(d => {
 const tally = graph.makeOverlay('VC'+String.fromCharCode(64+d), circles);
 return [tally.toVar('weighted count of '+d),
 ...circles.map(c => new Or([
  new And([new Given(c,...digits.filter(v => v!==d)),new Given(tally.at(c),0)]),
  new And([new Given(c,d),new Given(flags.at(c),1),new Given(tally.at(c),1)]),
  new And([new Given(c,d),new Given(flags.at(c),2),new Given(tally.at(c),3)])
 ])),
 new Or([new And(circles.map(c => new Given(c,...digits.filter(v => v!==d)))),new Sum(d,...tally.cells())])];
}).flat();
return [shape,
 graph.makeReplicate(new Given('R1C1',...digits)),
 flags.toVar('tripler flags'), flags.makeReplicate(new Given(flags.at('R1C1'),1,2)),
 ...graph.rowsColumnsBoxes().map(h => new ContainExact('2',...flags.at(h))),
 extra.toVar('extra digit copies'), ...extraRules,
 ...arrows.map(([bulb,...arm]) => new Sum(0,[bulb,-1],...terms(arm))),
 ...cages.map(([total,cells]) => new Sum(total,...terms(cells))),
 ...tallies
];
