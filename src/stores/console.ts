import { create } from "zustand";

interface IConsoleStore {
  logs: Array<{ type: "info" | "error"; value: string; modified?: boolean }>;
  log: (log: string, modified?: boolean) => void;
  error: (err: string) => void;
  clear: () => void;

  opened: boolean;
  onOpenChange: (open: boolean) => void;

  prompt: {
    execute: (
      convertType: "string" | "number" | "float" | "boolean"
    ) => Promise<string | number | boolean>;
    respond: (response: string) => void;
    response: string;
    waiting: boolean;
  };
}

const ConsoleStore = create<IConsoleStore>((set, get) => ({
  logs: [],
  opened: false,
  prompt: {
    execute(convertType) {
      const resetResponse = (waiting = false) => {
        set((state) => {
          return {
            prompt: {
              ...state.prompt,
              response: "",
              waiting,
            },
          };
        });
      };
      resetResponse(true);

      const convertResponse = (response: string) => {
        switch (convertType) {
          case "string":
            return response;
          case "float":
            return parseFloat(response);
          case "number":
            return parseInt(response);
          case "boolean":
            if (response.trim().toLowerCase().startsWith("v")) return true;
            return false;
          default:
            return response;
        }
      };

      const persistPrompt = (response: string) => {
        if (!response) return;
        const { log, logs } = get();

        const lastLog = logs.slice(-1)[0];

        if (!lastLog || lastLog.modified) {
          return log(response, true);
        }

        lastLog.modified = true;
        lastLog.value += response;

        set((state) => ({
          logs: [...state.logs.slice(0, -1), lastLog],
        }));

        console.log(get().logs);
      };

      return new Promise((resolve) => {
        const unsubscribe = ConsoleStore.subscribe((state, oldState) => {
          if (state.prompt.response !== oldState.prompt.response) {
            const response = convertResponse(state.prompt.response);

            resolve(response);
            persistPrompt(state.prompt.response);
            resetResponse();
            unsubscribe();
          }
        });
      });
    },
    respond(response) {
      set((state) => ({
        prompt: {
          ...state.prompt,
          response,
        },
      }));
    },
    response: "",
    waiting: false,
  },
  clear() {
    set({ logs: [] });
  },
  log(log, modified) {
    set((state) => ({
      logs: [
        ...state.logs,
        {
          type: "info",
          value: log,
          modified,
        },
      ],
    }));
  },
  error(err) {
    set((state) => ({
      logs: [
        ...state.logs,
        {
          type: "error",
          value: err,
        },
      ],
    }));
  },
  onOpenChange(opened) {
    set({ opened });
  },
}));

export { ConsoleStore };
