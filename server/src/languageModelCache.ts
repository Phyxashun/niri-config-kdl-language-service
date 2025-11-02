import { TextDocument } from 'vscode-languageserver-textdocument';

/**
 * Cache interface for parsed language models
 * Provides efficient caching with automatic cleanup of stale entries
 */
export interface LanguageModelCache<T> {
	/**
	 * Get the cached model for a document, or parse and cache it if not present
	 */
	get(document: TextDocument): T;
	
	/**
	 * Remove a document from the cache when it's closed
	 */
	onDocumentRemoved(document: TextDocument): void;
	
	/**
	 * Dispose of the cache and stop cleanup interval
	 */
	dispose(): void;
}

/**
 * Creates a cache for parsed language models with automatic cleanup
 * 
 * @param maxEntries Maximum number of entries to keep in cache
 * @param cleanupIntervalTimeInSec How often to run cleanup (0 = never)
 * @param parse Function to parse a document into the model type T
 * @returns A language model cache instance
 */
export function getLanguageModelCache<T>(
	maxEntries: number,
	cleanupIntervalTimeInSec: number,
	parse: (document: TextDocument) => T
): LanguageModelCache<T> {
	
	// Cache storage: uri -> cached model info
	let languageModels: Record<string, {
		version: number;
		languageId: string;
		cTime: number; // Creation/access time
		languageModel: T;
	}> = {};
	
	let nModels = 0;
	let cleanupInterval: NodeJS.Timeout | undefined = undefined;

	// Setup periodic cleanup if requested
	if (cleanupIntervalTimeInSec > 0) {
		cleanupInterval = setInterval(() => {
			const cutoffTime = Date.now() - cleanupIntervalTimeInSec * 1000;
			const uris = Object.keys(languageModels);
			
			for (const uri of uris) {
				const languageModelInfo = languageModels[uri];
				if (languageModelInfo.cTime < cutoffTime) {
					delete languageModels[uri];
					nModels--;
				}
			}
		}, cleanupIntervalTimeInSec * 1000);
	}

	return {
		get(document: TextDocument): T {
			const version = document.version;
			const languageId = document.languageId;
			const languageModelInfo = languageModels[document.uri];
			
			// Return cached model if it's still valid
			if (languageModelInfo && 
				languageModelInfo.version === version && 
				languageModelInfo.languageId === languageId) {
				
				// Update access time
				languageModelInfo.cTime = Date.now();
				return languageModelInfo.languageModel;
			}
			
			// Parse and cache new model
			const languageModel = parse(document);
			languageModels[document.uri] = {
				languageModel,
				version,
				languageId,
				cTime: Date.now()
			};
			
			if (!languageModelInfo) {
				nModels++;
			}

			// If we've hit max entries, remove the oldest one
			if (nModels === maxEntries) {
				let oldestTime = Number.MAX_VALUE;
				let oldestUri: string | null = null;
				
				for (const uri in languageModels) {
					const info = languageModels[uri];
					if (info.cTime < oldestTime) {
						oldestUri = uri;
						oldestTime = info.cTime;
					}
				}
				
				if (oldestUri) {
					delete languageModels[oldestUri];
					nModels--;
				}
			}
			
			return languageModel;
		},

		onDocumentRemoved(document: TextDocument): void {
			const uri = document.uri;
			if (languageModels[uri]) {
				delete languageModels[uri];
				nModels--;
			}
		},

		dispose(): void {
			if (typeof cleanupInterval !== 'undefined') {
				clearInterval(cleanupInterval);
				cleanupInterval = undefined;
				languageModels = {};
				nModels = 0;
			}
		}
	};
}
