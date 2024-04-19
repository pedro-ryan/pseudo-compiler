import { ConsoleStore } from "@/stores/console";
export const Logger = (log: unknown) => {
  const { log: Log } = ConsoleStore.getState();
  if (typeof log === "object") {
    const ObjectString = JSON.stringify(log, null, 2);
    Log(ObjectString);
    return console.log(ObjectString);
  }

  if (typeof log === "boolean") {
    Log(log ? "Verdadeiro" : "Falso");
    return console.log(log);
  }

  Log(String(log));
  console.log(log);
};

const errors = {
  NotDefined: (prop?: string) =>
    `A variável "${prop}", não foi encontrada, verifique se você a declarou no bloco de variáveis`,
  TypeError: (prop?: string) =>
    `O valor que você está atribuindo na variável "${prop}" é diferente do que foi declarado antes para ela`,
};

function getError(errorMsgKey: keyof typeof errors, prop?: string) {
  const { error } = ConsoleStore.getState();
  const errorMsg = errors[errorMsgKey](prop);
  error(errorMsg);
  throw new Error(errorMsg);
}

export function runner(code: string) {
  const Prompt = ConsoleStore.getState().prompt.execute;

  const RunnerThis = {
    Logger,
    Prompt,
    variables: {},
    checkVar(prop: string) {
      return {}.hasOwnProperty.call(this.variables, prop);
    },
    getVar(prop: keyof typeof this.variables) {
      if (this.checkVar(prop)) return this.variables[prop];
      getError("NotDefined", prop);
    },
    setVar(prop: keyof typeof this.variables, value: unknown) {
      const oldValue = this.getVar(prop);

      if (typeof value !== typeof oldValue) {
        getError("TypeError", prop);
      }

      this.variables[prop] = value as (typeof this.variables)[typeof prop];
    },
  };

  const codeRunner = new Function(code);
  codeRunner.call(RunnerThis);
}
