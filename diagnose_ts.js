
const ts = require('typescript');

const fileName = 'src/app/(dashboard)/admin/page.tsx';
const program = ts.createProgram([fileName], {
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    esModuleInterop: true,
    skipLibCheck: true
});

const diagnostics = ts.getPreEmitDiagnostics(program);

diagnostics.forEach(diagnostic => {
    if (diagnostic.file && diagnostic.file.fileName.includes('admin/page.tsx')) {
        const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    }
});
