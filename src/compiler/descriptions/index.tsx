import { createRoot } from "react-dom/client";
import Markdown from "react-markdown";

import Algoritmo from "./algoritmo.md?raw";
import BlocoAlgoritmo from "./bloco-algoritmo.md?raw";
import Escreva from "./escreva.md?raw";
import Leia from "./leia.md?raw";
import Var from "./var.md?raw";

const descriptions = {
  Algoritmo,
  BlocoAlgoritmo,
  Escreva,
  Leia,
  Var,
  Inicio: `Palavra-chave utilizada para abrir um bloco de um algoritmo`,
  Fim: `Palavra-chave utilizada para fechar um bloco de um algoritmo`,
};

function getInfo(option: keyof typeof descriptions) {
  const root = document.createElement("div");
  createRoot(root).render(
    <Markdown className="prose dark:prose-invert prose-sm prose-p:m-0 prose-hr:my-2 prose-pre:mt-0 [&_pre_>_code]:bg-transparent [&_pre_>_code]:px-0 prose-code:bg-secondary prose-code:p-1 prose-code:rounded-sm prose-code:px-2 prose-code:before:content-none prose-code:after:content-none">
      {descriptions[option]}
    </Markdown>
  );
  return () => root;
}

export { descriptions, getInfo };
