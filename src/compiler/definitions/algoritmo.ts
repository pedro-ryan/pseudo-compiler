import { setGenerator } from "@/compiler/generator/context";
import { AlgoritmoDeclaration, Code } from "@/compiler/interfaces";
import { setTransformer } from "@/compiler/transform/context";

setTransformer("AlgorithmFile", ({ childrenIn }) => {
  childrenIn("body");
  return {
    type: "code",
    body: [],
  };
});

setTransformer("BlockAlgoritmo", () => true);

setTransformer("AlgoritmoDeclaration", ({ childrenIn, getText, getChild }) => {
  childrenIn("body");
  const Identifier = getChild("Identifier") || getChild("String");
  if (!Identifier) return false;

  const name = getText(Identifier).replaceAll('"', "");

  return {
    type: "function",
    name,
    body: [],
  };
});

setGenerator<Code>("code", ({ generate, data }) => {
  return generate(data.body);
});

setGenerator<AlgoritmoDeclaration>("function", ({ data, generate }) => {
  const name = data.name.replaceAll(" ", "_");

  const code = [
    `async function _${name}() {`,
    generate(data.body),
    "}",
    `_${name}.call(this)`,
  ];

  return code.join("\n");
});
