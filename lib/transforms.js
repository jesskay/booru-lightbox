const transform = require("gulp-transform");
const userscript = require("userscript-meta");
const path = require("path");

const encoding = { encoding: 'utf8' };

module.exports = {
  header(text) {
    return transform(contents => {
      return `${text}\n${contents}`;
    }, encoding);
  },
  footer(text) {
    return transform(contents => {
      return `${contents}\n${text}`;
    }, encoding);
  },
  wrap(header, footer) {
    return transform(contents => {
      return `${header}${contents}${footer}`;
    }, encoding);
  },
  jsWrap() {
    return transform((contents, file) => {
      contents = contents.replace(/([\"\'\\])/gm, "\\$1")
        .replace(/\n/gm, "\\n")
        .replace(/\r/gm, "\\r")
        .replace(/\t/gm, "\\t");
      contents = `Booru.styles.${path.basename(file.path, '.css')} = "${contents}";`;
      return contents;
    }, encoding);
  },
  userscript() {
    return transform(contents => {
      try {
        let data = JSON.parse(contents);
        return userscript.stringify(data);
      } catch(e) { return `/* ERROR\n${e}\n*/`}
    }, encoding);
  },
  fileHeaders() {
    return transform((contents, file) => {
      // unixify the path
      let loc = "/" + path.relative(process.cwd(), file.path).replace(/\\/g, "/");
      return `// ${loc}\n${contents}`;
    }, encoding);
  },
  trim() {
    return transform((contents, file) => {
      return contents.replace(/^\s+|\s+$/g, "");
    }, encoding);
  },
  debug() {
    return transform((contents, file) => {
      console.log(file.path);
      console.log(contents);
      return contents;
    }, encoding);
  }
};
