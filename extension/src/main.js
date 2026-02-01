import * as vscode from "vscode";

export function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand("utkrisht.compile", async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage("No active editor");
                return;
            }

            const inputUri = editor.document.uri;

            // Read input file
            const data = await vscode.workspace.fs.readFile(inputUri);

            // Get parent folder
            const folderUri = vscode.Uri.joinPath(inputUri, "..");

            // Create output file URI
            const outputUri = vscode.Uri.joinPath(folderUri, "out.uki");

            // Write output file
            await vscode.workspace.fs.writeFile(outputUri, data);

            vscode.window.showInformationMessage("Compiled to out.uki");
        })
    );
}
// 
export function deactivate() { }
