import { setGenerator } from "@/compiler/generator/context";
import { Assignment, Variable, Vector } from "@/compiler/interfaces";
import { setTransformer } from "@/compiler/transform/context";
import { expressionParser, getExpressions } from "./expressions";

setTransformer("AssignmentExpression", ({ skipChildren, node, getText }) => {
  skipChildren();

  const [name, expression] = getExpressions(node, getText);

  if (!name || !["var", "vector"].includes(name.type)) return false;

  return {
    type: "assign",
    var: name as Vector | Variable,
    expression,
  };
});

setGenerator<Assignment>("assign", ({ data }) => {
  let value = "";

  if (data.expression.type === "var") {
    value = `this.getVar("${data.expression.name}")`;
  } else {
    value = `${expressionParser(data.expression)}`;
  }

  if (data.var.type === "vector") {
    const VectorY = expressionParser(data.var.y);
    const VectorX = data.var.x ? expressionParser(data.var.x) : undefined;
    return `this.setVector(["${data.var.name}", ${VectorY}, ${VectorX}], ${value})\n`;
  }

  return `this.setVar("${data.var.name}", ${value})\n`;
});
