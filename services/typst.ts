import JSZip from 'jszip';

const TYPST_TEMPLATE = `
#let book(
  title: "My Ebook",
  author: "Author",
  body
) = {
  set document(title: title, author: author)
  set page(
    paper: "a5",
    margin: (inside: 2.5cm, outside: 1.5cm, y: 2cm),
    numbering: "1",
  )
  set text(
    font: "Linux Libertine", 
    size: 11pt,
    lang: "en"
  )
  set par(
    justify: true, 
    leading: 0.8em,
    first-line-indent: 1.2em,
    spacing: 0.8em
  )
  
  // Headings
  show heading.where(level: 1): it => {
    pagebreak(weak: true)
    v(15%)
    align(center)[
      #text(size: 24pt, weight: "bold", it.body)
    ]
    v(5%)
  }
  
  show heading.where(level: 2): it => {
    v(1.5em)
    text(size: 14pt, weight: "bold", it.body)
    v(0.75em)
  }

  // Image styling
  show figure: it => {
    v(1em)
    align(center)[
      #it.body
      #if it.has("caption") and it.caption != none [
        #v(0.5em)
        #text(size: 9pt, style: "italic", it.caption)
      ]
    ]
    v(1em)
  }
  
  // Block Quotes
  show quote: it => {
    pad(x: 1em, y: 0.5em)[
      #set text(style: "italic")
      #it.body
    ]
  }

  body
}
`;

export const generateTypstZip = async (markdownContent: string): Promise<Blob> => {
  const zip = new JSZip();
  const imgFolder = zip.folder("images");

  // 1. Process Content and Extract Images
  let typstContent = markdownContent;
  let imgCounter = 0;

  // Replace Images: ![alt](src)
  // We need to use a loop to handle async or multiple replaces effectively, 
  // but string.replace with a callback is synchronous.
  typstContent = typstContent.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
    if (src.startsWith('data:image')) {
      // Extract Base64
      const base64Data = src.split(',')[1];
      // Guess extension
      let ext = 'png';
      if (src.includes('image/jpeg')) ext = 'jpg';
      else if (src.includes('image/webp')) ext = 'webp';
      
      const filename = `img_${imgCounter}.${ext}`;
      
      if (imgFolder) {
        imgFolder.file(filename, base64Data, { base64: true });
      }
      
      imgCounter++;
      return `#figure(image("images/${filename}", width: 100%), caption: [${alt}])`;
    } else {
      // External URL - Typst might need internet or might fail if local compiler doesn't support it easily without setup.
      // We keep it as is for now, but wrap in figure.
      return `#figure(image("${src}", width: 100%), caption: [${alt}])`;
    }
  });

  // 2. Convert Markdown Syntax to Typst

  // Headers
  typstContent = typstContent.replace(/^# (.*$)/gm, '= $1');
  typstContent = typstContent.replace(/^## (.*$)/gm, '== $1');
  typstContent = typstContent.replace(/^### (.*$)/gm, '=== $1');

  // Bold and Italic
  // Markdown **bold** -> Typst *bold*
  // Markdown *italic* -> Typst _italic_
  // We must be careful about order.
  typstContent = typstContent.replace(/\*\*(.*?)\*\*/g, '*$1*');
  typstContent = typstContent.replace(/\*(.*?)\*/g, '_$1_');

  // Blockquotes
  typstContent = typstContent.replace(/^> (.*$)/gm, '#quote[$1]');

  // Unordered Lists
  // Markdown uses - or *, Typst uses -
  // We already replaced *italic*, so we should be careful if list uses *.
  // Assuming '-' for lists or '*' at start of line.
  typstContent = typstContent.replace(/^[-*] (.*$)/gm, '- $1');

  // Links
  // [text](url) -> #link("url")[text]
  typstContent = typstContent.replace(/\[(.*?)\]\((.*?)\)/g, '#link("$2")[$1]');

  // 3. Create Main File
  const mainFile = `
#import "template.typ": book

#show: doc => book(
  title: "Exported Ebook",
  author: "Gemini Editor",
  doc
)

${typstContent}
  `;

  // 4. Add files to Zip
  zip.file("main.typ", mainFile);
  zip.file("template.typ", TYPST_TEMPLATE);

  // 5. Generate Blob
  return await zip.generateAsync({ type: "blob" });
};
