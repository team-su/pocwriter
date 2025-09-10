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

  let allfiles: { [key: string]: boolean } = {};
  for await (const f of files) {
    if (!f.endsWith('.json')) {
      continue;
    }
    console.log("find json snippet file: ",f);
    allfiles["./" + f] = false;
  }

  console.log("Start processing the poc json");

  let packageContent = fs.readFileSync("./package.json").toString();
  let packageObj = JSON.parse(packageContent);
  let contributes = packageObj["contributes"]["snippets"];
  console.log("Current contributes: ", contributes);

  if (!Array.isArray(contributes)) {
    console.error("Error, package.json snippets is not an array");
    return 3;
  }

  for (let item of contributes) {
    if (item.path && allfiles[item.path] === false) {
      allfiles[item.path] = true;
      console.log(`File ${item.path} is included in package.json`);
    }
  }

  for (let f in allfiles) {
    if (allfiles[f] === false) {
      console.warn(`Warning, file ${f} is not included in package.json, adding it`);
      let filecontent = fs.readFileSync(f).toString();
      let fileobj = JSON.parse(filecontent);
      let firstkey = Object.keys(fileobj)[0];
      if (!firstkey) {
        console.error(`Error, file ${f} is empty, skipped`);
        continue;
      }
      let scope = fileobj[firstkey]["scope"];
      if (!scope) {
        scope = "python";
        console.warn(`Warning, file ${f} has no scope, default to python`);
      }
      console.log(`Adding file ${f} with scope ${scope}`);

      contributes.push({
        language: scope,
        path: f,
      });
    }
  }

  // fs.writeFileSync("./package.json", JSON.stringify(packageObj, null, 2));
  console.log("Successfully checked all snippet files");
  console.log("final contributes: ", contributes);
  fs.writeFileSync("./package.json", JSON.stringify(packageObj, null, 2));

  return 0;
}

(async () => {
  let exit = await main();
  process.exit(exit);
})();