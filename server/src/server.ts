import {
	createConnection,
	TextDocuments,
	Diagnostic,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult,
	DocumentDiagnosticReportKind,
	type DocumentDiagnosticReport,
	Position,
	HoverParams,
	Hover
} from 'vscode-languageserver/node';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';

import { getLanguageModes, LanguageModes } from './languageModes';
import { NIRI_HOVER_DOCS } from './niriHoverDocs';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager
const documents = new TextDocuments<TextDocument>(TextDocument);

// Language modes manager
let languageModes: LanguageModes;

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {
	const capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we fall back using global settings.
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	// Initialize language modes
	languageModes = getLanguageModes();

	// Setup document lifecycle handlers
	documents.onDidClose(e => {
		languageModes.onDocumentRemoved(e.document);
		documentSettings.delete(e.document.uri);
	});

	// Register shutdown handler
	connection.onShutdown(() => {
		languageModes.dispose();
	});

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			// Tell the client that this server supports code completion.
			completionProvider: {
				resolveProvider: true,
				triggerCharacters: ['"', '(', '{', '=', ' ', '#']
			},
			diagnosticProvider: {
				interFileDependencies: false,
				workspaceDiagnostics: false
			},
			hoverProvider: true
		}
	};

	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}

	return result;
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
});

connection.onHover((params: HoverParams): Hover | null => {
	const { textDocument, position } = params;
	const document = documents.get(textDocument.uri);
	if (!document) { return null; }

	// Get the word under the cursor
	const range = getWordRangeAtPosition(document, position, /[#\w.-]+/);
	if (!range) { return null; }

	let key = document.getText(range);
	key = key.startsWith('#') ? key.slice(1) : key;

	const entry = NIRI_HOVER_DOCS[key];
	if (!entry) { return null; }

	// Build the markdown content
	let markdown = `**${key}**\n\n`;
	if (entry.emoji) { markdown += `${entry.emoji} `; }
	markdown += `${entry.description}\n\n`;

	if (entry.example) {
		markdown += '```kdl\n' + entry.example + '\n```\n';
	}

	return {
		contents: {
			kind: 'markdown',
			value: markdown
		},
		range
	};
});



// ============================================================================
// Configuration Management
// ============================================================================

interface KDLSettings {
	maxNumberOfProblems: number;
	validate: boolean;
}

const defaultSettings: KDLSettings = {
	maxNumberOfProblems: 100,
	validate: true
};

let globalSettings: KDLSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings = new Map<string, Thenable<KDLSettings>>();

connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = (change.settings.kdlLanguageServer || defaultSettings) as KDLSettings;
	}
	// Revalidate all open text documents
	documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<KDLSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'kdlLanguageServer'
		});
		documentSettings.set(resource, result);
	}
	return result;
}

// ============================================================================
// Document Validation
// ============================================================================

documents.onDidChangeContent(change => {
	validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
	try {
		const settings = await getDocumentSettings(textDocument.uri);

		if (!settings.validate) {
			// Clear diagnostics if validation is disabled
			connection.sendDiagnostics({ uri: textDocument.uri, diagnostics: [] });
			return;
		}

		const version = textDocument.version;
		const diagnostics: Diagnostic[] = [];

		if (textDocument.languageId === 'kdl') {
			const mode = languageModes.getMode('kdl');
			const latestTextDocument = documents.get(textDocument.uri);

			if (latestTextDocument && latestTextDocument.version === version && mode?.doValidation) {
				// Check no new version has come in after the async op
				const modeDiagnostics = mode.doValidation(latestTextDocument);

				// Limit to maxNumberOfProblems
				diagnostics.push(...modeDiagnostics.slice(0, settings.maxNumberOfProblems));
			}
		}

		// Send the computed diagnostics to VS Code.
		connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });

	} catch (e) {
		connection.console.error(`Error while validating ${textDocument.uri}`);
		connection.console.error(String(e));
	}
}

// ============================================================================
// Pull Diagnostics (LSP 3.17)
// ============================================================================

connection.languages.diagnostics.on(async (params) => {
	const document = documents.get(params.textDocument.uri);
	if (document !== undefined) {
		return {
			kind: DocumentDiagnosticReportKind.Full,
			items: await validateTextDocumentDiagnostics(document)
		} satisfies DocumentDiagnosticReport;
	} else {
		return {
			kind: DocumentDiagnosticReportKind.Full,
			items: []
		} satisfies DocumentDiagnosticReport;
	}
});

async function validateTextDocumentDiagnostics(textDocument: TextDocument): Promise<Diagnostic[]> {
	const settings = await getDocumentSettings(textDocument.uri);

	if (!settings.validate) {
		return [];
	}

	const mode = languageModes.getMode('kdl');
	if (!mode?.doValidation) {
		return [];
	}

	const diagnostics = mode.doValidation(textDocument);
	return diagnostics.slice(0, settings.maxNumberOfProblems);
}

// ============================================================================
// Code Completion
// ============================================================================

connection.onCompletion(
	async (textDocumentPosition: TextDocumentPositionParams): Promise<CompletionItem[]> => {
		const document = documents.get(textDocumentPosition.textDocument.uri);
		if (!document) {
			return [];
		}

		const mode = languageModes.getMode('kdl');
		if (!mode || !mode.doComplete) {
			return [];
		}

		const completionList = mode.doComplete(document, textDocumentPosition.position);
		return completionList.items;
	}
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		// Add detailed documentation based on the item data
		if (item.data?.toString().startsWith('node_')) {
			item.documentation = `KDL configuration node. Use with child blocks: ${item.label} { }`;
		} else if (item.data?.toString().startsWith('flag_')) {
			item.documentation = `Niri toggle flag. When present, this feature is enabled. Comment out or remove to disable.`;
		} else if (item.data?.toString().startsWith('prop_')) {
			item.documentation = `KDL property. Use with assignment: ${item.label}=value`;
		} else if (item.data?.toString().startsWith('action_')) {
			item.documentation = `Niri action command. Can be bound to keys or triggered programmatically.`;
		}

		return item;
	}
);

// ============================================================================
// Document Lifecycle
// ============================================================================

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();

/**
 * Get the word range at a given position in the document based on the provided regex.
 * 
 * @param document 
 * @param position 
 * @param wordRegex 
 * @returns 
 */
function getWordRangeAtPosition(document: TextDocument, position: Position, wordRegex: RegExp) {
	const lineText = document.getText({
		start: { line: position.line, character: 0 },
		end: { line: position.line + 1, character: 0 }
	});

	let start = position.character;
	let end = position.character;

	while (start > 0 && wordRegex.test(lineText[start - 1])) {
		wordRegex.lastIndex = 0;
		start--;
	}

	while (end < lineText.length && wordRegex.test(lineText[end])) {
		wordRegex.lastIndex = 0;
		end++;
	}

	if (start === end) { return undefined; }

	return { start: { line: position.line, character: start }, end: { line: position.line, character: end } };
}
