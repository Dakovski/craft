import { FORM_VALUE_MAX_LENGTH } from "../constants/form";
import type { FormValidation } from "../types/form";
import normalizeText from "./normalizeText";

/**
 * Highlights specific text ranges within a given root HTML element based on validation criteria.
 *
 * This function uses the CSS Highlight API to visually mark text that is either too long
 * or duplicated within the provided `rootElement`. It also updates the form validation state
 * to reflect the presence of these issues.
 *
 * @param rootElement - The root HTML element within which text nodes are analyzed.
 * @param formValidation - The current form validation state, containing flags for validation issues.
 * @returns An updated form validation state.
 *
 * Validation Criteria:
 * - Text is considered "too long" if its normalized length exceeds FORM_VALUE_MAX_LENGTH characters.
 * - Text is considered "duplicate" if it appears more than once within the `rootElement`.
 *
 * Highlights:
 * - Text ranges that are too long are highlighted with the key `"too-long"`.
 * - Text ranges that are duplicates are highlighted with the key `"duplicate"`.
 *
 * Notes:
 * - If the CSS Highlight API is not supported (`CSS.highlights` is undefined), the function exits early.
 * - The HighlightRegistry is cleared before applying new highlights to ensure no stale highlights remain.
 */
const highligh = (
  rootElement: HTMLElement,
  formValidation: FormValidation
): FormValidation => {
  if (!CSS.highlights) {
    return formValidation;
  }

  // Find all text nodes in the element and search within these text nodes.
  const treeWalker = document.createTreeWalker(
    rootElement,
    NodeFilter.SHOW_TEXT
  );
  const allTextNodes: Node[] = [];
  const allTextContent: string[] = [];
  let currentNode = treeWalker.nextNode();

  while (currentNode) {
    allTextNodes.push(currentNode);
    allTextContent.push(normalizeText(currentNode.textContent));
    currentNode = treeWalker.nextNode();
  }

  // Clear the HighlightRegistry to remove the
  // previous search results.
  CSS.highlights.clear();

  // Iterate over all text nodes and find matches.
  const rangesTooLong = allTextNodes
    .map((el) => {
      return { el, text: normalizeText(el.textContent) };
    })
    .map(({ text = "", el }) => {
      if (text.trim().length <= FORM_VALUE_MAX_LENGTH) {
        return [];
      }

      const range = new Range();

      range.setStart(el, FORM_VALUE_MAX_LENGTH);
      range.setEnd(el, text.length);

      return [range];
    })
    .flat();

  const rangesDuplicate = allTextNodes
    .map((el) => {
      return { el, text: normalizeText(el.textContent) };
    })
    .map(({ text, el }) => {
      const instancesOfText = allTextContent.filter(
        (currentText) => currentText === text
      );

      if (instancesOfText.length <= 1) {
        return [];
      }

      const range = new Range();

      range.setStart(el, 0);
      range.setEnd(el, text.length);

      return [range];
    })
    .flat();

  // Create a Highlight object for the ranges.
  const highlightTooLong = new Highlight(...rangesTooLong);
  const highlightDuplicate = new Highlight(...rangesDuplicate);

  // Register the Highlight object in the registry.
  CSS.highlights.set("too-long", highlightTooLong);
  CSS.highlights.set("duplicate", highlightDuplicate);

  const newValidation = { ...formValidation };

  newValidation.hasDuplicates = rangesDuplicate.length > 1;
  newValidation.hasTooLong = rangesTooLong.length > 0;

  return newValidation;
};

export default highligh;
