const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/listings/CreateListingForm.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace >{errors.xxx}</p> with >{tErrors(errors.xxx as any) || errors.xxx}</p>
content = content.replace(/>\{errors\.([a-zA-Z_]+)\}<\/p>/g, '>{errors.$1 && (tErrors(errors.$1 as any) || errors.$1)}</p>');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Replaced error variables.');
