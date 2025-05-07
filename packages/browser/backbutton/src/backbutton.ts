/**
 * backbutton.ts
 * @version 1.0.0
 * @author Koph <kophmail@gmail.com>
 *
 * Módulo BackButton
 * -----------------
 *
 * Este módulo implementa um mecanismo customizado para lidar com o botão "voltar" do navegador,
 * interceptando os eventos de navegação do histórico. Ele permite o registro, o cancelamento e a
 * limpeza de callbacks que serão executados quando o usuário navegar para trás.
 *
 * Funcionalidades Principais:
 *  - Registrar uma ação (callback) para ser executada na navegação para trás com onNextAction(callback).
 *  - Cancelar a próxima ação registrada usando cancelNextAction(cancel).
 *  - Limpar todas as ações registradas e ajustar a pilha do histórico com clear().
 *
 * Uso:
 *   // Registrar uma nova ação para o botão de voltar
 *   BackButton.onNextAction(() => {
 *     // Lógica personalizada (ex.: fechar um modal)
 *     console.log("Ação de voltar executada");
 *   });
 *
 *   // Cancelar a próxima ação registrada (opcionalmente prevenindo sua execução)
 *   BackButton.cancelNextAction(true);
 *
 *   // Limpar todas as ações registradas e ajustar a pilha do histórico
 *   BackButton.clear();
 *
 * Descrição Detalhada das Funções:
 *
 *  onNextAction(callback: Callback): Promise<void>
 *    - Registra uma nova ação para o botão de voltar, empurrando um novo estado para a pilha do histórico.
 *    - Se já existir um callback pendente, encadeia a resolução para garantir a execução ordenada dos callbacks.
 *    - Retorna uma Promise que é resolvida imediatamente após o novo estado ser empurrado.
 *
 *  cancelNextAction(cancel?: boolean): Promise<void>
 *    - Cancela a ação de voltar registrada mais recentemente.
 *    - Se o parâmetro cancel for true, o callback será ignorado; caso contrário, poderá ser executado.
 *    - Retorna uma Promise que é resolvida quando o cancelamento (ou a navegação para trás) é processado.
 *
 *  clear(): Promise<void>
 *    - Remove todos os callbacks registrados e navega para trás no histórico, de acordo com o número de callbacks removidos.
 *    - Executa os callbacks removidos em ordem inversa (quando aplicável) após ajustar o histórico.
 *
 *  historyGo(value: number): Promise<void>
 *    - Função auxiliar que navega no histórico um determinado número de passos (por exemplo, -1 para um passo para trás)
 *      e retorna uma Promise que é resolvida quando o evento "popstate" é disparado.
 *
 *  onPopState(event: PopStateEvent): void
 *    - Manipulador do evento "popstate".
 *    - Gerencia a execução ou o cancelamento do callback mais recente registrado, de acordo com o estado atual do histórico.
 *
 * Inicialização:
 *  - Ao carregar o módulo, se o estado atual do histórico contiver o marcador (__register__),
 *    o módulo automaticamente navega para trás para limpar esse estado. Caso contrário, define BackButton.done
 *    como true, indicando que está pronto para uso.
 *
 * Variáveis Internas (no escopo do módulo):
 *  - callbacks: Array de funções do tipo Callback que representam as ações registradas para o botão de voltar.
 *  - state: Objeto que representa o estado atual empurrado para o histórico, geralmente contendo a flag __register__.
 *  - cleaning: Flag que indica se o módulo está em processo de execução da função clear().
 *  - historyGoResolve: Função de resolução temporária usada na Promise retornada por historyGo.
 *
 * Nota:
 *  Este módulo é destinado ao uso exclusivo em ambientes de navegador.
 *
 * Exemplo:
 *   BackButton.onNextAction(() => {
 *     console.log("O usuário pressionou o botão de voltar. Executando ação registrada.");
 *   });
 *
 */

type Callback = {
  (): void;
  resolve?: () => void;
  cancel?: boolean;
};

// Variáveis de módulo para gerenciar callbacks e estado interno.
let callbacks: Callback[] = [];
let state: Record<string, any> | undefined;
let cleaning = false;
let historyGoResolve: (() => void) | null = null;

/**
 * historyGo
 *
 * Navega no histórico em `value` passos (ex.: -1 para voltar) e retorna uma Promise
 * que é resolvida quando o evento "popstate" for disparado.
 */
function historyGo(value: number): Promise<void> {
  return new Promise((resolve) => {
    historyGoResolve = resolve;
    history.go(value);
  });
}

/**
 * BackButton
 *
 * Objeto que gerencia ações associadas ao botão "voltar" do navegador.
 * Permite registrar callbacks que serão chamados quando o usuário voltar no histórico.
 */
export const BackButton = {
  done: false,

  /**
   * Registra uma nova ação para ser executada quando o usuário navegar para trás.
   * Retorna uma Promise que é resolvida assim que o estado é empurrado para o histórico.
   *
   * @param callback - Função a ser executada quando a ação de "voltar" for disparada.
   */
  onNextAction(callback: Callback): Promise<void> {
    return new Promise((resolve) => {
      const lastCallback = callbacks[callbacks.length - 1];
      const lastResolve = lastCallback?.resolve;

      if (lastResolve) {
        // Encadeia a resolução do callback anterior para garantir execução ordenada.
        lastCallback.resolve = () => {
          lastResolve();
          doObserve();
        };
      } else {
        doObserve();
      }

      function doObserve() {
        state = { __register__: true };
        callbacks.push(callback);
        history.pushState(state, "");
        resolve();
      }
    });
  },

  /**
   * Cancela a próxima ação registrada.
   * Se um callback estiver aguardando, ajusta seu resolve para que, ao ser chamado,
   * a função de cancelamento (ou a remoção do callback) seja executada.
   *
   * @param cancel - Se `true`, o callback não será executado; caso contrário, será.
   */
  async cancelNextAction(cancel = false): Promise<void> {
    if (callbacks.length === 0 || cleaning) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const lastCallback = callbacks[callbacks.length - 1];
      const lastResolve = lastCallback?.resolve;

      if (lastResolve) {
        lastCallback.resolve = () => {
          lastResolve();
          doUnobserve();
        };
      } else {
        doUnobserve();
      }

      function doUnobserve() {
        if (history.state?.__register__) {
          if (lastCallback) {
            lastCallback.resolve = resolve;
            lastCallback.cancel = cancel;
          }
          history.back(); // A resolução ocorrerá no listener de "popstate"
        } else {
          callbacks.pop();
          resolve();
        }
      }
    });
  },

  /**
   * Remove todos os callbacks registrados e "volta" no histórico o número
   * de passos correspondentes aos callbacks removidos.
   */
  async clear(): Promise<void> {
    const copy = [...callbacks];
    const fn = copy.pop();
    const count = copy.length;

    callbacks = [];
    cleaning = true;

    if (count > 0) {
      await historyGo(-count);
    }

    // Executa os callbacks removidos em ordem inversa.
    for (let i = count - 1; i >= 0; i--) {
      copy[i]();
    }

    if (fn) callbacks = [fn];
    cleaning = false;
  },
};

/**
 * onPopState
 *
 * Manipulador do evento "popstate" que gerencia a execução ou cancelamento dos callbacks
 * registrados pelo BackButton, de acordo com o estado do histórico e as flags definidas.
 */
function onPopState(event: PopStateEvent): void {
  const resolveCallback = callbacks[callbacks.length - 1]?.resolve;

  // Se houver uma Promise pendente do historyGo, resolva-a.
  if (historyGoResolve) {
    historyGoResolve();
    historyGoResolve = null;
  }

  if (BackButton.done) {
    if (!state?.__register__) {
      return;
    }
    const fn = callbacks.pop();
    if (fn) {
      if (!fn.cancel) {
        fn();
      }
      delete fn.resolve;
    }
    if (resolveCallback) {
      setTimeout(resolveCallback, 10);
    }
    state = history.state;
  } else {
    if (!BackButton.done && history.state?.__register__) {
      history.back();
    } else {
      BackButton.done = true;
    }
  }
}

// Registra o listener de "popstate" sem sobrescrever outros listeners existentes.
window.addEventListener("popstate", onPopState);

// Na inicialização, se o estado do histórico indicar um registro, "volte" para limpar; caso contrário, marque como concluído.
if (history.state?.__register__) {
  history.back();
} else {
  BackButton.done = true;
}
