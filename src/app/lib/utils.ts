// Utility function to remove HTML tags from text
export const removeHtmlTags = (text: string): string => {
  if (!text) return "";
  return text.replace(/<[^>]*>/g, "");
};

// Utility function to replace <br> tags with line breaks
export const formatSynopsis = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/<br\s*\/?>/gi, "\n") // Replace <br> tags with new lines
    .replace(/<[^>]*>/g, "") // Remove all other HTML tags
    .trim();
};
