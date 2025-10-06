const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
const convertLink = (rawLink: string): string => {
  if (!rawLink.includes(':')) return '';
  const link = `https://app.roll20.net/compendium/AtR/${capitalizeFirst(rawLink.trim().replace(/\s*:\s*/g, ':'))}`;
  const baseLabel = rawLink.split(':')[1].split('|')[0].trim();
  const label = baseLabel.includes('|') ? baseLabel.split('|')[1].trim() : baseLabel;
  return `<a class="compendium-link" href="#" data-compendium-link="${link}">${label}</a>`;
};
export function parseSimpleMarkdown(text: string | null | undefined): string {
  if (!text) {
    return '';
  }

  const escapeHTML = (str: string) =>
    str.replace(
      /[&<>'"]/g,
      (tag) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;',
        }[tag] || tag)
    );

  const lines = text.split('\n');
  let html = '';
  let inList = false;

  lines.forEach((line) => {
    const isListItem = line.match(/^\s*[-*]\s+(.*)/);
    
    if (isListItem) {
      const itemText = escapeHTML(isListItem[1].trim());
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${itemText}</li>`;
    } else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      const paragraphText = escapeHTML(line.trim());
      if (paragraphText) {
          html += `<p>${paragraphText}</p>`;
      }
    }
  });

  if (inList) {
    html += '</ul>';
  }

  
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  html = html.replace(/\[(.*?)\]/g, (match, p1) => convertLink(p1));

  return html;
}