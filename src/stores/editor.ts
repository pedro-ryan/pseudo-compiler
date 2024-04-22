import { runner } from "@/compiler";
import { generator } from "@/compiler/generator";
import { parser } from "@/compiler/parser";
import { transform } from "@/compiler/transform";
import { ConsoleStore } from "@/stores/console";
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
  },
  runCode() {
    const { value } = get();

    if (!value) {
      return;
    }

    const Transform = transform(parser.parse(value), value);
    console.log(JSON.stringify(Transform, null, 2));

    const code = generator(Transform);
    console.log(code);

    if (!code) {
      ConsoleStore.getState().error(
        "Não foi possível COMPILAR seu código, verifique se não tem nenhum erro"
      );
      return;
    }

    try {
      runner(code);
    } catch (err) {
      console.error(err);
      ConsoleStore.getState().error(
        "Não foi possível EXECUTAR seu código, verifique se não tem nenhum erro"
      );
    }
  },
}));

export { EditorStore };
