const fs = require('fs');
const path = require('path');
const pagesDir = path.join(process.cwd(), 'resources/js/Pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx') && f !== 'Home.jsx');

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace react-router-dom with @inertiajs/react
  content = content.replace(/import\s+\{\s*Link\s*\}\s+from\s+['"]react-router-dom['"];?/g, 'import { Link } from "@inertiajs/react";');
  
  // Replace <Link to= with <Link href=
  content = content.replace(/<Link([^>]+)to=/g, '<Link$1href=');
  
  // Add useContext and LangContext if not present
  if (!content.includes('LangContext')) {
    content = content.replace(/import AppLayout(.*)/g, 'import AppLayout, { LangContext } from "../Layouts/AppLayout";');
    if (!content.includes('import AppLayout')) {
        content = "import AppLayout, { LangContext } from '../Layouts/AppLayout';\n" + content;
    }
  }

  if (!content.includes('useContext(')) {
    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]react['"];/g, (match, p1) => {
        if (!p1.includes('useContext')) {
            return `import { ${p1}, useContext } from "react";`;
        }
        return match;
    });
    // what if react is not imported at all?
    if (!content.includes('import { useContext }') && !content.includes('import React')) {
        content = "import { useContext } from 'react';\n" + content;
    }
  }

  // Find export default function Name({ lang }) or similar
  content = content.replace(/export default function ([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*\{/g, (match, name, args) => {
    return match + `\n  const { lang } = useContext(LangContext);\n`;
  });
  
  // Remove { lang } from args if it exists
  content = content.replace(/export default function ([a-zA-Z0-9_]+)\s*\(\{\s*lang\s*\}\)\s*\{/, 'export default function $1() {');

  // append layout to end of file
  const layoutStr = `\n$1.layout = page => <AppLayout children={page} />;\n`;
  const nameMatch = content.match(/export default function ([a-zA-Z0-9_]+)/);
  if (nameMatch && !content.includes(nameMatch[1] + '.layout')) {
    content += layoutStr.replace('$1', nameMatch[1]);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + file);
}
