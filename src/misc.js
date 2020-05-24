export const getPhraseTagText = (tag, tagTitles) => {
  return tagTitles[tag] || capitalizeFirstLetter(tag.replace(/-/g, " "));
};

export const capitalizeFirstLetter = (string) => {
  if (!string) return "";
  return string[0].toUpperCase() + string.slice(1, string.length);
};

export const capitalizeLetters = (string) => {
  if (!string) return "";
  return string.split(" ").map((word) => capitalizeFirstLetter(word));
};
