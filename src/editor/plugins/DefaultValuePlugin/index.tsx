import * as React from "react";
import { useEffect } from "react";

import { $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $insertNodes } from "lexical";

export default function LexicalDefaultValuePlugin({
  value = ""
}: {
  value?: string | null;
}) {
  const [editor] = useLexicalComposerContext();
  const [updated, setUpdated] = React.useState<boolean>(false);
  const [doUpdate, setDoUpdate] = React.useState<boolean>(false);
  const [controlledValue, setControlledValue] = React.useState<string | null>(
    value
  );
  const update = () => {
    if (!value) {
      return;
    }
    const parser = new DOMParser();
    const dom = parser.parseFromString(value ?? "", "text/html");

    const nodes = $generateNodesFromDOM(editor, dom);

    $getRoot().select();

    $insertNodes(nodes);
  };

  useEffect(() => {
    setControlledValue((prev) => {
      setDoUpdate(prev !== value);
      return prev !== value ? value : prev;
    });
  }, [value]);

  useEffect(() => {
    editor.update(() => {
      if (doUpdate) {
        update();
      }
    });
  }, [doUpdate, controlledValue]);

  editor.update(() => {
    if (updated) return;
    update();
    setUpdated(true);
  });
  return null;
}
