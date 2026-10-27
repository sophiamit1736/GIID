const fs = require('fs');
const path = require('path');
const { normalizeGroupToFACPLevel } = require('./config/facpLevelMapper');

const file = path.join(__dirname, 'data', 'giid_students_seed.json');
const rows = JSON.parse(fs.readFileSync(file, 'utf8').replace(/:\s*NaN\s*([,}])/g, ': null$1'));
const counts = {};
const unmapped = [];
for (let i = 0; i < rows.length; i += 1) {
  const row = rows[i];
  const level = normalizeGroupToFACPLevel(row.group || row.GROUP, row.age || row.Age);
  counts[level || 'UNMAPPED'] = (counts[level || 'UNMAPPED'] || 0) + 1;
  if (!level) unmapped.push({ row: i + 1, name: row.name, group: row.group, age: row.age });
}
console.log(JSON.stringify({ total: rows.length, counts, unmapped }, null, 2));
if (rows.length !== 101 || unmapped.length) process.exit(1);
