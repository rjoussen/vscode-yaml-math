import type { CancellationToken, Hover, Position, TextDocument } from 'vscode';
import { ColorThemeKind, MarkdownString, window, workspace } from 'vscode';
import type { RenderedMarkdown } from './latex-markdown.js';

/** Renders LaTeX math in the Markdown contents of a YAML hover. The contents are changed in place. */
export async function renderMathInHover(
  hover: Hover,
  document: TextDocument,
  _position: Position,
  token: CancellationToken
): Promise<undefined> {
  if (!workspace.getConfiguration('yamlMath', document.uri).get<boolean>('enable', true)) {
    return;
  }
  const contents = hover.contents.filter(
    (content): content is MarkdownString => content instanceof MarkdownString && content.value.includes('$')
  );
  if (!contents.length) {
    return;
  }
  // Evaluated on the first hover with math, so that activation does not initialize MathJax.
  const { createRenderBudget, renderLatexInMarkdown } = await import(/* webpackMode: "eager" */ './latex-markdown.js');
  const color = getEquationColor(window.activeColorTheme.kind);
  const cancelled = (): boolean => token.isCancellationRequested;
  const budget = createRenderBudget();
  const rendered: RenderedMarkdown[] = [];
  for (const content of contents) {
    rendered.push(await renderLatexInMarkdown(content.value, color, true, cancelled, content.supportHtml === true, budget));
  }
  if (token.isCancellationRequested) return;
  contents.forEach((content, index) => {
    content.value = rendered[index].value;
    if (rendered[index].html) content.supportHtml = true;
  });
}

/** Extensions cannot read theme colors, so approximate the hover foreground per theme kind. */
function getEquationColor(kind: ColorThemeKind): string {
  switch (kind) {
    case ColorThemeKind.Light:
      return '#333333';
    case ColorThemeKind.HighContrastLight:
      return '#000000';
    case ColorThemeKind.HighContrast:
      return '#ffffff';
    default:
      return '#cccccc';
  }
}
