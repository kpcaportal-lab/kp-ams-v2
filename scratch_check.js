
const fs = require('fs');

const content = fs.readFileSync('src/app/(dashboard)/admin/page.tsx', 'utf8');

let curly = 0;
let round = 0;
let square = 0;

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '{') curly++;
    if (char === '}') curly--;
    if (char === '(') round++;
    if (char === ')') round--;
    if (char === '[') square++;
    if (char === ']') square--;
}

console.log(`Curly: ${curly}`);
console.log(`Round: ${round}`);
console.log(`Square: ${square}`);
