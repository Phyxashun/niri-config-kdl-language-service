import * as path from 'path';
import * as vscode from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

const HOVER_DOCS: Record<string, string> = {
	'match': '**match** — Specifies matching rules for window conditions.\n\nCommon fields:\n- `app-id`: Regex for the application ID.\n- `title`: Regex for the window title.',
	'app-id': '**app-id** — Matches the window\'s application ID. Usually the desktop app name.',
	'title': '**title** — Matches the window\'s title (regex accepted).',
	'window-rule': '**window-rule** — Defines window behavior. May contain nested match blocks.',
	'true': '`true` — Boolean literal (on/enabled).',
	'#true': '`#true` — Boolean literal (on/enabled).',
	'false': '`false` — Boolean literal (off/disabled).',
	'#false': '`#false` — Boolean literal (off/disabled).',
	'nan': '`nan` — Not a number literal.',
	'#nan': '`#nan` — Not a number literal.'
};

export function activate(context: vscode.ExtensionContext) {
	const selector = [
		{ language: 'kdl', scheme: 'file' },
		{ language: 'niri-kdl', scheme: 'file' },
	];

	// The server is implemented in node
	const serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);

	// The debug options for the server
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	// Register hover provider
	context.subscriptions.push(
		vscode.languages.registerHoverProvider(selector, {
			provideHover(document, position) {
				const text = document.getText(document.getWordRangeAtPosition(position, /[#\w.-]+/));
				const key = text.startsWith('#') ? text.slice(1) : text;
				const docs = HOVER_DOCS[key];
				if (!docs) { return null; }

				const markdown = new vscode.MarkdownString(docs);
				markdown.isTrusted = true;
				return new vscode.Hover(markdown);
			},
		})
	);

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for KDL documents
		documentSelector: [
			{ scheme: 'file', language: 'kdl' },
			{ scheme: 'untitled', language: 'kdl' }
		],
		synchronize: {
			// Notify the server about file changes to '.kdl' files contained in the workspace
			fileEvents: vscode.workspace.createFileSystemWatcher('**/*.kdl')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'kdlLanguageServer',
		'KDL Language Server',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}