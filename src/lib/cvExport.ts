import type { CvVersionContent } from '../types/cvVersions';

export const buildCvPlainText = (content: CvVersionContent) => {
  const lines = [
    content.headline,
    '',
    content.summary,
    '',
    'Top Skills',
    ...content.top_skills.map((skill) => `• ${skill}`),
    '',
    'Impact Highlights',
    ...content.bullets.map((bullet) => `• ${bullet}`)
  ];

  return lines.filter((line) => line !== '').join('\n');
};

export const buildCvHtml = (content: CvVersionContent) => {
  const escape = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const skills = content.top_skills.map((skill) => `<li>${escape(skill)}</li>`).join('');
  const bullets = content.bullets.map((bullet) => `<li>${escape(bullet)}</li>`).join('');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${escape(content.headline)}</title>
  </head>
  <body>
    <h1>${escape(content.headline)}</h1>
    <p>${escape(content.summary)}</p>
    <h2>Top Skills</h2>
    <ul>${skills}</ul>
    <h2>Impact Highlights</h2>
    <ul>${bullets}</ul>
  </body>
</html>`;
};
