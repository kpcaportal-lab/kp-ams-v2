const fs = require('fs');
let content = fs.readFileSync('src/app/(dashboard)/assignments/page.tsx', 'utf8');
content = content.replace('"  const kpiCards = [', '  const kpiCards = [');
fs.writeFileSync('src/app/(dashboard)/assignments/page.tsx', content);
