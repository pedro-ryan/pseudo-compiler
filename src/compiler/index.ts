import { generator } from "@/compiler/generator";
import { transform } from "@/compiler/transform";
import { lexer, parser } from "./parser";
import "./parsers/loadParsers";

const example_code = `// Oia já tem até comentário
Algoritmo hello_world
Inicio
  Escreva "Hello World!"
Fim
`;

export const Logger = (log: unknown) => {
  if (typeof log === "object") {
    console.log(JSON.stringify(log, null, 2));
  } else {
    console.log(log);
  }
  // TODO log in integrated console
};

function runner(code: string) {
  const codeRunner = new Function(code);
  codeRunner.call({ Logger });
}

console.log("\nCODE:");
Logger(example_code);

console.log("\nLEXER:");
const LEXER = lexer(example_code);
Logger(LEXER);

console.log("\nPARSER:");
const PARSER = parser(LEXER);
Logger(PARSER);

console.log("\nTRANSFORM:");
const TRANSFORM = transform(PARSER);
Logger(TRANSFORM);

console.log("\nGENERATOR:");
const GENERATOR = generator(TRANSFORM);
Logger(GENERATOR);

console.log("\nRUNNING:");
runner(GENERATOR!);
