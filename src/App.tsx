import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DownloadIcon,
  FileTextIcon,
  HamburgerMenuIcon,
  PlayIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import createTheme from "@uiw/codemirror-themes";
import CodeMirror, { ViewUpdate } from "@uiw/react-codemirror";
import { useCallback, useState } from "react";

function Header() {
  return (
    <div className="h-9 flex justify-between bg-primary">
      <Sheet>
        <SheetTrigger asChild>
          <Button>
            <HamburgerMenuIcon />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pt-12">
          <div className="gap-4 h-full flex flex-col">
            <Button className="gap-2 w-full">
              <PlusIcon />
              New Project
            </Button>
            <Button className="gap-2 w-full">
              <DownloadIcon />
              Save Project
            </Button>
            <Button className="gap-2 w-full mt-auto">
              <FileTextIcon />
              Documentation
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <Button>
        <PlayIcon />
      </Button>
    </div>
  );
}

function Footer() {
  return (
    <Collapsible
      className="transition-all ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:slide-in-from-bottom"
      style={{ "--tw-exit-translate-y": "93%" } as React.CSSProperties}
    >
      <div className="h-7 bg-primary flex justify-center items-center">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="text-white h-5 w-2/3 bg-secondary">
            <div>Console</div>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="transition-all ease-in-out data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=closed]:slide-out-to-bottom">
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
    <div className="grid grid-rows-[auto_1fr_auto] h-screen">
      <Header />
      <Editor />
      <Footer />
    </div>
  );
}

export default App;
