import * as fs from 'fs';
import escapeStringRegexp from 'escape-string-regexp';

interface ContentScript {
    matches: string[];
    exclude_matches?: string[];
    js?: string[];
    css?: string[];
}

interface ManifestData {
    content_scripts: ContentScript[];
}

function urlToRegex(url: string): string {
    return `^${escapeStringRegexp(url).replace(/\\\*/g, '.*').replace(/\//g, '\\/')}$`;
}

function convertToJs(): void {
    fs.readFile('AugmentedSteam/dist/prod.chrome/manifest.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the manifest file:', err);
            return;
        }

        const manifestData: ManifestData = JSON.parse(data);
        const contentScripts = manifestData.content_scripts;
        const combinedMatches: { [key: string]: { js: string[]; css: string[] } } = {};

        for (const script of contentScripts) {
            const matches = script.matches;
            const excludes = script.exclude_matches;
            const jsFiles = script.js || [];
            const cssFiles = script.css || [];

            let combinedMatchesStr = matches.map(m => `href.match(/${urlToRegex(m)}/)`).join(' || ');
            combinedMatchesStr = `(${combinedMatchesStr})`;
            // Add the exclude_matches to the combinedMatchesStr
            if (script.exclude_matches) {
                combinedMatchesStr += ` && !(${excludes.map(m => `href.match("${urlToRegex(m)}")`).join(' || ')})`;
            }
            if (!combinedMatches[combinedMatchesStr]) {
                combinedMatches[combinedMatchesStr] = { js: [], css: [] };
            }
            combinedMatches[combinedMatchesStr].js.push(...jsFiles);
            combinedMatches[combinedMatchesStr].css.push(...cssFiles);
        }

        for (const match in combinedMatches) {
            const files = combinedMatches[match];
            const uniqueJsFiles = Array.from(new Set(files.js));
            const uniqueCssFiles = Array.from(new Set(files.css));

            if (uniqueJsFiles.length === 0 && uniqueCssFiles.length === 0) {
                continue;
            }

            console.log(`if (${match}) {`);
            uniqueJsFiles.forEach(jsFile => {
                console.log(`    scripts.push("${jsFile}");`);
            });
            uniqueCssFiles.forEach(cssFile => {
                console.log(`    scripts.push("${cssFile}");`);
            });
            console.log('}\n');
        }
    });
}

convertToJs();