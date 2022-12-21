import './App.css';
import { Editor } from './editor';

function App() {

  let value =
    '<h1 class="ms-editor-default-theme__h1"><strong class="ms-editor-default-theme__textBold">Bold Text</strong></h1><h1 class="ms-editor-default-theme__h1"><em class="ms-editor-default-theme__textItalic">Text Italic</em></h1><p class="ms-editor-default-theme__paragraph" dir="rtl"><span>Text underline</span></p><p class="ms-editor-default-theme__paragraph" dir="rtl"><a href="https://" class="ms-editor-default-theme__link"><span>This link</span></a></p>';

  return (
    <div className="App">
      <Editor defaultValue={value}/>
    </div>
  );
}

export default App;
