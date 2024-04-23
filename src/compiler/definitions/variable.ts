import { setGenerator } from "@/compiler/generator/context";
import { VariableDeclaration, VariableDefinition } from "@/compiler/interfaces";
import { setTransformer } from "@/compiler/transform/context";

setTransformer("VariableDeclaration", ({ node, skipChildren, getText }) => {
  skipChildren();

  const body: VariableDefinition[] = [];

  node.node.getChildren("VariableDefinition").forEach((child) => {
    const identifier = child.firstChild;
    const type = child.lastChild?.firstChild;

    if (!identifier || !type) return;

    let varType: "string" | "number" | "float" | "boolean" = "string";

    if (type.name === "Inteiro") {
      varType = "number";
    }

    if (type.name === "Real") {
      varType = "float";
    }

    if (type.name === "Logico") {
      varType = "boolean";
    }

    body.push({
      name: getText(identifier),
      type: varType,
    });
  });

  return {
    type: "variables",
    body,
  };
});

setGenerator<VariableDeclaration>("variables", ({ data }) => {
  const variables = data.body
    .map((v) => {
      let defaultValue = '""';
      if (v.type === "boolean") defaultValue = "false";
      if (v.type === "number") defaultValue = "0";
      if (v.type === "float") defaultValue = "0";

      return `${v.name}:{ type: "${v.type}", value: ${defaultValue} }`;
    })
    .filter(Boolean);

  const code = ["this.variables = {", variables.join(",\n"), "}\n"];

  return code.join("\n");
});
