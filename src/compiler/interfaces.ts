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
  | Assignment
  | IfStatement
  | ElseStatement
  | SwitchStatement
  | CaseStatement
  | OutrocasoStatement
  | ForStatement
  | WhileStatement;

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

export type IfStatement = {
  type: "if";
  expression: Expression;
  body: [];
};

export type ElseStatement = {
  type: "else";
  body: [];
};

export type SwitchStatement = {
  type: "switch";
  expression: Expression;
  body: [];
};

export type CaseStatement = {
  type: "case";
  expressions: Expression[];
  body: [];
};

export type OutrocasoStatement = {
  type: "default";
  body: [];
};

export type ForStatement = {
  type: "for";
  variable: Expression;
  initial: Expression;
  to: Expression;
  increment: Expression;
  body: [];
};

export type WhileStatement = {
  type: "while";
  expression: Expression;
  body: [];
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
