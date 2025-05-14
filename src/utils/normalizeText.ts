/**
 * Normalizes a given text by trimming whitespace and converting it to lowercase.
 * If the input is `null`, an empty string is returned.
 *
 * @param text - The input string to normalize. Can be `null`.
 * @returns The normalized string, or an empty string if the input is `null`.
 */
const normalizeText = (text: string | null) => {
  return text?.trim().toLowerCase() ?? "";
};

export default normalizeText;
