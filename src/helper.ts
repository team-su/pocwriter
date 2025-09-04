import * as fs from "fs";
import ts from "typescript";

interface PocData {
  category: string;
  tool: string;
  name: string;
  body: string;
  description: string;
  prefix: string;
  language: string;
  textarea: string;
}

interface CodeSnippet {
  scope: string;
  prefix: string;
  body: string[];
  description: string;
}

interface SnippetFile {
  [key: string]: CodeSnippet;
}

function main(): number {
  console.log("Start processin the issues");
  let args = process.argv.slice(2);
  console.debug(`command: node-ts ./helper.ts ${args}`);
  if (args.length != 1) {
    console.error("Usage: pnpm issue-helper file.yaml");
    return 1;
  }
  let filename = args[0];

  let content = fs.readFileSync(filename).toString();
  console.debug("Read file content:");
  console.debug(content);
  let pocObj: PocData = JSON.parse(content);
  if (
    !(
      pocObj.category &&
      pocObj.tool &&
      pocObj.name &&
      pocObj.body &&
      pocObj.description &&
      pocObj.prefix &&
      pocObj.language
    )
  ) {
    console.error(
      "Error, read bad friend info json, missing category tool name body description prefix language textarea"
    );
    return 2;
  }

  let targetFile = `./src/${pocObj.category}/${pocObj.tool}.json`;
  if (!fs.existsSync(targetFile)) {
    console.error(`Error, target file ${targetFile} not exists, creating`);
    if (!fs.existsSync(`./src/${pocObj.category}`)) {
      console.error(
        `Error, target directory ./src/${pocObj.category} already exists, please check.`
      );
      fs.mkdirSync(`./src/${pocObj.category}`, { recursive: true });
      console.info(`Created directory ./src/${pocObj.category}`);
    }
    fs.writeFileSync(targetFile, "{}");
    console.info(`Created empty target file ${targetFile}`);
  }

  let currentObj = fs.readFileSync(targetFile).toString();
  let snippetObj: SnippetFile = currentObj ? JSON.parse(currentObj) : {};
  let newName = `[poc writer][${pocObj.category}] ${pocObj.name}`;
  snippetObj[newName] = {
    scope: pocObj.language,
    prefix: pocObj.prefix,
    body: pocObj.body.split("\n"),
    description: pocObj.description,
  };
  console.info("Updated source code with: \n", snippetObj);
  fs.writeFileSync(targetFile, JSON.stringify(snippetObj, null, 2));
  console.log(`Successfully updated poc ${pocObj.name} into ${targetFile}`);

  console.log("check if it is included in package.json");
  let packageContent = fs.readFileSync("./package.json").toString();
  let packageObj = JSON.parse(packageContent);
  let contributes = packageObj["contributes"]["snippets"];

  if (!Array.isArray(contributes)) {
    console.error("Error, package.json snippets is not an array");
    return 3;
  }

  if (contributes.findIndex((item: any) => item.path === targetFile) === -1) {
    console.warn(`Warning, poc ${pocObj.name} is not included in package.json`);
    contributes.push({
      language: pocObj.language,
      path: targetFile,
    });
    packageObj["contributes"]["snippets"] = contributes;
    fs.writeFileSync("./package.json", JSON.stringify(packageObj, null, 2));
  } else {
    console.log(`poc ${pocObj.name} is already included in package.json, skipped`);
  }

  console.log("All done, enjoy your poc writer!");
  return 0;
}

process.exit(main());
