/* eslint-disable @typescript-eslint/no-loop-func */
import clipboard from 'clipboardy';
import escapeStringRegexp from 'escape-string-regexp';
import * as fs from 'fs';

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

    const manifestData = JSON.parse(data) as ManifestData;
    const contentScripts = manifestData.content_scripts;
    const combinedMatches: Record<string, { js: string[]; css: string[]; }> = {};

    let output = '';

    for (const script of contentScripts) {
      const matches = script.matches;
      const excludes = script.exclude_matches;
      const jsFiles = script.js ?? [];
      const cssFiles = script.css ?? [];

      let combinedMatchesStr = matches.map(m => `href.match(/${urlToRegex(m)}/)`).join(' || ');
      combinedMatchesStr = `(${combinedMatchesStr})`;
      // Add the exclude_matches to the combinedMatchesStr
      if (excludes) {
        combinedMatchesStr += ` && !(${excludes.map(m => `href.match(/${urlToRegex(m)}/)`).join(' || ')})`;
      }
      if (!combinedMatches[combinedMatchesStr]) {
        combinedMatches[combinedMatchesStr] = { js: [], css: [] };
      }
      combinedMatches[combinedMatchesStr]?.js.push(...jsFiles);
      combinedMatches[combinedMatchesStr]?.css.push(...cssFiles);
    }

    for (const [match, { js, css }] of Object.entries(combinedMatches)) {
      const uniqueJsFiles = Array.from(new Set(js));
      const uniqueCssFiles = Array.from(new Set(css));

      if (uniqueJsFiles.length === 0 && uniqueCssFiles.length === 0) {
        continue;
      }

      output += `if (${match}) {\n`;
      uniqueJsFiles.forEach((jsFile) => {
        output += `    scripts.push('${jsFile}');\n`;
      });
      uniqueCssFiles.forEach((cssFile) => {
        output += `    scripts.push('${cssFile}');\n`;
      });
      output += '}\n\n';
    }

    output = output.trimEnd();

    // Copy text to clipboard
    clipboard.writeSync(output);

    console.log('Copied to clipboard.');
  });
}

convertToJs();
