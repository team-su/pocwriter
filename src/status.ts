import 'process';
import * as fs from "fs";
import path from 'path';

async function* walk(dir: string): AsyncGenerator<string> {
    for await (const d of await fs.promises.opendir(dir)) {
        const entry = path.join(dir, d.name);
        if (d.isDirectory()) yield* walk(entry);
        else if (d.isFile()) yield entry;
    }
}

async function main(): Promise<number> {
  let files = walk('./src');

  let allfiles: { [key: string]:{
    name: string;
    scope: string;
    prefix: string;
    description: string;
  }[] } = {};
  for await (const f of files) {
    if (!f.endsWith('.json')) {
      continue;
    }
    let filecontent = fs.readFileSync(f).toString();
    let fileobj = JSON.parse(filecontent);
    let keys = Object.keys(fileobj);
    for (let k of keys) {
      let scope = fileobj[k]["scope"];
      if (!scope) {
        scope = "python";
      }
      let description = fileobj[k]["description"];
      if (!description) {
        description = k;
      }
      let prefix = fileobj[k]["prefix"];
      if (!prefix) {
        prefix = k;
      }
      if (!allfiles[f]) {
        allfiles[f] = [];
      }
      allfiles[f].push({
        name: k,
        scope: scope,
        prefix: prefix,
        description: description
      });
    }
  }

  let allSnippets:  { name: string; scope: string; description: string; file: string } []= [];
  for (let [k, v] of Object.entries(allfiles)) {
    for (let item of v) {
      allSnippets.push({...item, file: k});
    }
  }

  console.log(JSON.stringify(allSnippets, null, 2));

  fs.writeFileSync('snippets-full.json', JSON.stringify(allSnippets, null, 2));
  return 0;
}

(async () => {
  let exit = await main();
  process.exit(exit);
})();