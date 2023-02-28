import { TSESTree } from '@typescript-eslint/types';
import { AST, SourceCode } from 'eslint';
import { Node } from 'estree';

const whitespaceRegexp = /[^\S\n\r]/;

export function getWholeRange(
  sourceCode: SourceCode,
  node: TSESTree.Node,
): { withWhitespace: AST.Range; withoutWhitespace: AST.Range } {
  const text = sourceCode.getText();
  const tokenBefore = sourceCode.getTokenBefore(node as Node);
  const tokenAfter = sourceCode.getTokenAfter(node as Node);
  const commentsBefore = sourceCode.getCommentsBefore(node as Node).reverse() as TSESTree.Comment[];
  const commentsAfter = sourceCode.getCommentsAfter(node as Node) as TSESTree.Comment[];
  const minStartLine = tokenBefore ? tokenBefore.loc.end.line : 0;
  const maxEndLine = tokenAfter ? tokenAfter.loc.start.line : Infinity;
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
  /** turn this thing into a regexp match */
  const textEnd = end;
  while (end < text.length && whitespaceRegexp.test(text[end])) {
    end += 1;
  }
  if (text.startsWith('\n', end) || text.startsWith('\r\n', end)) {
    end += text[end] === '\n' ? 1 : 2;
  }
  /** up to here */
  return { withWhitespace: [start, end], withoutWhitespace: [start, textEnd] };
}

export function getLocFromRange(sourceCode: SourceCode, range: AST.Range): AST.SourceLocation {
  return {
    start: sourceCode.getLocFromIndex(range[0]),
    end: sourceCode.getLocFromIndex(range[1]),
  };
}

export function getTextFromRange(sourceCode: SourceCode, range: AST.Range): string {
  const text = sourceCode.getText();
  return text.slice(range[0], range[1]);
}
