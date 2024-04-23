import { AlgorithmLanguage } from "@/compiler/language";
import { EditorStore } from "@/stores/editor";
import { tags as t } from "@lezer/highlight";
import createTheme from "@uiw/codemirror-themes";
import CodeMirror from "@uiw/react-codemirror";

const editorTheme = createTheme({
  theme: "dark",
  settings: {
    fontFamily: "JetBrains Mono, monospace",
    caret: "#FFFFFF",
    gutterBackground: "#FFFFFF00",
    gutterForeground: "#555555",
    gutterActiveForeground: "#FFFFFF",
  },
  styles: [
    {
      tag: [t.keyword, t.definitionOperator, t.arithmeticOperator],
      color: "#f97583",
    },
    {
      tag: t.brace,
      color: "#d16ccd",
    },
    {
      tag: t.lineComment,
      color: "#6b737c",
    },
    {
      tag: t.string,
      color: "#ffab70",
    },
    {
      tag: t.typeName,
      color: "#b392f0",
    },
    {
      tag: t.variableName,
      color: "#6b9fda",
    },
  ],
});

export function Editor() {
  const value = EditorStore((state) => state.value);

  return (
    <div className="overflow-hidden h-full">
      <CodeMirror
        value={value}
        className="h-full"
        theme={editorTheme}
        height="100%"
        extensions={[AlgorithmLanguage]}
        onChange={EditorStore.getState().onChange}
      />
    </div>
  );
}
