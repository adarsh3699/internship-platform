const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/kisho/Desktop/internship-platform/frontend/js';
fs.readdirSync(dir).forEach(file => {
  if (!file.endsWith('.js')) return;
  const p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/\`/g, '`').replace(/\\$/g, '$');
  fs.writeFileSync(p, content);
});
console.log('Done cleaning up backslashes.');
