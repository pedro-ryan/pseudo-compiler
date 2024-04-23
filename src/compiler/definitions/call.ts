import { setGenerator } from "@/compiler/generator/context";
import { Call } from "@/compiler/interfaces";
import { setTransformer } from "@/compiler/transform/context";
import { expressionVariable, getExpressions } from "./expressions";

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
      return expressionVariable(v.value);
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
