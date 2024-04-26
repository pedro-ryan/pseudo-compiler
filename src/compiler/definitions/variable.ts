import { setGenerator } from "@/compiler/generator/context";
import { VariableDeclaration, VariableDefinition } from "@/compiler/interfaces";
import { setTransformer } from "@/compiler/transform/context";
import { SyntaxNode, SyntaxNodeRef } from "@lezer/common";

function getVectorIndex(
  nodes: SyntaxNode[],
  getText: (node?: SyntaxNodeRef) => string
) {
  const indexes: number[][] = nodes.map((node) => {
    const N1 = parseInt(getText(node.firstChild!));
    const N2 = parseInt(getText(node.lastChild!));

    const list = [];
    for (let i = N1; i <= N2; i++) {
      list.push(i);
    }
    return list;
  });

  return indexes;
}

setTransformer("VariableDeclaration", ({ node, skipChildren, getText }) => {
  skipChildren();

  const body: VariableDefinition[] = [];

  node.node.getChildren("VariableDefinition").forEach((child) => {
    const identifiers = child.node.getChildren("VariableName");
    let type = child.lastChild?.firstChild;

    if (!identifiers.length || !type) return;

    let varType: "string" | "number" | "float" | "boolean" = "string";
    let subType: "vector" | "matriz";
    let validIndex: number[][];

    if (type.name === "Vetor") {
      const intervals = type.getChildren("VetorInterval");
      validIndex = getVectorIndex(intervals, getText);
      if (intervals.length >= 2) {
        subType = "matriz";
      } else {
        subType = "vector";
      }

      type = type.getChild("Type")!.firstChild!;
    }

    if (type.name === "Inteiro") {
      varType = "number";
    }

    if (type.name === "Real") {
      varType = "float";
    }

    if (type.name === "Logico") {
      varType = "boolean";
    }

    identifiers.forEach((identifier) => {
      body.push({
        name: getText(identifier),
        type: varType,
        subType,
        validIndex,
      });
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
      let additional = "";
      if (v.type === "boolean") defaultValue = "false";
      if (v.type === "number") defaultValue = "0";
      if (v.type === "float") defaultValue = "0";

      if ("subType" in v && v.subType) {
        const validIndex = JSON.stringify(v.validIndex);
        const YSize = v.validIndex?.[0]?.length;
        const XSize = v.validIndex?.[1]?.length;
        const isVector = v.subType === "vector";

        const fill = isVector ? {} : new Array(XSize).fill({});

        const value = new Array(YSize).fill(fill);
        defaultValue = JSON.stringify(value).replaceAll("{}", defaultValue);

        additional = `, subType: "${v.subType}", validIndex: ${validIndex}`;
      }

      return `${v.name}:{ type: "${v.type}", value: ${defaultValue} ${additional} }`;
    })
    .filter(Boolean);

  const code = ["this.variables = {", variables.join(",\n"), "}\n"];

  return code.join("\n");
});
