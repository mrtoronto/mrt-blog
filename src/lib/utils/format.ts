function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

/**
 * Formats lightweight inline markdown (`code`, **bold**, and [links](url))
 * into safe HTML for rendering inside paragraphs and bullets.
 */
export function formatInline(text: string): string {
	const escaped = escapeHtml(text);

	return escaped
		.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
		.replace(
			/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
			'<a href="$2" target="_blank" rel="noopener noreferrer" class="inline-link">$1 ↗</a>'
		)
		.replace(
			/\[([^\]]+)\]\((\/[^\s)]+)\)/g,
			'<a href="$2" class="inline-link">$1 →</a>'
		);
}

interface TokenRule {
	type: string;
	regex: RegExp;
}

function tokenizeWithRules(code: string, rules: TokenRule[]): string {
	let result = '';
	let index = 0;

	while (index < code.length) {
		let matched = false;
		const slice = code.slice(index);

		for (const rule of rules) {
			const match = rule.regex.exec(slice);
			if (match && match.index === 0) {
				const value = match[0];
				if (rule.type === 'plain') {
					result += escapeHtml(value);
				} else {
					result += `<span class="tok-${rule.type}">${escapeHtml(value)}</span>`;
				}
				index += value.length;
				matched = true;
				break;
			}
		}

		if (!matched) {
			result += escapeHtml(code[index]);
			index += 1;
		}
	}

	return result;
}

const jsTsRules: TokenRule[] = [
	{ type: 'comment', regex: /^\/\/[^\n]*/ },
	{ type: 'comment', regex: /^\/\*[\s\S]*?\*\// },
	{ type: 'string', regex: /^'(?:\\.|[^'\\])*'/ },
	{ type: 'string', regex: /^"(?:\\.|[^"\\])*"/ },
	{ type: 'string', regex: /^`(?:\\.|[^`\\])*`/ },
	{
		type: 'keyword',
		regex:
			/^\b(?:import|from|export|default|const|let|var|function|return|if|else|for|while|async|await|interface|type|true|false|null|undefined)\b/
	},
	{ type: 'number', regex: /^\b\d+(?:\.\d+)?\b/ },
	{ type: 'property', regex: /^\b[a-zA-Z_$][\w$]*(?=\s*:)/ },
	{ type: 'function', regex: /^\b[a-zA-Z_$][\w$]*(?=\s*\()/ },
	{ type: 'plain', regex: /^[a-zA-Z_$][\w$]*/ },
	{ type: 'punctuation', regex: /^[{}()[\].,:;?+-=<>|&/]+/ }
];

const bashRules: TokenRule[] = [
	{ type: 'comment', regex: /^#[^\n]*/ },
	{ type: 'string', regex: /^'(?:\\.|[^'\\])*'/ },
	{ type: 'string', regex: /^"(?:\\.|[^"\\])*"/ },
	{ type: 'variable', regex: /^\$(?:\{[a-zA-Z_][\w]*\}|[a-zA-Z_][\w]*)/ },
	{
		type: 'keyword',
		regex: /^\b(?:for|in|do|done|if|then|else|fi|echo|export|source|return)\b/
	},
	{
		type: 'function',
		regex: /^\b(?:curl|gh|dig|npm|git|node|vite|sleep|mkdir|rm|cp|mv)\b/
	},
	{ type: 'flag', regex: /^--?[a-zA-Z0-9_-]+/ },
	{ type: 'number', regex: /^\b\d+(?:\.\d+)*\b/ },
	{ type: 'plain', regex: /^[a-zA-Z_][\w.-]*/ }
];

const yamlRules: TokenRule[] = [
	{ type: 'comment', regex: /^#[^\n]*/ },
	{ type: 'variable', regex: /^\$\{\{[^}]+\}\}/ },
	{ type: 'string', regex: /^'(?:\\.|[^'\\])*'/ },
	{ type: 'string', regex: /^"(?:\\.|[^"\\])*"/ },
	{ type: 'property', regex: /^[a-zA-Z0-9_-]+(?=\s*:)/ },
	{ type: 'keyword', regex: /^\b(?:true|false|null|yes|no)\b/ },
	{ type: 'number', regex: /^\b\d+(?:\.\d+)?\b/ },
	{ type: 'punctuation', regex: /^[-:]+/ }
];

const jsonRules: TokenRule[] = [
	{ type: 'property', regex: /^"(?:\\.|[^"\\])*"(?=\s*:)/ },
	{ type: 'string', regex: /^"(?:\\.|[^"\\])*"/ },
	{ type: 'keyword', regex: /^\b(?:true|false|null)\b/ },
	{ type: 'number', regex: /^\b-?\d+(?:\.\d+)?\b/ },
	{ type: 'punctuation', regex: /^[{}[\]:,]+/ }
];

const pythonRules: TokenRule[] = [
	{ type: 'comment', regex: /^#[^\n]*/ },
	{ type: 'string', regex: /^"""[\s\S]*?"""/ },
	{ type: 'string', regex: /^'''[\s\S]*?'''/ },
	{ type: 'string', regex: /^f?"(?:\\.|[^"\\])*"/ },
	{ type: 'string', regex: /^f?'(?:\\.|[^'\\])*'/ },
	{
		type: 'keyword',
		regex:
			/^\b(?:def|class|return|if|elif|else|for|in|while|with|as|import|from|try|except|finally|raise|continue|break|pass|and|or|not|is|None|True|False|lambda|yield|async|await)\b/
	},
	{
		type: 'property',
		regex: /^\b(?:int|float|str|bool|list|dict|tuple|Any|BaseModel)\b/
	},
	{ type: 'number', regex: /^\b\d+(?:\.\d+)?\b/ },
	{ type: 'function', regex: /^\b[a-zA-Z_][\w]*(?=\s*\()/ },
	{ type: 'plain', regex: /^[a-zA-Z_][\w]*/ },
	{ type: 'punctuation', regex: /^[{}()[\].,:;?+-=<>|&/*]+/ }
];

const markdownRules: TokenRule[] = [
	{ type: 'keyword', regex: /^#{1,6}\s+[^\n]*/ },
	{ type: 'comment', regex: /^>[^\n]*/ },
	{ type: 'string', regex: /^\*\*[^*\n]+\*\*/ },
	{ type: 'property', regex: /^`[^`\n]+`/ },
	{ type: 'flag', regex: /^-\s+\[[ xX]\]/ }
];

export function highlightCode(snippet: string, language: string): string {
	const lang = language.toLowerCase();

	if (lang === 'javascript' || lang === 'js' || lang === 'typescript' || lang === 'ts') {
		return tokenizeWithRules(snippet, jsTsRules);
	}
	if (lang === 'bash' || lang === 'sh' || lang === 'shell' || lang === 'zsh') {
		return tokenizeWithRules(snippet, bashRules);
	}
	if (lang === 'yaml' || lang === 'yml') {
		return tokenizeWithRules(snippet, yamlRules);
	}
	if (lang === 'json') {
		return tokenizeWithRules(snippet, jsonRules);
	}
	if (lang === 'python' || lang === 'py') {
		return tokenizeWithRules(snippet, pythonRules);
	}
	if (lang === 'markdown' || lang === 'md') {
		return tokenizeWithRules(snippet, markdownRules);
	}

	return escapeHtml(snippet);
}
