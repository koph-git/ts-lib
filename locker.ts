/**
 * locker.ts
 * @version 1.0.0
 * @author Koph <kophmail@gmail.com>
 *
 * Um “mutex” simples para coordenar acesso a recursos compartilhados em diferentes abas
 * do navegador, usando localStorage e o evento StorageEvent.
 *
 * Como funciona:
 * - Quando você chama `await locker.block(timeoutMs)`, o método tenta:
 *    1. Se não há lock ativo (`localStorage.getItem('token-locked')` é null),
 *       marca o lock e retorna imediatamente, permitindo entrar na seção crítica.
 *    2. Se já existe um lock (outra aba está na seção crítica), entra em espera:
 *       • Inscreve-se no evento `storage` para ouvir quando a chave `token-locked` for removida.
 *       • Define um timeout (padrão 10 000 ms) para evitar espera infinita.
 *       • Assim que o lock é liberado ou o timeout expira, resolve e retorna.
 * - O lock é “liberado” chamando `locker.release()`, que simplesmente remove a chave do localStorage
 *   e dispara o evento storage em outras abas.
 *
 * Exemplo de uso:
 * ```ts
 * import { Locker } from './locker';
 *
 * async function refreshTokenIfNeeded() {
 *   // Tenta adquirir o lock por até 5 segundos
 *   await Locker.block(5000);
 *   try {
 *     // seção crítica: só uma aba por vez faz o refresh
 *     const response = await fetch('/api/refresh-token', { method: 'POST' });
 *     const data = await response.json();
 *     localStorage.setItem('api_token', data.token);
 *   } finally {
 *     // libera para outras abas
 *     Locker.release();
 *   }
 * }
 *
 * // Em qualquer parte do seu código:
 * await refreshTokenIfNeeded();
 * ```
 */

// Remove todas as chaves que começam com "__locker__" e já expiraram
for (let i = localStorage.length - 1; i >= 0; i--) {
  const key = localStorage.key(i);
  if (!key || !key.startsWith('__locker__')) continue;

  try {
    const { timeout, timestamp } = JSON.parse(localStorage.getItem(key)!);
    if (Date.now() > Number(timestamp) + timeout) {
      localStorage.removeItem(key);
    }
  } catch {
    // Se estiver mal formatado, remove também
    localStorage.removeItem(key);
  }
}

export function Locker(key: string) {
  return {
    async block(timeoutMs = 10_000): Promise<number> {
     if (!isLocked(key)) {
       setIsLocked(key, timeoutMs);
       return 0;
     }

     // já há outro lock: aguardo até ele ser liberado ou até timeout
     return new Promise(resolve => {
       // timer de timeout
       const timer = setTimeout(() => {
         cleanup();
         resolve(2);
       }, timeoutMs);

       // listener para remoção da chave no localStorage
       const onStorage = (e: StorageEvent) => {
         if (e.key === 'token-locked' && e.newValue === null) {
           cleanup();
           resolve(1);
         }
       };
       window.addEventListener('storage', onStorage);

       function cleanup() {
         clearTimeout(timer);
         window.removeEventListener('storage', onStorage);
       }
     });
    },
    release(): void {
     setIsLocked(key, 0);
    }
  };
}

function isLocked(key: string): boolean {
  return localStorage.getItem(`__locker__.${key}`) !== null;
}

function setIsLocked(key: string, timeout: number): void {
  key = `__locker__.${key}`;

  if (timeout > 0) {
    localStorage.setItem(key, JSON.stringify({timeout, timestamp: Date.now().toString()}));
  } else {
    localStorage.removeItem(key);
  }
}
