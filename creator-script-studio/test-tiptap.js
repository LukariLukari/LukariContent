const { Editor, Extension } = require('@tiptap/core');
const Document = require('@tiptap/extension-document').Document;
const Paragraph = require('@tiptap/extension-paragraph').Paragraph;
const Text = require('@tiptap/extension-text').Text;
const TextStyle = require('@tiptap/extension-text-style').TextStyle;

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ commands }) => {
        return commands.setMark('textStyle', { fontSize })
      },
      unsetFontSize: () => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run()
      },
    }
  },
});

const editor = new Editor({
  extensions: [Document, Paragraph, Text, TextStyle, FontSize],
});

console.log(typeof editor.chain().focus().setFontSize);
