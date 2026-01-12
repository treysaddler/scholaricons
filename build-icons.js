import { promises as fs } from 'fs';
import { 
    importDirectory, 
    cleanupSVG, 
    runSVGO, 
    parseColors, 
    isEmptyColor 
} from '@iconify/tools';

(async () => {
    // 1. Initialize IconifyJSON with the 'scholaricons' prefix
    // We start with the monochrome directory
    const iconSet = await importDirectory('./svg/monochrome', {
        prefix: 'scholaricons' 
    });

    // 2. Process Monochrome Icons (Convert to currentColor)
    await iconSet.forEach(async (name) => {
        const svg = iconSet.toSVG(name);
        if (!svg) return;
        
        cleanupSVG(svg);
        await parseColors(svg, {
            defaultColor: 'currentColor',
            callback: (attr, colorStr, color) => {
                // Ignore transparent/empty; force everything else to currentColor
                // so they can be styled with CSS 'color'
                return !color || isEmptyColor(color) ? colorStr : 'currentColor';
            },
        });
        runSVGO(svg);
        iconSet.fromSVG(name, svg);
    });

    // 3. Import and Process Color Icons (Preserve Palette)
    try {
        const colorIcons = await importDirectory('./svg/color', {
            prefix: 'scholaricons'
        });

        await colorIcons.forEach(async (name) => {
            const svg = colorIcons.toSVG(name);
            if (!svg) return;
            
            cleanupSVG(svg);
            runSVGO(svg);

            /**
             * Smart Naming:
             * If the user named the file 'google-scholar.svg', we make it 'google-scholar-color'.
             * If the user already named it 'google-scholar-color.svg', we don't double it up.
             */
            const finalName = name.endsWith('-color') ? name : `${name}-color`;
            
            // Add the color icon to the main iconSet with the verified name
            iconSet.fromSVG(finalName, svg);
        });
    } catch (e) {
        console.log('No color icons found in ./svg/color (or directory missing), skipping...');
    }

    // 4. Export the combined set
    const exported = JSON.stringify(iconSet.export(), null, '\t') + '\n';
    
    // Ensure output directory exists
    await fs.mkdir('./dist', { recursive: true });
    await fs.writeFile('./dist/scholaricons.json', exported, 'utf8');

    console.log(`Build complete! Total Scholaricons (Monochrome + Color): ${iconSet.count()}`);
})();