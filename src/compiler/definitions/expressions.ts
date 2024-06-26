import { Expression } from "@/compiler/interfaces";
import { SyntaxNodeRef } from "@lezer/common";

const UnaryExpression = (
  node: SyntaxNodeRef,
  getText: (node?: SyntaxNodeRef | undefined) => string
) => {
  return BinaryExpression(node, getText);
};

const BinaryExpression = (
  node: SyntaxNodeRef,
  getText: (node?: SyntaxNodeRef | undefined) => string
) => {
  let operation = "";

  const ignoreNodes = [
    "BinaryExpression",
    "ParenthesizedExpression",
    "UnaryExpression",
    "LogicOp",
  ];

  node.node.firstChild?.cursor().iterate((binaryChild) => {
    if (ignoreNodes.includes(binaryChild.name)) return true;

    let text = getText(binaryChild);
    if (binaryChild.name === "DivisionInt") {
      const [N1, N2] = BinaryExpression(binaryChild, getText).value.split("\\");
      operation += `this.DivInt(${N1},${N2})`;
      return false;
    }

    if (binaryChild.name === "XorExpression") {
      const [N1, N2] = BinaryExpression(binaryChild, getText).value.split(
        "XOU"
      );
      operation += `this.XOR(${N1},${N2})`;
      return false;
    }

    if (binaryChild.name === "UnaryExpression") {
      text = UnaryExpression(binaryChild, getText).value;
      return false;
    }

    if (binaryChild.name === "ArithOp") {
      operation += text.replaceAll(/\^/g, "**");
      return false;
    }

    if (binaryChild.name === "VariableName") {
      operation += `$\{${text}}`;
      return false;
    }

    if (binaryChild.name === "BooleanLiteral") {
      if (text.toLowerCase() === "verdadeiro") {
        text = "true";
      } else {
        text = "false";
      }
    }

    if (text === "<>") text = "!=";
    if (text === "=") text = "==";
    if (text === "NÃO") text = "!";
    if (text === "E") text = "&&";
    if (text === "OU") text = "||";

    operation += text;
  });

  return {
    type: "operation" as const,
    value: operation,
  };
};

export function getExpressions(
  node: SyntaxNodeRef,
  getText: (node?: SyntaxNodeRef | undefined) => string,
  skip?: string[]
): Expression[] {
  const expressions: Expression[] = [];

  node.node.firstChild?.cursor().iterate((child) => {
    if (skip && skip.includes(child.name)) return false;

    if (child.name === "BinaryExpression") {
      const expression = BinaryExpression(child, getText);
      expressions.push(expression);

      return false;
    }

    if (child.name === "UnaryExpression") {
      expressions.push({
        type: "operation",
        value: UnaryExpression(child, getText).value,
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

    if (child.name === "VetorRef") {
      const values = getExpressions(child, getText);

      const [name, VectorY, VectorX] = values;

      if (name.type !== "var") {
        return false;
      }

      expressions.push({
        type: "vector",
        name: name.name,
        y: VectorY,
        x: VectorX,
      });

      return false;
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

export function expressionParser(
  v: Expression,
  assign?: boolean
): string | number | boolean {
  if (v.type === "operation") {
    return expressionVariable(v.value);
  }

  if (v.type === "var") {
    if (assign) return v.name;
    return `this.getVar("${v.name}")`;
  }

  if (v.type === "vector") {
    const VectorY = expressionParser(v.y);
    const VectorX = v.x ? expressionParser(v.x) : undefined;
    return `this.getVector("${v.name}", ${VectorY}, ${VectorX})`;
  }

  return v.value;
}
