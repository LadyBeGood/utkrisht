
// Global variables
let editor = null;
let compilerInstance = null;

// Initialize CodeMirror editor
function initEditor() {
    const initialState = `// MiniTS with Svelte-style components
    let message: string = "Hello, MiniTS!";
    let counter: number = 0;
    let items: Array<string> = ["Apple", "Banana", "Cherry"];
        let user: Object = {name: "John", age: 25 };

        // Function with type annotations
        function greet(name: string): string {
    return "Hello, " + name + "!";
}

// Conditional statement
if (counter > 0) {
            console.log("Counter is positive");
} else if (counter < 0) {
            console.log("Counter is negative");
} else {
            console.log("Counter is zero");
}

        // For loop
        for (let i: number = 0; i < 5; i++) {
            console.log("Iteration:", i);
}

// Array operations
items.forEach((item: string) => {
            console.log("Item:", item);
});

        // Svelte-style component
        function Counter() {
            let count: number = 0;

        function increment() {
            count = count + 1;
        update();
    }

        function decrement() {
            count = count - 1;
        update();
    }

        // Reactive update (Svelte-style)
        function update() {
            console.log("Count updated:", count);
    }

        // Template (Svelte-style)
        return \`
        <div class="counter">
            <h2>Counter: {count}</h2>
            <button onclick="increment()">+</button>
            <button onclick="decrement()">-</button>
            <p>Items: {items.length}</p>
        </div>
        \`;
}

        // Render the component
        document.body.innerHTML = Counter();`;

    editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
        mode: "javascript/typescript",
        theme: "dracula",
        lineNumbers: true,
        lineWrapping: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        extraKeys: {
            "Ctrl-Space": "autocomplete",
            "Tab": function (cm) {
                if (cm.somethingSelected()) {
                    cm.indentSelection("add");
                } else {
                    cm.replaceSelection("  ", "end");
                }
            }
        },
        hintOptions: {
            hint: CodeMirror.hint.javascript,
            completeSingle: false
        }
    });

    editor.setValue(initialState);
}

// Tab switching
window.switchTab = function (tabName) {
    // Update tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Activate selected tab
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
};

// Fullscreen preview
window.togglePreviewFullscreen = function () {
    const overlay = document.getElementById('fullscreenPreview');
    const iframe = document.getElementById('fullscreenIframe');
    const preview = document.getElementById('preview');

    if (overlay.classList.contains('active')) {
        overlay.classList.remove('active');
    } else {
        overlay.classList.add('active');
        iframe.srcdoc = preview.srcdoc;
    }
};

// Compiler implementation
class MiniTSCompiler {
    constructor() {
        this.tokens = [];
        this.ast = null;
        this.jsCode = '';
        this.consoleOutput = [];
    }

    log(type, message) {
        this.consoleOutput.push({ type, message, timestamp: new Date().toLocaleTimeString() });
        this.updateConsole();
    }

    updateConsole() {
        const consoleDiv = document.getElementById('console');
        consoleDiv.innerHTML = this.consoleOutput.map(entry =>
            `<div class="${entry.type}">[${entry.timestamp}] ${entry.message}</div>`
        ).join('');
    }

    tokenize(code) {
        this.log('info', 'Starting tokenization...');

        const tokenSpec = [
            // Whitespace
            [/^\s+/, null],

            // Comments
            [/^\/\/.*/, 'COMMENT'],
            [/^\/\*[\s\S]*?\*\//, 'COMMENT'],

            // Keywords
            [/^\blet\b/, 'LET'],
            [/^\bfunction\b/, 'FUNCTION'],
            [/^\breturn\b/, 'RETURN'],
            [/^\bif\b/, 'IF'],
            [/^\belse\b/, 'ELSE'],
            [/^\bfor\b/, 'FOR'],
            [/^\bwhile\b/, 'WHILE'],
            [/^\bbreak\b/, 'BREAK'],
            [/^\bcontinue\b/, 'CONTINUE'],
            [/^\btrue\b/, 'BOOLEAN'],
            [/^\bfalse\b/, 'BOOLEAN'],
            [/^\bnull\b/, 'NULL'],
            [/^\bundefined\b/, 'UNDEFINED'],

            // Types
            [/^\bstring\b/, 'TYPE'],
            [/^\bnumber\b/, 'TYPE'],
            [/^\bboolean\b/, 'TYPE'],
            [/^\bArray\b/, 'TYPE'],
            [/^\bObject\b/, 'TYPE'],
            [/^\bMap\b/, 'TYPE'],
            [/^\bSet\b/, 'TYPE'],

            // Identifiers
            [/^[a-zA-Z_$][a-zA-Z0-9_$]*/, 'IDENTIFIER'],

            // Numbers
            [/^\d+(\.\d+)?/, 'NUMBER'],

            // Strings
            [/^"[^"]*"/, 'STRING'],
            [/^'[^']*'/, 'STRING'],
            [/^`[^`]*`/, 'TEMPLATE_STRING'],

            // Operators
            [/^[+\-*/%]/, 'OPERATOR'],
            [/^[=!]=/, 'OPERATOR'],
            [/^[=<>!]=?/, 'OPERATOR'],
            [/^&&|\|\|/, 'OPERATOR'],
            [/^!/, 'OPERATOR'],
            [/^\./, 'DOT'],

            // Punctuation
            [/^[(){ }\[\];,:]/, 'PUNCTUATION'],
            [/^=>/, 'ARROW']
        ];

        let pos = 0;
        this.tokens = [];

        while (pos < code.length) {
            let matched = false;

            for (const [regex, type] of tokenSpec) {
                const match = code.slice(pos).match(regex);

                if (match && type) {
                    this.tokens.push({
                        type,
                        value: match[0],
                        position: pos
                    });
                    pos += match[0].length;
                    matched = true;
                    break;
                } else if (match) {
                    pos += match[0].length;
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                this.log('error', `Unexpected character: ${code[pos]} at position ${pos}`);
                pos++;
            }
        }

        this.log('success', `Tokenization complete. Found ${this.tokens.length} tokens.`);
        this.displayTokens();
        return this.tokens;
    }

    parse(tokens) {
        this.log('info', 'Starting parsing...');

        let current = 0;

        const walk = () => {
            let token = tokens[current];

            if (!token) return null;

            // Variable declaration
            if (token.type === 'LET' && tokens[current + 1]?.type === 'IDENTIFIER') {
                const node = {
                    type: 'VariableDeclaration',
                    identifier: tokens[current + 1].value,
                    valueType: null,
                    init: null
                };

                current += 2; // Skip let and identifier

                // Check for type annotation
                if (tokens[current]?.type === 'PUNCTUATION' && tokens[current].value === ':') {
                    current++; // Skip colon
                    node.valueType = tokens[current]?.value || 'any';
                    current++;
                }

                // Check for assignment
                if (tokens[current]?.value === '=') {
                    current++; // Skip =
                    node.init = walk();
                }

                // Skip semicolon if present
                if (tokens[current]?.value === ';') {
                    current++;
                }

                return node;
            }

            // Function declaration
            if (token.type === 'FUNCTION' && tokens[current + 1]?.type === 'IDENTIFIER') {
                const node = {
                    type: 'FunctionDeclaration',
                    name: tokens[current + 1].value,
                    params: [],
                    returnType: null,
                    body: []
                };

                current += 2; // Skip function and name

                // Skip opening parenthesis
                if (tokens[current]?.value === '(') {
                    current++;
                }

                // Parse parameters
                while (tokens[current] && tokens[current].value !== ')') {
                    if (tokens[current].type === 'IDENTIFIER') {
                        const param = {
                            name: tokens[current].value,
                            paramType: null
                        };
                        current++;

                        // Check for type annotation
                        if (tokens[current]?.value === ':') {
                            current++; // Skip colon
                            param.paramType = tokens[current]?.value || 'any';
                            current++;
                        }

                        node.params.push(param);

                        // Skip comma
                        if (tokens[current]?.value === ',') {
                            current++;
                        }
                    }
                }

                // Skip closing parenthesis
                if (tokens[current]?.value === ')') {
                    current++;
                }

                // Check for return type
                if (tokens[current]?.value === ':') {
                    current++; // Skip colon
                    node.returnType = tokens[current]?.value || 'any';
                    current++;
                }

                // Skip opening brace
                if (tokens[current]?.value === '{') {
                    current++;
                }

                // Parse function body
                while (tokens[current] && tokens[current].value !== '}') {
                    const statement = walk();
                    if (statement) {
                        node.body.push(statement);
                    }
                }

                // Skip closing brace
                if (tokens[current]?.value === '}') {
                    current++;
                }

                return node;
            }

            // Literals
            if (token.type === 'NUMBER') {
                current++;
                return {
                    type: 'NumberLiteral',
                    value: parseFloat(token.value)
                };
            }

            if (token.type === 'STRING' || token.type === 'TEMPLATE_STRING') {
                current++;
                return {
                    type: 'StringLiteral',
                    value: token.value.slice(1, -1),
                    isTemplate: token.type === 'TEMPLATE_STRING'
                };
            }

            if (token.type === 'BOOLEAN') {
                current++;
                return {
                    type: 'BooleanLiteral',
                    value: token.value === 'true'
                };
            }

            // Identifier
            if (token.type === 'IDENTIFIER') {
                current++;
                return {
                    type: 'Identifier',
                    name: token.value
                };
            }

            // If statement
            if (token.type === 'IF') {
                const node = {
                    type: 'IfStatement',
                    test: null,
                    consequent: [],
                    alternate: []
                };

                current++; // Skip if

                // Skip opening parenthesis
                if (tokens[current]?.value === '(') {
                    current++;
                }

                // Parse condition
                node.test = walk();

                // Skip closing parenthesis
                if (tokens[current]?.value === ')') {
                    current++;
                }

                // Parse consequent
                if (tokens[current]?.value === '{') {
                    current++; // Skip opening brace
                    while (tokens[current] && tokens[current].value !== '}') {
                        const statement = walk();
                        if (statement) {
                            node.consequent.push(statement);
                        }
                    }
                    if (tokens[current]?.value === '}') {
                        current++;
                    }
                } else {
                    // Single statement
                    node.consequent.push(walk());
                }

                // Check for else
                if (tokens[current]?.type === 'ELSE') {
                    current++; // Skip else

                    if (tokens[current]?.type === 'IF') {
                        node.alternate = [walk()];
                    } else if (tokens[current]?.value === '{') {
                        current++; // Skip opening brace
                        while (tokens[current] && tokens[current].value !== '}') {
                            const statement = walk();
                            if (statement) {
                                node.alternate.push(statement);
                            }
                        }
                        if (tokens[current]?.value === '}') {
                            current++;
                        }
                    } else {
                        // Single else statement
                        node.alternate.push(walk());
                    }
                }

                return node;
            }

            // For loop
            if (token.type === 'FOR') {
                const node = {
                    type: 'ForStatement',
                    init: null,
                    test: null,
                    update: null,
                    body: []
                };

                current++; // Skip for

                // Skip opening parenthesis
                if (tokens[current]?.value === '(') {
                    current++;
                }

                // Parse initialization
                if (tokens[current]?.type !== ';') {
                    node.init = walk();
                }

                // Skip first semicolon
                if (tokens[current]?.value === ';') {
                    current++;
                }

                // Parse condition
                if (tokens[current]?.value !== ';') {
                    node.test = walk();
                }

                // Skip second semicolon
                if (tokens[current]?.value === ';') {
                    current++;
                }

                // Parse update
                if (tokens[current]?.value !== ')') {
                    node.update = walk();
                }

                // Skip closing parenthesis
                if (tokens[current]?.value === ')') {
                    current++;
                }

                // Parse body
                if (tokens[current]?.value === '{') {
                    current++; // Skip opening brace
                    while (tokens[current] && tokens[current].value !== '}') {
                        const statement = walk();
                        if (statement) {
                            node.body.push(statement);
                        }
                    }
                    if (tokens[current]?.value === '}') {
                        current++;
                    }
                } else {
                    // Single statement
                    node.body.push(walk());
                }

                return node;
            }

            // Default: advance
            current++;
            return null;
        };

        const ast = {
            type: 'Program',
            body: []
        };

        while (current < tokens.length) {
            const node = walk();
            if (node) {
                ast.body.push(node);
            }
        }

        this.ast = ast;
        this.log('success', 'Parsing complete. AST generated.');
        this.displayAST();
        return ast;
    }

    compileToJS(ast) {
        this.log('info', 'Starting compilation to JavaScript...');

        const generate = (node) => {
            if (!node) return '';

            switch (node.type) {
                case 'Program':
                    return node.body.map(generate).join('\n');

                case 'VariableDeclaration':
                    let js = `let ${node.identifier}`;
                    if (node.init) {
                        js += ` = ${generate(node.init)}`;
                    }
                    return js + ';';

                case 'FunctionDeclaration':
                    const params = node.params.map(p => p.name).join(', ');
                    let func = `function ${node.name}(${params}) {\n`;
                    func += node.body.map(generate).map(line => '  ' + line).join('\n');
                    func += '\n}';
                    return func;

                case 'IfStatement':
                    let ifJS = `if (${generate(node.test)}) {\n`;
                    ifJS += node.consequent.map(generate).map(line => '  ' + line).join('\n');
                    ifJS += '\n}';
                    if (node.alternate && node.alternate.length > 0) {
                        ifJS += ' else {\n';
                        ifJS += node.alternate.map(generate).map(line => '  ' + line).join('\n');
                        ifJS += '\n}';
                    }
                    return ifJS;

                case 'ForStatement':
                    let forJS = `for (`;
                    forJS += node.init ? generate(node.init).replace(/;$/, '') : '';
                    forJS += `; ${node.test ? generate(node.test) : ''}; `;
                    forJS += node.update ? generate(node.update).replace(/;$/, '') : '';
                    forJS += `) {\n`;
                    forJS += node.body.map(generate).map(line => '  ' + line).join('\n');
                    forJS += '\n}';
                    return forJS;

                case 'NumberLiteral':
                case 'BooleanLiteral':
                    return String(node.value);

                case 'StringLiteral':
                    if (node.isTemplate) {
                        return '`' + node.value.replace(/\{/g, '${') + '`';
                    }
                    return `"${node.value}"`;

                case 'Identifier':
                    return node.name;

                default:
                    return '';
            }
        };

        this.jsCode = generate(ast);

        // Add basic runtime for Svelte-style templates
        const runtime = `
            // Template processor for Svelte-style templates
            function processTemplate(template, context) {
    return template.replace(/\\\\{([^}]+)\\\\}/g, (match, expr) => {
        try {
            with(context) {
                return eval(expr);
            }
        } catch (e) {
                console.error('Template error:', e);
            return match;
        }
    });
}

            // Console wrapper for better logging
            const console = {
                log: (...args) => {
        const output = args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            try {
                window.parent.postMessage({ type: 'console', message: output }, '*');
        } catch(e) { }
    },
    error: (...args) => {
        const output = args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            try {
                window.parent.postMessage({ type: 'error', message: output }, '*');
        } catch(e) { }
    },
    warn: (...args) => {
        const output = args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            try {
                window.parent.postMessage({ type: 'warning', message: output }, '*');
        } catch(e) { }
    }
};

            // Start execution
            try {
                ${this.jsCode}
} catch (error) {
                console.error('Execution error:', error.message);
}
            `;

        this.jsCode = runtime;
        this.log('success', 'Compilation to JavaScript complete.');
        this.displayJS();
        return this.jsCode;
    }

    displayTokens() {
        const tokensDiv = document.getElementById('tokens');
        if (this.tokens.length === 0) {
            tokensDiv.innerHTML = '<div class="info">No tokens generated yet.</div>';
            return;
        }

        const tokenHTML = this.tokens.map(token => {
            let cssClass = 'token-' + token.type.toLowerCase();
            let displayValue = token.value;

            // Escape HTML in the value
            displayValue = displayValue
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');

            // Handle newlines and tabs
            displayValue = displayValue.replace(/\n/g, '\\n').replace(/\t/g, '\\t');

            return `<div class="${cssClass}">${token.type}: "${displayValue}" (pos: ${token.position})</div>`;
        }).join('');
        tokensDiv.innerHTML = tokenHTML;
    }

    displayAST() {
        const astDiv = document.getElementById('ast');
        astDiv.innerHTML = this.formatJSON(this.ast);
    }

    displayJS() {
        const jsDiv = document.getElementById('js');
        // Escape HTML in JS code
        let escapedCode = this.jsCode
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        jsDiv.innerHTML = '<div class="token-comment">// Compiled JavaScript:</div>\n' + escapedCode;
    }

    formatJSON(obj) {
        const json = JSON.stringify(obj, null, 2);
        return json
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g, match => {
                let cls = 'json-number';
                if (/:$/.test(match)) {
                    cls = 'json-key';
                } else if (/^"/.test(match)) {
                    if (/:$/.test(match.slice(0, -1))) {
                        cls = 'json-key';
                    } else {
                        cls = 'json-string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'json-boolean';
                } else if (/null/.test(match)) {
                    cls = 'json-null';
                }
                return `<span class="${cls}">${match}</span>`;
            });
    }
}

// Handle console messages from iframe
window.addEventListener('message', (event) => {
    if (event.data && (event.data.type === 'console' || event.data.type === 'error' || event.data.type === 'warning')) {
        if (compilerInstance) {
            compilerInstance.log(event.data.type, event.data.message);
        }
    }
});

// Main run function
window.runCode = function () {
    compilerInstance = new MiniTSCompiler();

    // Clear previous output
    compilerInstance.consoleOutput = [];

    // Get code from editor
    let code = editor.getValue();

    compilerInstance.log('info', 'Starting compilation pipeline...');

    try {
        // Step 1: Tokenization
        const tokens = compilerInstance.tokenize(code);

        // Step 2: Parsing
        const ast = compilerInstance.parse(tokens);

        // Step 3: Compilation
        const jsCode = compilerInstance.compileToJS(ast);

        // Step 4: Execution in preview
        const preview = document.getElementById('preview');
        const fullscreenIframe = document.getElementById('fullscreenIframe');

        // Escape the </script> tag in the JavaScript code
        const escapedJSCode = jsCode.replaceAll(/<\/script > /gi, '<\\/script > ');

        const html = `
            <!DOCTYPE html>
            <html>

            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        margin: 0;
                        background: #f5f5f5;
                    }

                    .counter {
                        background: white;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        text-align: center;
                    }

                    button {
                        margin: 5px;
                        padding: 10px 20px;
                        background: #646cff;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    }

                    button:hover {
                        background: #535bf2;
                    }

                    .error {
                        color: #ff6b6b;
                        padding: 10px;
                        background: #fff5f5;
                        border-radius: 5px;
                        margin: 10px 0;
                    }
                </style>
            </head>

            <body>
                <div id="app"></div>
                <script>
        ${escapedJSCode}

    </script>
</body >
</html > `;

        preview.srcdoc = html;
        fullscreenIframe.srcdoc = html;

        compilerInstance.log('success', 'Code executed successfully in preview.');
        switchTab('console');

    } catch (error) {
        compilerInstance.log('error', `Compilation failed: ${error.message}`);
        console.error('Compiler error:', error);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initEditor();

    // Run initial example after a short delay
    setTimeout(() => {
        runCode();
    }, 500);
});
