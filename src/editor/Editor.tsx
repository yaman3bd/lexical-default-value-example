import * as React from 'react';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';

import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { $getRoot, $insertNodes, EditorState, LexicalEditor } from 'lexical';
import { mergeRefs } from 'react-merge-refs';

import DefaultNodes from './nodes/DefaultNodes';
import DefaultValuePlugin from './plugins/DefaultValuePlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import DefaultTheme from './themes/DefaultTheme';

import styles from './index.module.css';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import ContentEditable from './ui/ContentEditable';

export interface EditorProps {
  onChange?: (value: string) => void;
  defaultValue?: string | null;
  placeholder?: JSX.Element | string;
}

const Editor = forwardRef<HTMLDivElement, EditorProps>(
  (
    {onChange, defaultValue, placeholder = '', ...props}: EditorProps,
    ref
  ) => {
    const [_document, setDocument] = useState<Document | null>(null);

    useEffect((): void => {
      setDocument(document);
    }, []);

    const scrollRef = useRef(null);
    const [floatingAnchorElem, setFloatingAnchorElem] =
      useState<HTMLDivElement | null>(null);

    const onRef = (_floatingAnchorElem: HTMLDivElement) => {
      if (_floatingAnchorElem !== null) {
        setFloatingAnchorElem(_floatingAnchorElem);
      }
    };
    const mergedReferenceRef = useMemo(
      () => mergeRefs([ref, onRef]),
      [onRef, ref]
    );


    //this code working fine
    const update = (editor: LexicalEditor) => {
      console.log('test');
      const parser = new DOMParser();
      const dom = parser.parseFromString(defaultValue ?? "", "text/html");

      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.append(...nodes);
    };

    //this code will throw `replace: cannot be called on root nodes`
    /*const update = (editor: LexicalEditor) => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(defaultValue ?? '', 'text/html');

      const nodes = $generateNodesFromDOM(editor, dom);

      $getRoot().select();

      $insertNodes(nodes);
    };*/
    const initialConfig = {
      editorState: update,
      namespace: 'Playground',
      nodes: [...DefaultNodes],
      onError: (error: Error) => {
        throw error;
      },
      theme: DefaultTheme
    };

    function handleChange(editorState: EditorState, editor: LexicalEditor) {
      editor.update((): void => {
        const html = $generateHtmlFromNodes(editor, null);
        if (html.replace(/<[^>]*>?/gm, '')) {
          onChange && onChange(html);
        } else onChange && onChange('');
      });
    }

    return (
      <>
        {_document ? (
          <div className={styles['editor-shell']}>
            <LexicalComposer initialConfig={initialConfig}>
              <ToolbarPlugin/>
              <div
                className={styles['editor-container']}
                ref={scrollRef}
              >
                <AutoFocusPlugin/>
                <HashtagPlugin/>
                <AutoLinkPlugin/>
                <OnChangePlugin onChange={handleChange}/>
                <DefaultValuePlugin value={defaultValue}/>
                <RichTextPlugin
                  contentEditable={
                    <div className={styles['editor-scroller']}>
                      <div
                        {...props}
                        className={styles['editor']}
                        ref={mergedReferenceRef}
                      >
                        <ContentEditable/>
                      </div>
                    </div>
                  }
                  placeholder={placeholder}
                  ErrorBoundary={LexicalErrorBoundary}
                />
                <LinkPlugin/>
                <ListPlugin/>
                <CheckListPlugin/>
                {floatingAnchorElem && (
                  <>
                    <DraggableBlockPlugin anchorElem={floatingAnchorElem}/>
                    <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem}/>
                  </>
                )}
              </div>
            </LexicalComposer>
          </div>
        ) : (
          <div>{defaultValue}</div>
        )}
      </>
    );
  }
);
export default Editor;
