export function extractLastReturnFromJSX(code: string) {
  // Regex to capture the return statement excluding the outer parentheses
  const returnRegex = /return\s*\(\s*([\s\S]+?)\s*\)\s*;/g;

  let match;
  let lastMatch = null;
  while ((match = returnRegex.exec(code)) !== null) {
    lastMatch = match[1].trim(); // Keep only the JSX part (ignoring the return keyword and parentheses)
  }

  if (lastMatch) {
    // Remove primitive container tags around the JSX (e.g., <div></div>, <span></span>)
    const trimContainerRegex = /^(<\w+.*?>)([\s\S]*)(<\/\w+>)$/;
    const containerMatch = lastMatch.match(trimContainerRegex);

    if (containerMatch) {
      return containerMatch[2].trim(); // Return the content without the outer container
    }
  }

  return lastMatch; // Return the last match as is if no container tags are found
}
