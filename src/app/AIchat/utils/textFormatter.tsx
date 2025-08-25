import React from 'react';

interface TextPart {
  text: string;
  type: 'normal' | 'bold' | 'heading1' | 'heading2' | 'heading3';
}

export const parseFormattedText = (text: string): TextPart[] => {
  const parts: TextPart[] = [];
  const lines = text.split('\n');

  lines.forEach((rawLine, lineIndex) => {
    const line = rawLine.replace(/-/g, ' '); // - を空白に置換

    if (lineIndex > 0) {
      parts.push({ text: '\n', type: 'normal' });
    }

    // # 見出し検出
    const h3 = line.match(/^###\s*(.*)$/);
    const h2 = line.match(/^##\s*(.*)$/);
    const h1 = line.match(/^#\s*(.*)$/);
    if (h3) {
      parts.push({ text: h3[1], type: 'heading3' });
      return;
    }
    if (h2) {
      parts.push({ text: h2[1], type: 'heading2' });
      return;
    }
    if (h1) {
      parts.push({ text: h1[1], type: 'heading1' });
      return;
    }

    // ** で囲まれた箇所（濃いネイビー）
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = boldRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: line.slice(lastIndex, match.index), type: 'normal' });
      }
      parts.push({
        text: match[1],
        type: 'bold',
      });
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push({ text: line.slice(lastIndex), type: 'normal' });
    }
  });

  return parts;
};

interface FormattedTextProps {
  text: string;
  className?: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text, className = '' }) => {
  const parts = parseFormattedText(text);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === 'heading1') {
          return (
            <span key={index} className="text-2xl lg:text-3xl font-extrabold text-[#0a1845] block">
              {part.text}
            </span>
          );
        }
        if (part.type === 'heading2') {
          return (
            <span key={index} className="text-xl lg:text-2xl font-bold text-[#0a1845] block">
              {part.text}
            </span>
          );
        }
        if (part.type === 'heading3') {
          return (
            <span key={index} className="text-lg lg:text-xl font-semibold text-[#0a1845] block">
              {part.text}
            </span>
          );
        }
        if (part.type === 'bold') {
          return (
            <span key={index} className="font-semibold text-blue-500">
              {part.text}
            </span>
          );
        }
        if (part.text === '\n') {
          return <br key={index} />;
        }
        return <span key={index}>{part.text}</span>;
      })}
    </span>
  );
};