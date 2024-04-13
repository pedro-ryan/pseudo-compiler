import { runner } from "@/compiler";
import { generator } from "@/compiler/generator";
import { lexer, parser } from "@/compiler/parser";
import { transform } from "@/compiler/transform";
import { ViewUpdate } from "@uiw/react-codemirror";
import { create } from "zustand";

interface IEditorStore {
  value: string;
  code: string;
  onChange: (val: string, viewUpdate: ViewUpdate) => void;
  runCode: () => void;
}

const EditorStore = create<IEditorStore>((set, get) => ({
  value: "",
  code: "",
  onChange(newValue) {
    console.log("val:", newValue);

    set({ value: newValue });

    const LEXER = lexer(newValue);

    const PARSER = parser(LEXER);
    console.log(PARSER);

    const TRANSFORM = transform(PARSER);
    console.log(TRANSFORM);

    const GENERATOR = generator(TRANSFORM);
    console.log(GENERATOR);

    if (!GENERATOR) {
      throw "Não foi possível compilar seu código, verifique se não tem nenhum erro";
    }

    set({ code: GENERATOR });
  },
  runCode() {
    const { code } = get();

    runner(code);
  },
}));

export { EditorStore };
