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
  styles: [{ tag: t.moduleKeyword, color: "#f71818" }],
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
        onChange={EditorStore.getState().onChange}
      />
    </div>
  );
}
