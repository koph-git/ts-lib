/**
 * loader.ts
 * @version 1.0.0
 * @author Koph <kophmail@gmail.com>
 *
 * Utilitário para carregamento dinâmico de arquivos JavaScript e CSS com controle de status,
 * timeout e cache. Evita múltiplos carregamentos do mesmo recurso e permite uso com `Promise`.
 *
 * @example
 * // Carregar um script JS
 * Loader.js("/scripts/utils.js").then(() => {
 *   console.log("JS carregado com sucesso!");
 * }).catch(console.error);
 *
 * @example
 * // Carregar um CSS
 * Loader.css("/styles/theme.css").then(() => {
 *   console.log("CSS aplicado!");
 * }).catch(console.error);
 *
 * @example
 * // Carregar múltiplos scripts
 * Loader.js([
 *   "/scripts/lib1.js",
 *   "/scripts/lib2.js"
 * ]).then(() => {
 *   console.log("Todos os scripts foram carregados.");
 * }).catch(console.error);
 *
 * @example
 * // Carregar múltiplos CSS
 * Loader.css([
 *   "/styles/reset.css",
 *   "/styles/main.css"
 * ]).then(() => {
 *   console.log("Todos os estilos aplicados.");
 * }).catch(console.error);
 *
 * @param path Caminho absoluto ou relativo do recurso a ser carregado (ou array de caminhos).
 * @param asyncLoad (boolean) Define se o JS será carregado com `async` ou `defer`. Padrão: true.
 * @param timeoutMs (number) Tempo máximo de espera antes de falhar. Padrão: 10000ms.
 *
 * @returns Promise<boolean> que resolve `true` em sucesso ou rejeita em caso de erro.
 */

type TModule = {
  status: "loading" | "error" | "success";
  promise: Promise<any> | null;
};

const modules: { [key: string]: TModule } = {};

function resolvePath(path: string) {
  return new URL(path, location.href).href;
}
function loader(path: string, type: "js" | "css", asyncLoad = true, timeoutMs = 10000): Promise<boolean> {
  path = resolvePath(path);

  if (modules[path]) {
    if (modules[path].status === "loading") return modules[path].promise as Promise<any>;
    if (modules[path].status === "success") return Promise.resolve(true);
    return Promise.resolve(false);
  }

  modules[path] = {
    status: "loading",
    promise: null,
  };

  return type === "css"
    ? loadCSS(path, timeoutMs)
    : loadJS(path, asyncLoad, timeoutMs);
}
function loadJS(path: string, asyncLoad = true, timeoutMs = 10000) {
  const promise = new Promise<boolean>((resolve, reject) => {
    const script: HTMLScriptElement = document.createElement("script");
    const timeout = setTimeout(() => {
      modules[path].status = "error";
      reject(new Error(`Timeout ao carregar JS: ${path}`));
    }, timeoutMs);

    script.onload = () => {
      if (modules[path].status !== "loading") return;

      script.onload = null;
      clearTimeout(timeout);

      modules[path] = {
        status: "success",
        promise: null,
      };

      resolve(true);
    };

    script.onerror = () => {
      clearTimeout(timeout);
      modules[path].status = "error";
      reject(new Error(`Erro ao carregar JS: ${path}`));
    };

    script.src = path;
    if (asyncLoad) {
      script.setAttribute("async", "");
    } else {
      script.setAttribute("defer", "");
    }

    document.head.appendChild(script);
  });

  modules[path].promise = promise;
  return promise;
}
function loadCSS(path: string, timeoutMs = 10000) {
  const promise = new Promise<boolean>((resolve, reject) => {
    const link: HTMLLinkElement = document.createElement("link");
    const timeout = setTimeout(() => {
      modules[path].status = "error";
      reject(new Error(`Timeout ao carregar CSS: ${path}`));
    }, timeoutMs);

    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    link.setAttribute("href", path);

    link.onload = () => {
      if (modules[path].status !== "loading") return;

      link.onload = null;
      clearTimeout(timeout);
      modules[path].status = "success";
      resolve(true);
    };

    link.onerror = () => {
      clearTimeout(timeout);
      modules[path].status = "error";
      reject(new Error(`Erro ao carregar CSS: ${path}`));
    };

    document.head.appendChild(link);
  });

  modules[path].promise = promise;
  return promise;
}
function loadMultiple(paths: string[], type: "js" | "css", asyncLoad = true, timeoutMs = 10000) {
  return Promise.all(paths.map(path => loader(path, type, asyncLoad, timeoutMs)));
}

export const Loader = {
  js(path: string | string[], asyncLoad = true, timeoutMs = 10000) {
    return Array.isArray(path)
      ? loadMultiple(path, "js", asyncLoad, timeoutMs)
      : loader(path, "js", asyncLoad, timeoutMs);
  },
  css(path: string | string[], asyncLoad = true, timeoutMs = 10000) {
    return Array.isArray(path)
      ? loadMultiple(path, "css", asyncLoad, timeoutMs)
      : loader(path, "css", asyncLoad, timeoutMs);
  },
};
