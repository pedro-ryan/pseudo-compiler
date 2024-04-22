import { SyntaxNode, SyntaxNodeRef } from "@lezer/common";

export type TransformerHelpers = {
  node: SyntaxNodeRef;
  getText: (node?: SyntaxNodeRef) => string;
  childrenIn: (In: string) => void;
  getChild: SyntaxNode["getChild"];
  skipChildren: () => void;
};

export type Transformer = (
  helpers: TransformerHelpers
) => TransformData | boolean | void;

export type TransformData =
  | Code
  | AlgoritmoDeclaration
  | VariableDeclaration
  | Call
  | Assignment;

export type Code = {
  type: "code";
  body: [];
};

export type AlgoritmoDeclaration = {
  type: "function";
  name: string;
  body: [];
};

export type VariableDeclaration = {
  type: "variables";
  body: VariableDefinition[];
};

export type VariableDefinition = {
  name: string;
  type: "string" | "number" | "float" | "boolean";
};

export type Call = {
  type: "call";
  call: string;
  async?: boolean;
  assign?: boolean;
  args: Expression[];
};

export type Assignment = {
  type: "assign";
  var: string;
  expression: Expression;
};

export type Expression = ExpressionValue | Operation | Variable;

export type ExpressionValue = {
  type: "value";
  value: string | number | boolean;
};

export type Operation = {
  type: "operation";
  value: string;
};

export type Variable = {
  type: "var";
  name: string;
};
