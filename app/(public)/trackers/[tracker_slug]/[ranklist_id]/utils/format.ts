export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function formatName(name: string) {
  return truncateText(name, 20);
}

export function formatUsername(username: string) {
  return truncateText(username, 15);
}
