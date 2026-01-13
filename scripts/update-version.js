const fs = require('fs');
const path = require('path');

// 1. Get the new version from package.json
const packageJson = require('../package.json');
const newVersion = packageJson.version;

console.log(`Bumping to version ${newVersion}...`);

// Define files to update
const filesToUpdate = [
    {
        path: '../templates/scholaricons.css',
        // Regex to find "Version: x.x.x" or insert it at top
        regex: /\/\*\s*Icon Font: scholaricons[\s\S]*?\*\//,
        replace: (match) => {
             // If version exists, replace it
             if (/Version: \d+\.\d+\.\d+/.test(match)) {
                 return match.replace(/Version: \d+\.\d+\.\d+/, `Version: ${newVersion}`);
             }
             // Otherwise append it
             return match.replace(/Icon Font: scholaricons/, `Icon Font: scholaricons\n  Version: ${newVersion}`);
        },
        // Fallback if no header found: prepend one
        fallback: `/*\n  Icon Font: scholaricons\n  Version: ${newVersion}\n*/\n`
    },
    // We can add other files here like README.md if needed
];

filesToUpdate.forEach(file => {
    const filePath = path.join(__dirname, file.path);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;

        if (file.regex.test(content)) {
            content = content.replace(file.regex, file.replace);
            updated = true;
        } else if (file.fallback) {
            content = file.fallback + content;
            updated = true;
        }

        if (updated) {
            fs.writeFileSync(filePath, content);
            console.log(`Updated ${file.path}`);
        } else {
            console.log(`No changes needed for ${file.path}`);
        }
    } else {
        console.warn(`File not found: ${file.path}`);
    }
});
