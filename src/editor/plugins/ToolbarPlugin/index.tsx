import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { $isCodeNode, CODE_LANGUAGE_FRIENDLY_NAME_MAP, CODE_LANGUAGE_MAP } from '@lexical/code';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $isListNode, ListNode } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isHeadingNode } from '@lexical/rich-text';
import { $isParentElementRTL } from '@lexical/selection';
import { $findMatchingParent, $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import type { NodeKey } from 'lexical';
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND
} from 'lexical';

import styles from '../../index.module.css';
import { classNames, getSelectedNode, sanitizeUrl } from '../../../utils';

export const CAN_USE_DOM: boolean =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined';
export const IS_APPLE: boolean =
  CAN_USE_DOM && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

const blockTypeToBlockName = {
  bullet: 'Bulleted List',
  check: 'Check List',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  number: 'Numbered List',
  paragraph: 'Normal',
  quote: 'Quote'
};

function getCodeLanguageOptions(): [string, string][] {
  const options: [string, string][] = [];

  for (const [lang, friendlyName] of Object.entries(
    CODE_LANGUAGE_FRIENDLY_NAME_MAP
  )) {
    options.push([lang, friendlyName]);
  }

  return options;
}

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

function dropDownActiveClass(active: boolean) {
  if (active) return 'active dropdown-item-active';
  else return '';
}


function Divider(): JSX.Element {
  return <div className={styles['divider']}/>;
}

enum TextAlignment {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  JUSTIFY = 'justify'
}

export default function ToolbarPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [blockType, setBlockType] =
    useState<keyof typeof blockTypeToBlockName>('paragraph');
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(
    null
  );

  const [isLink, setIsLink] = useState(false);

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const [isRTL, setIsRTL] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<string>('');
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [showImageModal, setShowImageModal] = useState(false);
  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
            const parent = e.getParent();
            return parent !== null && $isRootOrShadowRoot(parent);
          });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));

      setIsRTL($isParentElementRTL(selection));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
          if ($isCodeNode(element)) {
            const language =
              element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
            setCodeLanguage(
              language ? CODE_LANGUAGE_MAP[language] || language : ''
            );
            return;
          }
        }
      }
      // Handle buttons
    }
  }, [activeEditor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({editorState}) => {
        editorState.read(() => {
          updateToolbar();
        });
      })
    );
  }, [activeEditor, editor, updateToolbar]);

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl('https://'));
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const onCodeLanguageSelect = useCallback(
    (value: string) => {
      activeEditor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(value);
          }
        }
      });
    },
    [activeEditor, selectedElementKey]
  );

  const [textAlign, setTextAlign] = useState<TextAlignment>(
    isRTL ? TextAlignment.RIGHT : TextAlignment.LEFT
  );
  return (
    <div className={styles['toolbar']}>
      <button
        disabled={!isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}
        className={classNames(
          styles['toolbar-item'],
          styles['spaced'],
          isBold && styles['active']
        )}
        title={IS_APPLE ? 'Bold (⌘B)' : 'Bold (Ctrl+B)'}
        aria-label={`Format text as bold. Shortcut: ${
          IS_APPLE ? '⌘B' : 'Ctrl+B'
        }`}
      >
        <i className={classNames(styles['format'], styles['bold'])}/>
      </button>
      <button
        disabled={!isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        }}
        className={classNames(
          styles['toolbar-item'],
          styles['spaced'],
          isItalic && styles['active']
        )}
        title={IS_APPLE ? 'Italic (⌘I)' : 'Italic (Ctrl+I)'}
        aria-label={`Format text as italics. Shortcut: ${
          IS_APPLE ? '⌘I' : 'Ctrl+I'
        }`}
      >
        <i className={classNames(styles['format'], styles['italic'])}/>
      </button>
      <button
        disabled={!isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
        }}
        className={classNames(
          styles['toolbar-item'],
          styles['spaced'],
          isUnderline && styles['active']
        )}
        title={IS_APPLE ? 'Underline (⌘U)' : 'Underline (Ctrl+U)'}
        aria-label={`Format text to underlined. Shortcut: ${
          IS_APPLE ? '⌘U' : 'Ctrl+U'
        }`}
      >
        <i className={classNames(styles['format'], styles['underline'])}/>
      </button>

      <button
        disabled={!isEditable}
        onClick={insertLink}
        className={classNames(
          styles['toolbar-item'],
          styles['spaced'],
          isLink && styles['active']
        )}
        aria-label="Insert link"
        title="Insert link"
      >
        <i className={classNames(styles['format'], styles['link'])}/>
      </button>
      <Divider/>
      <button
        disabled={!isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
          setTextAlign(TextAlignment.RIGHT);
        }}
        className={classNames(
          styles['toolbar-item'],
          styles['spaced'],
          textAlign === TextAlignment.RIGHT && styles['active']
        )}
      >
        <i className={classNames(styles['icon'], styles['right-align'])}/>
      </button>
      <button
        disabled={!isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
          setTextAlign(TextAlignment.CENTER);
        }}
        className={classNames(
          styles['toolbar-item'],
          styles['spaced'],
          textAlign === TextAlignment.CENTER && styles['active']
        )}
      >
        <i className={classNames(styles['icon'], styles['center-align'])}/>
      </button>
      <button
        disabled={!isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
          setTextAlign(TextAlignment.LEFT);
        }}
        className={classNames(
          styles['toolbar-item'],
          styles['spaced'],
          textAlign === TextAlignment.LEFT && styles['active']
        )}
      >
        <i className={classNames(styles['icon'], styles['left-align'])}/>
      </button>
      <button
        disabled={!isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
          setTextAlign(TextAlignment.JUSTIFY);
        }}
        className={classNames(
          styles['toolbar-item'],
          styles['spaced'],
          textAlign === TextAlignment.JUSTIFY && styles['active']
        )}
      >
        <i className={classNames(styles['icon'], styles['justify-align'])}/>
      </button>
      <button
        onClick={() => {
          setShowImageModal(true);
        }}
        className={classNames(
          styles['toolbar-item'],
          styles['spaced'],
          textAlign === TextAlignment.JUSTIFY && styles['active']
        )}
      >
        IMG
      </button>

    </div>
  );
}
