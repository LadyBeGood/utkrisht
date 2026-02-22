// Local imports
import { createCompiler } from "../../compiler/compiler.js"
import { createLexer, lex } from "../../compiler/lexer.js"



// ACE SETTINGS
const editor = ace.edit("editor");
editor.setValue(`
# Checks if a number is prime or not
is-prime number ~ {
    when number < 2
        exit wrong

    loop 2..<number with i
        when remainder number, i = 0
            exit wrong 

    exit right
}

write is-prime 117


`, 0)
editor.clearSelection(); // Deselects everything
editor.setTheme("ace/theme/dracula");
editor.getSession().setMode("ace/mode/utkrisht");
editor.setShowPrintMargin(false);


// COMPILATION
const tabButtons = document.querySelectorAll("button[data-tab]")
for (const tabButton of tabButtons) {
    tabButton.addEventListener("click", function () {
        document.querySelector('button.active').classList.remove('active');
        document.querySelector(".tab.active").classList.remove("active");

        tabButton.classList.add("active");
        const tab = document.querySelector("#" + tabButton.dataset.tab);
        tab.classList.add("active")
    })
}


const tokensTabButton = document.querySelector("button[data-tab='tokens']");
const tokensTab = document.querySelector(".tab#tokens")
tokensTabButton.addEventListener("click", function () {
    const source = editor.getValue();
    const compiler = createCompiler(source, /*isErrorTolerant*/ true);
    const lexer = createLexer(source);
    const tokens = lex(compiler, lexer);

    tokensTab.innerHTML = stringyTokens(tokens)

    if (compiler.diagnostics !== undefined) {
        document.querySelector("#console").innerHTML = createDiagnosticMessage(compiler.diagnostics, source);
    }
})


function stringyTokens(tokens) {
    const result = []

    for (const token of tokens) {
        const isSpecial = ["Indent", "EndOfFile", "Dedent", "NewLine"].includes(token.type);

        if (isSpecial) {
            result.push(`<div class="token ${token.type.toLowerCase()}">`);
        } else {
            result.push("<div class='token'>")
        }
        
        result.push("<div class='name'>")
        result.push(token.type)
        
        
        if (!isSpecial) {
            result.push(" " + '"' + token.lexeme + '"')
        }
        result.push("</div>")

        result.push("<div class='line'>" + token.line + "</div>")
        result.push("</div>")
    }

    return result.join("")
}

function createDiagnosticMessage(diagnostics, source) {
    const lines = source.split(/\r?\n/);
    const result = [];

    // Helper to escape HTML characters so < and > don't break the display
    const escapeHTML = (str) => str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    for (const diagnostic of diagnostics) {
        if (diagnostic.type === "Error") {
            // If line 7 is the error, it is index 6 in the array.
            const lineIdx = diagnostic.line - 1;

            result.push(`<b style="color: #ff5555;">ERROR: ${escapeHTML(diagnostic.message)}</b>\n`);

            const start = Math.max(0, lineIdx - 1);
            const end = Math.min(lines.length - 1, lineIdx + 1);
            const maxLabelWidth = (end + 1).toString().length;

            for (let i = start; i <= end; i++) {
                const lineNum = (i + 1).toString().padStart(maxLabelWidth, " ");
                const content = escapeHTML(lines[i]);
                const isError = i === lineIdx;

                const marker = isError ? ">" : " ";
                const lineStyle = isError ? 'style="background: rgba(255,0,0,0.1); display: block;"' : '';

                result.push(`<span ${lineStyle}>${marker} ${lineNum} | ${content}</span>`);
            }

            result.push("\n\n\n"); // Gap between errors
        }
    }
    return result.join("");
}