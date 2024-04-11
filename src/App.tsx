import CodeMirror, { ViewUpdate } from "@uiw/react-codemirror";
import { useCallback, useState } from "react";

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
        height="100%"
        onChange={onChange}
      />
    </div>
  );
}

function App() {
  return (
    <div className="h-screen">
      <Editor />
    </div>
  );
}

export default App;
