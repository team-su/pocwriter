import * as vscode from "vscode";

export let logger = vscode.window.createOutputChannel("poc writer", { log: true });

export async function activate(context: vscode.ExtensionContext) {
  logger.info("poc writer is activiated in your vscode!!")
}

export function deactivate() {}
