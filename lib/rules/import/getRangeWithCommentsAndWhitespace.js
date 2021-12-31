"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRangeWithCommentsAndWhitespace = void 0;
const whitespaceRegexp = /[^\S\n\r]/;
function getRangeWithCommentsAndWhitespace(sourceCode, node) {
    const text = sourceCode.getText();
    const tokenBefore = sourceCode.getTokenBefore(node);
    const tokenAfter = sourceCode.getTokenAfter(node);
    const commentsBefore = sourceCode.getCommentsBefore(node).reverse();
    const commentsAfter = sourceCode.getCommentsAfter(node);
    const minStartLine = tokenBefore ? tokenBefore.loc.end.line : 0;
    const maxEndLine = tokenAfter ? tokenAfter.loc.start.line : 0;
    let startLine = node.loc.start.line;
    const endLine = node.loc.end.line;
    let [start, end] = node.range;
    for (const comment of commentsBefore) {
        if (comment.loc.start.line <= minStartLine || comment.loc.end.line < startLine - 1) {
            break;
        }
        startLine = comment.loc.start.line;
        start = sourceCode.getIndexFromLoc(comment.loc.start);
    }
    for (const comment of commentsAfter) {
        if (comment.loc.end.line >= maxEndLine || comment.loc.start.line !== endLine) {
            break;
        }
        end = sourceCode.getIndexFromLoc(comment.loc.end);
    }
    while (end < text.length && whitespaceRegexp.test(text[end])) {
        end += 1;
    }
    if ((end < text.length && text[end] === '\n') ||
        (end + 1 < text.length && text.slice(end, end + 2) === '\r\n')) {
        end += text[end] === '\n' ? 1 : 2;
    }
    return [start, end];
}
exports.getRangeWithCommentsAndWhitespace = getRangeWithCommentsAndWhitespace;
