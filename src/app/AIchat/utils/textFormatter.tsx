import React from 'react';

interface TextPart {
  text: string;
  type: 'normal' | 'bold' | 'heading';
}

// テキストを解析してフォーマット情報を抽出する関数
export const parseFormattedText = (text: string): TextPart[] => {
  const parts: TextPart[] = [];
  const lines = text.split('\n');

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      // 改行を追加（最初の行以外）
      parts.push({ text: '\n', type: 'normal' });
    }

    // ###で始まる行の処理
    if (line.startsWith('###')) {
      // ###を削除してトリムした内容を取得
      const headingText = line.replace(/^###\s*/, '');
      parts.push({
        text: headingText,
        type: 'heading'
      });
      return;
    }

    // **で囲まれた部分の処理
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(line)) !== null) {
      // **の前のテキスト（通常テキスト）
      if (match.index > lastIndex) {
        parts.push({
          text: line.slice(lastIndex, match.index),
          type: 'normal',
        });
      }

      // **で囲まれたテキスト（太字＋色変更）
      parts.push({
        text: match[1],
        type: 'bold',
      });

      lastIndex = boldRegex.lastIndex;
    }

    // 最後の**の後のテキスト（通常テキスト）
    if (lastIndex < line.length) {
      parts.push({
        text: line.slice(lastIndex),
        type: 'normal',
      });
    }
  });

  return parts;
};

// テキストを適切にレンダリングするコンポーネント
interface FormattedTextProps {
  text: string;
  className?: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text, className = '' }) => {
  const parts = parseFormattedText(text);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === 'heading') {
          return (
            <span
              key={index}
              className="text-xl font-bold text-gray-900 block"
            >
              {part.text}
            </span>
          );
        }

        if (part.type === 'bold') {
          return (
            <span
              key={index}
              className="font-bold text-blue-600"
            >
              {part.text}
            </span>
          );
        }

        // 改行の処理
        if (part.text === '\n') {
          return <br key={index} />;
        }

        return (
          <span key={index}>
            {part.text}
          </span>
        );
      })}
    </span>
  );
};