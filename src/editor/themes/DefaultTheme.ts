import type { EditorThemeClasses } from "lexical";

import styles from "./DefaultTheme.module.css";

const theme: EditorThemeClasses = {
  code: styles["ms-editor-default-theme__code"],
  heading: {
    h1: styles["ms-editor-default-theme__h1"],
    h2: styles["ms-editor-default-theme__h2"],
    h3: styles["ms-editor-default-theme__h3"],
    h4: styles["ms-editor-default-theme__h4"],
    h5: styles["ms-editor-default-theme__h5"],
    h6: styles["ms-editor-default-theme__h6"]
  },
  link: styles["ms-editor-default-theme__link"],
  list: {
    listitem: styles["ms-editor-default-theme__listItem"],
    listitemChecked: styles["ms-editor-default-theme__listItemChecked"],
    listitemUnchecked: styles["ms-editor-default-theme__listItemUnchecked"],
    nested: {
      listitem: styles["ms-editor-default-theme__nestedListItem"]
    },
    olDepth: [
      styles["ms-editor-default-theme__ol1"],
      styles["ms-editor-default-theme__ol2"],
      styles["ms-editor-default-theme__ol3"],
      styles["ms-editor-default-theme__ol4"],
      styles["ms-editor-default-theme__ol5"]
    ],
    ul: styles["ms-editor-default-theme__ul"]
  },
  ltr: styles["ms-editor-default-theme__ltr"],
  paragraph: styles["ms-editor-default-theme__paragraph"],
  quote: styles["ms-editor-default-theme__quote"],
  rtl: styles["ms-editor-default-theme__rtl"],
  text: {
    bold: styles["ms-editor-default-theme__textBold"],
    code: styles["ms-editor-default-theme__textCode"],
    italic: styles["ms-editor-default-theme__textItalic"],
    strikethrough: styles["ms-editor-default-theme__textStrikethrough"],
    underline: styles["ms-editor-default-theme__textUnderline"]
  }
};

export default theme;
