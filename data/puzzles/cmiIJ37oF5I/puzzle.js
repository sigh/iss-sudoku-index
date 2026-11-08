// Title: Feeding Friendsy: One Tough Cookie
// Author: blackjackfitz
// Video: https://www.youtube.com/watch?v=cmiIJ37oF5I
// Source: https://sudokupad.app/pn630t41aj

// Encode Somedoku, connected nine-cell regions, cookie counts and chip relations.
const shape = new Shape('9x9', '1-10', 'Raw');
const cells = Array.from({length:81}, (_,i)=>makeCellId(Math.floor(i/9)+1,i%9+1));
const label = c => 'VL'+(cells.indexOf(c)+1);
// Cookie glyphs, dark/white chips, cranberry circles, and caramel wall edges.
const cookies = ["R1C2", "R4C4", "R4C5", "R3C8", "R8C9", "R6C9", "R8C6", "R9C7", "R7C2"];
const black = [["R5C5", "R5C6"], ["R4C6", "R4C7"], ["R5C7", "R6C7"], ["R5C8", "R5C9"]];
const white = [["R6C2", "R6C3"], ["R7C4", "R7C5"], ["R8C5", "R9C5"], ["R6C8", "R7C8"], ["R4C8", "R4C9"], ["R3C5", "R3C6"]];
const cranberries = [["R8C4", "R9C4"], ["R4C5", "R5C5"], ["R2C7", "R3C7"]];
const walls = [["R1C1", "R1C2"], ["R2C2", "R2C3"], ["R2C2", "R3C2"], ["R3C1", "R3C2"], ["R4C1", "R4C2"], ["R4C2", "R4C3"], ["R3C3", "R4C3"], ["R3C3", "R3C4"], ["R4C4", "R5C4"], ["R5C3", "R5C4"], ["R4C6", "R5C6"], ["R4C7", "R5C7"], ["R6C8", "R6C9"], ["R8C6", "R9C6"], ["R2C6", "R3C6"], ["R1C5", "R2C5"]];
// Cookies cannot share a region: their values count that region's distinct
// digits and are all different. Nine cookies and nine regions anchor all labels.
const prefixCell = (prefix,c)=>prefix+(cells.indexOf(c)+1);
const pc = (region,digit)=>'VB'+((region-1)*9+digit);
const presenceSpec = (region,digit)=>NFA.encodeSpec({
 startState:{phase:0},
 transition:(s,v)=>s.phase===0?{phase:1,want:v===2,seen:false}:s.phase===1?{phase:2,want:s.want,seen:s.seen,inside:v===region}:{phase:1,want:s.want,seen:s.seen||(s.inside&&v===digit)},
 accept:s=>s.phase===1&&s.want===s.seen
},shape);
// Port codes 1..8 follow the eight compass directions; 9 means no port.
// Rank digits 1..10 store decimal digits 0..9; each used edge increments rank.
const dirs=[[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]];
const none=9;
const p=c=>prefixCell('VP',c), q=c=>prefixCell('VQ',c);
const hi=c=>prefixCell('VH',c), lo=c=>prefixCell('VJ',c);
const graph=cellGraph('9x9');
const numbers=[1,2,3,4,5,6,7,8,9];
const wallKeys=new Set([...walls,...cranberries].map(pair=>pair.slice().sort().join('|')));
// All caramel vertices block diagonals, including the isolated rounded pillars.
const pillars=[[8,8],[1,8],[2,7],[3,7],[6,7],[3,4],[5,4],[8,4],[5,2],[7,2],[6,1],[3,2],[8,1]];
const corners=new Set(pillars.map(x=>x.join(',')));
for(const [a,b] of walls){const A=parseCellId(a),B=parseCellId(b);
 if(A.row===B.row){const c=Math.min(A.col,B.col); corners.add([A.row-1,c].join(','));corners.add([A.row,c].join(','));}
 else {const r=Math.min(A.row,B.row);corners.add([r,A.col-1].join(','));corners.add([r,A.col].join(','));}}
const neighbour=(c,d)=>{const x=parseCellId(c),[dr,dc]=dirs[d-1];return graph.kingNeighbours(c).find(b=>{const y=parseCellId(b);return y.row-x.row===dr&&y.col-x.col===dc;});};
const legal=(a,d)=>{const b=neighbour(a,d);if(!b)return false;
 const [dr,dc]=dirs[d-1];if(!dr||!dc)return !wallKeys.has([a,b].sort().join('|'));
 const A=parseCellId(a),B=parseCellId(b);
 return !corners.has([Math.min(A.row,B.row),Math.min(A.col,B.col)].join(','));};
const start='R9C9',end='R9C8';
const portKey=Pair.fnToKey((a,b)=>a!==b,shape);
const localSpec=NFA.encodeSpec({startState:{phase:0},transition:(s,v)=>{
 if(s.phase===0)return {phase:1,p:v};
 if(s.phase===1)return (s.p===9&&v===9)||(s.p!==9&&v!==9&&s.p!==v)?{phase:2,off:v===9}:undefined;
 if(s.phase===2)return {phase:3,off:s.off,h:v};
 return s.phase===3&&(!s.off||(s.h===1&&v===1))?{phase:4}:undefined;
},accept:s=>s.phase===4,maxDepth:4},shape);
const edgeSpec=(d,opp)=>NFA.encodeSpec({startState:{phase:0},transition:(s,v)=>{
 if(s.phase===0)return {phase:1,on:v===d};
 if(s.phase===1)return (v===opp)===s.on?{phase:2,on:s.on}:undefined;
 if(s.phase===2)return {phase:3,on:s.on,h:v};
 if(s.phase===3)return {phase:4,on:s.on,a:(s.h-1)*10+v-1};
 if(s.phase===4)return {phase:5,on:s.on,a:s.a,h:v};
 return s.phase===5&&(!s.on||(s.h-1)*10+v-1===s.a+1)?{phase:6}:undefined;
},accept:s=>s.phase===6,maxDepth:6},shape);
// Read two cookie digits, retain their ordering, then compare their route ranks.
const orderSpec=NFA.encodeSpec({startState:{phase:0},transition:(s,v)=>{
 if(s.phase===0)return {phase:1,a:v};
 if(s.phase===1)return {phase:2,less:s.a<v};
 if(s.phase===2)return {phase:3,less:s.less,h:v};
 if(s.phase===3)return {phase:4,less:s.less,a:(s.h-1)*10+v-1};
 if(s.phase===4)return {phase:5,less:s.less,a:s.a,h:v};
 return s.phase===5&&(((s.h-1)*10+v-1>s.a)===s.less)?{phase:6}:undefined;
},accept:s=>s.phase===6,maxDepth:6},shape);
const edges=cells.flatMap(a=>dirs.flatMap((_,i)=>legal(a,i+1)?[{a,b:neighbour(a,i+1),d:i+1,opp:(i+4)%8+1}]:[]));
const crossingKey=Pair.fnToKey((a,b)=>!(a===4&&b===6),shape);
const crossConstraints=Array.from({length:8},(_,r)=>Array.from({length:8},(_,c)=>{
 const nw=makeCellId(r+1,c+1),ne=makeCellId(r+1,c+2),sw=makeCellId(r+2,c+1),se=makeCellId(r+2,c+2);
 // Either orientation on each of the two diagonals counts as using it.
 const key=Pair.fnToKey((a,b)=>!(a===4&&b===6),shape);
 const reverse=Pair.fnToKey((a,b)=>!(a===4&&b===2),shape);
 const reverse2=Pair.fnToKey((a,b)=>!(a===8&&b===6),shape);
 const reverseBoth=Pair.fnToKey((a,b)=>!(a===8&&b===2),shape);
 return [new Pair(key,'No diagonal crossing',q(nw),q(ne)),new Pair(reverse,'No diagonal crossing',q(nw),q(sw)),new Pair(reverse2,'No diagonal crossing',q(se),q(ne)),new Pair(reverseBoth,'No diagonal crossing',q(se),q(sw))];
})).flat(2);
return [shape,
 graph.makeReplicate(new Given('R1C1',1,2,3,4,5,6,7,8,9)),
 new Var('L','Cookie-anchored regions','9x9'),
 graph.makeOverlay('VL').makeReplicate(new Given('VL1',1,2,3,4,5,6,7,8,9)),
 ...cookies.map((c,i)=>new Given(label(c),i+1)),
 ...cookies.map((_,i)=>new ConnectedValues('VL',i+1,9)),
 new Var('S','Somedoku counts',18),
 ...Array.from({length:18},(_,i)=>new Given('VS'+(i+1),i%9+1)),
 ...numbers.map(r=>new CountDistinct('VS'+r,...numbers.map(c=>makeCellId(r,c)))),
 ...numbers.map(c=>new CountDistinct('VS'+(c+9),...numbers.map(r=>makeCellId(r,c)))),
 new Var('B','Region digit presence',81),
 graph.makeOverlay('VB').makeReplicate(new Given('VB1',1,2)),
 ...cookies.flatMap((_,i)=>Array.from({length:9},(_,j)=>new NFA(presenceSpec(i+1,j+1),'Region digit presence',pc(i+1,j+1),...cells.flatMap(c=>[label(c),c])))),
 ...cookies.map((c,i)=>new Sum(9,...Array.from({length:9},(_,j)=>pc(i+1,j+1)),[c,-1])),
 new AllDifferent(...cookies),
 ...walls.map(([a,b])=>new AllDifferent(label(a),label(b))),
 ...black.flatMap(([a,b])=>[new BlackDot(a,b),new SameValues(2,label(a),label(b))]),
 ...white.flatMap(([a,b])=>[new WhiteDot(a,b),new AllDifferent(label(a),label(b))]),
 ...cranberries.map(([a,b])=>new Pair(Pair.fnToKey((x,y)=>x%2!==y%2,shape),'Opposite parity',a,b)),
 ...['VP','VQ','VH','VJ'].map(prefix=>new Var(prefix.slice(1),'Directed route state','9x9')),
 ...cells.flatMap(c=>[new Given(p(c),...(c===start?[9]:[...dirs.flatMap((_,i)=>legal(c,i+1)?[i+1]:[]),9])),new Given(q(c),...(c===end?[9]:[...dirs.flatMap((_,i)=>legal(c,i+1)?[i+1]:[]),9]))]),
 ...cells.filter(c=>c!==start&&c!==end).map(c=>new NFA(localSpec,'Route off or internal',p(c),q(c),hi(c),lo(c))),
 new Given(hi(start),1),new Given(lo(start),1),
 new Given(q(start),...dirs.flatMap((_,i)=>legal(start,i+1)?[i+1]:[])),
 new Given(p(end),...dirs.flatMap((_,i)=>legal(end,i+1)?[i+1]:[])),
 ...cookies.map(c=>new Given(q(c),1,2,3,4,5,6,7,8)),
 ...edges.map(({a,b,d,opp})=>new NFA(edgeSpec(d,opp),'Directed step rank',q(a),p(b),hi(a),lo(a),hi(b),lo(b))),
 graph.makeOverlay('VQ').makeReplicate(crossConstraints.slice(0,4),cells.filter(c=>{const x=parseCellId(c);return x.row<9&&x.col<9;}).map(q)),
 ...cookies.flatMap((a,i)=>cookies.slice(i+1).map(b=>new NFA(orderSpec,'Cookies in increasing order',a,b,hi(a),lo(a),hi(b),lo(b)))),
];
