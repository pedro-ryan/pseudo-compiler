export type TokensTypes =
  | "NewLine"
  | "Integer"
  | "Float"
  | "Indentation"
  | "Word"
  | "Quote";

export type Token = {
  type: TokensTypes;
  value?: string | number;
};

export type Ast = AstValue[];

export type AstType =
  | "CallExpression"
  | "FunctionDeclaration"
  | "VariableDeclaration"
  | "CommentExpression"
  | "String"
  | "Number"
  | "Float"; // Number Alias

export type GenericAst<
  T extends AstType | TokensTypes,
  V extends string | number = string
> = {
  type: T;
  value: V;
};

export type FunctionDeclaration = {
  type: "FunctionDeclaration";
  name: string;
  identifier: GenericAst<"String" | "Word">;
  body: Ast;
};

export type CallExpressionArgs = Array<
  GenericAst<"String"> | GenericAst<"Number" | "Float", number>
>;

export type CallExpression = {
  type: "CallExpression";
  name: string;
  args?: CallExpressionArgs;
};

export type AstValue =
  | GenericAst<"String">
  | GenericAst<"CommentExpression">
  | GenericAst<"Number" | "Float", number>
  | FunctionDeclaration
  | CallExpression;

export type ModifiedAst = ModifiedExpression[];

export type ModifiedExpression = TCallExpression | TFunctionDeclaration | Code;

export type Code = {
  name: "Code";
  body: ModifiedAst;
};

export type TCallExpression = {
  call: "Logger";
  args: CallExpressionArgs;
};

export type FunctionDeclarationArgs = {
  name: string;
};

export type TFunctionDeclaration = {
  keyword: "function";
  args: FunctionDeclarationArgs;
  body: ModifiedAst;
};
