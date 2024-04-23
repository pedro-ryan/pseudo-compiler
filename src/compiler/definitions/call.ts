import { setGenerator } from "@/compiler/generator/context";
import { Call, Expression } from "@/compiler/interfaces";
import { setTransformer } from "@/compiler/transform/context";
import { SyntaxNodeRef } from "@lezer/common";

export function getExpressions(
  node: SyntaxNodeRef,
  getText: (node?: SyntaxNodeRef | undefined) => string
): Expression[] {
  const expressions: Expression[] = [];

  node.node.firstChild?.cursor().iterate((child) => {
    if (child.name === "BinaryExpression") {
      let operation = ""; // getText(child).replaceAll(/\^/g, "**"); // replace exponentiation

      child.node.firstChild?.cursor().iterate((binaryChild) => {
        if (
          ["BinaryExpression", "ParenthesizedExpression"].includes(
            binaryChild.name
          )
        ) {
          return true;
        }
        const text = getText(binaryChild);
        if (binaryChild.name === "ArithOp") {
          operation += text.replaceAll(/\^/g, "**");
          return false;
        }

        if (binaryChild.name === "VariableName") {
          operation += `$\{${text}}`;
          return false;
        }

        operation += text;
      });

      expressions.push({
        type: "operation",
        value: operation,
      });

      return false;
    }

    if (child.name === "String") {
      expressions.push({
        type: "value",
        value: getText(child),
      });
    }

    if (child.name === "BooleanLiteral") {
      expressions.push({
        type: "value",
        value: getText(child) === "Verdadeiro" ? true : false,
      });
    }

    if (["Number", "Float"].includes(child.name)) {
      const stringNumber = getText(child);
      const isFloat = stringNumber.indexOf(".") > -1;

      const value = isFloat ? parseFloat(stringNumber) : parseInt(stringNumber);

      expressions.push({
        type: "value",
        value,
      });
    }

    if (child.name === "Identifier") {
      expressions.push({
        type: "var",
        name: getText(child),
      });
    }
  });

  return expressions;
}

setTransformer("EscrevaStatement", ({ skipChildren, node, getText }) => {
  skipChildren();

  return {
    type: "call",
    call: "Logger",
    args: getExpressions(node, getText),
  };
});

setTransformer("LeiaStatement", ({ skipChildren, node, getText }) => {
  skipChildren();

  return {
    type: "call",
    call: "Prompt",
    assign: true,
    async: true,
    args: getExpressions(node, getText),
  };
});

setGenerator<Call>("call", ({ data }) => {
  let code = "";

  let args = data.args.map((v) => {
    if (v.type === "operation") {
      return v.value.replaceAll(/(\$\{)(.*)\}/g, 'this.getVar("$2")');
    }

    if (v.type === "var") {
      if (data.assign) return v.name;
      return `this.getVar("${v.name}")`;
    }

    return v.value;
  });

  if (data.assign) {
    code += `this.setVar("${args[0]}", `;
    args = [];
  }
  if (data.async) code += "await ";

  code += `this.${data.call}(${args.join(",")})\n`;

  if (data.assign) code += ");\n";
  return code;
});
