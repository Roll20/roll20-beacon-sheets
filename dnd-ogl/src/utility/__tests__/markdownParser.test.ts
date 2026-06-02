import { describe, it, expect } from 'vitest';
import { parseSimpleMarkdown } from '../markdownParser';

describe('parseSimpleMarkdown', () => {
  it('should return empty string for null input', () => {
    expect(parseSimpleMarkdown(null)).toBe('');
  });

  it('should return empty string for undefined input', () => {
    expect(parseSimpleMarkdown(undefined)).toBe('');
  });

  it('should return empty string for empty string input', () => {
    expect(parseSimpleMarkdown('')).toBe('');
  });

  it('should escape HTML special characters', () => {
    const input = `<script>alert("test")</script> & 'quotes'`;
    const result = parseSimpleMarkdown(input);
    expect(result).toContain('&lt;script&gt;');
    expect(result).toContain('&quot;test&quot;');
    expect(result).toContain('&amp;');
    expect(result).toContain('&#39;quotes&#39;');
  });

  it('should convert simple text to paragraph', () => {
    expect(parseSimpleMarkdown('Hello world')).toBe('<p>Hello world</p>');
  });

  it('should convert multiple lines to multiple paragraphs', () => {
    const input = 'Line 1\nLine 2\nLine 3';
    const result = parseSimpleMarkdown(input);
    expect(result).toBe('<p>Line 1</p><p>Line 2</p><p>Line 3</p>');
  });

  it('should convert list items with dash', () => {
    const input = '- Item 1\n- Item 2\n- Item 3';
    const result = parseSimpleMarkdown(input);
    expect(result).toBe('<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>');
  });

  it('should convert list items with asterisk', () => {
    const input = '* Item 1\n* Item 2';
    const result = parseSimpleMarkdown(input);
    expect(result).toBe('<ul><li>Item 1</li><li>Item 2</li></ul>');
  });

  it('should convert tables with headers', () => {
    const input = 'Name | Age\nJohn | 30\nJane | 25';
    const result = parseSimpleMarkdown(input);
    expect(result).toContain('<table>');
    expect(result).toContain('<th>Name</th><th>Age</th>');
    expect(result).toContain('<td>John</td><td>30</td>');
    expect(result).toContain('<td>Jane</td><td>25</td>');
    expect(result).toContain('</table>');
  });

  it('should convert bold text with double asterisks', () => {
    const result = parseSimpleMarkdown('This is **bold** text');
    expect(result).toBe('<p>This is <strong>bold</strong> text</p>');
  });

  it('should convert bold text with double underscores', () => {
    const result = parseSimpleMarkdown('This is __bold__ text');
    expect(result).toBe('<p>This is <strong>bold</strong> text</p>');
  });

  it('should convert italic text with single asterisk', () => {
    const result = parseSimpleMarkdown('This is *italic* text');
    expect(result).toBe('<p>This is <em>italic</em> text</p>');
  });

  it('should convert italic text with single underscore', () => {
    const result = parseSimpleMarkdown('This is _italic_ text');
    expect(result).toBe('<p>This is <em>italic</em> text</p>');
  });

  it('should handle mixed bold and italic formatting', () => {
    const result = parseSimpleMarkdown('**bold** and *italic* and __bold__ and _italic_');
    expect(result).toContain('<strong>bold</strong>');
    expect(result).toContain('<em>italic</em>');
  });

  it('should close list before starting table', () => {
    const input = '- Item 1\n- Item 2\nCol1 | Col2';
    const result = parseSimpleMarkdown(input);
    expect(result).toContain('</ul>');
    expect(result).toContain('<table>');
  });

  it('should close table before starting list', () => {
    const input = 'A | B\nC | D\n- List item';
    const result = parseSimpleMarkdown(input);
    expect(result).toContain('</table>');
    expect(result).toContain('<ul>');
  });

  it('should close list before paragraph', () => {
    const input = '- Item 1\n- Item 2\nRegular text';
    const result = parseSimpleMarkdown(input);
    expect(result).toContain('</ul>');
    expect(result).toContain('<p>Regular text</p>');
  });

  it('should handle empty lines gracefully', () => {
    const input = 'Text 1\n\nText 2';
    const result = parseSimpleMarkdown(input);
    expect(result).toBe('<p>Text 1</p><p>Text 2</p>');
  });

  it('should escape HTML in list items', () => {
    const input = '- <script>alert("xss")</script>';
    const result = parseSimpleMarkdown(input);
    expect(result).toContain('&lt;script&gt;');
    expect(result).not.toContain('<script>');
  });

  it('should escape HTML in table cells', () => {
    const input = '<tag> | <another>';
    const result = parseSimpleMarkdown(input);
    expect(result).toContain('&lt;tag&gt;');
    expect(result).toContain('&lt;another&gt;');
  });

  it('should handle bold formatting in list items', () => {
    const input = '- This is **bold** in list\n- This is __also bold__';
    const result = parseSimpleMarkdown(input);
    expect(result).toContain('<li>This is <strong>bold</strong> in list</li>');
    expect(result).toContain('<li>This is <strong>also bold</strong></li>');
  });

  it('should handle italic formatting in list items', () => {
    const input = '- This is *italic* in list\n- This is _also italic_';
    const result = parseSimpleMarkdown(input);
    expect(result).toContain('<li>This is <em>italic</em> in list</li>');
    expect(result).toContain('<li>This is <em>also italic</em></li>');
  });

  it('should handle formatting in table cells', () => {
    const input = '**Name** | *Status*\nJohn | Active';
    const result = parseSimpleMarkdown(input);
    expect(result).toContain('<strong>Name</strong>');
    expect(result).toContain('<em>Status</em>');
  });

  it('should handle list items with leading spaces', () => {
    const input = '  - Indented item\n  * Another indented';
    const result = parseSimpleMarkdown(input);
    expect(result).toContain('<li>Indented item</li>');
    expect(result).toContain('<li>Another indented</li>');
  });

  it('should handle unclosed formatting markers', () => {
    const result = parseSimpleMarkdown('This has **unclosed bold');
    expect(result).toBe('<p>This has **unclosed bold</p>');
  });

  it('should handle nested formatting', () => {
    const result = parseSimpleMarkdown('Text with **bold and *italic* inside**');
    expect(result).toContain('<strong>bold and <em>italic</em> inside</strong>');
  });

  it('should handle complex mixed content', () => {
    const input = '**Title**\n- Item 1\n- Item 2\nCol1 | Col2\nData1 | Data2\nRegular text';
    const result = parseSimpleMarkdown(input);
    expect(result).toContain('<strong>Title</strong>');
    expect(result).toContain('<ul>');
    expect(result).toContain('<table>');
    expect(result).toContain('<p>Regular text</p>');
  });
});
