import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import createTheme from "@uiw/codemirror-themes";
import CodeMirror, { ViewUpdate } from "@uiw/react-codemirror";
import { useCallback, useState } from "react";

function Footer() {
  return (
    <Collapsible>
      <div className="h-7 bg-primary flex justify-center items-center">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="text-white h-5 w-2/3 bg-secondary">
            <div>Console</div>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="animate-in">
        <div className="bg-muted h-[50vh] transition-all p-4 overflow-auto">
          <p className="text-destructive">
            Uncaught Error: React.Children.only expected to receive a single
            React element child.
          </p>
          <p>Random</p>
          <p>Random</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

const editorTheme = createTheme({
  theme: "dark",
  settings: {
    caret: "#FFFFFF",
    gutterBackground: "#FFFFFF00",
    gutterForeground: "#555555",
    gutterActiveForeground: "#FFFFFF",
  },
  styles: [],
});

function Editor() {
  const [value, setValue] = useState("console.log('hello world!');");
  const onChange = useCallback((val: string, viewUpdate: ViewUpdate) => {
    console.log("val:", val);
    console.log(viewUpdate);
    setValue(val);
  }, []);

  return (
    <div className="overflow-hidden h-full">
      <CodeMirror
        value={value}
        className="h-full"
        theme={editorTheme}
        height="100%"
        onChange={onChange}
      />
    </div>
  );
}

function App() {
  return (
    <div className="grid grid-rows-[1fr_auto] h-screen">
      <Editor />
      <Footer />
    </div>
  );
}

export default App;
