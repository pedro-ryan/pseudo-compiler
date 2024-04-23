import { Expression } from "@/compiler/interfaces";
import { SyntaxNodeRef } from "@lezer/common";

const BinaryExpression = (
  node: SyntaxNodeRef,
  getText: (node?: SyntaxNodeRef | undefined) => string
) => {
  let operation = "";

  const ignoreNodes = ["BinaryExpression", "ParenthesizedExpression"];

  node.node.firstChild?.cursor().iterate((binaryChild) => {
    if (ignoreNodes.includes(binaryChild.name)) return true;

    let text = getText(binaryChild);
    if (binaryChild.name === "ArithOp") {
      operation += text.replaceAll(/\^/g, "**");
      return false;
    }

    if (binaryChild.name === "VariableName") {
      operation += `$\{${text}}`;
      return false;
    }

    if (binaryChild.name === "BooleanLiteral") {
      console.log(text);
      if (text.toLowerCase() === "verdadeiro") {
        text = "true";
      } else {
        text = "false";
      }
    }

    operation += text;
  });

  return {
    type: "operation" as const,
    value: operation,
  };
};

export function getExpressions(
  node: SyntaxNodeRef,
  getText: (node?: SyntaxNodeRef | undefined) => string
): Expression[] {
  const expressions: Expression[] = [];

  node.node.firstChild?.cursor().iterate((child) => {
    if (child.name === "BinaryExpression") {
      const expression = BinaryExpression(child, getText);
      expressions.push(expression);

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

export function expressionVariable(text: string) {
  return text.replaceAll(/\${([^}]+)}/g, 'this.getVar("$1")');
}
