/**
 * token.ts
 * @version 1.0.0
 * @author Koph <kophmail@gmail.com>
 *
 * Gerenciador de tokens JWT com suporte a:
 * - Persistência em localStorage (accessToken e refreshToken)
 * - Decodificação automática do accessToken
 * - Detecção de expiração com tolerância (timeSkew)
 * - Refresh automático via função de configuração
 * - Controle de concorrência com locker (evita múltiplos refresh simultâneos)
 * - Notificação por callback onChange quando o token muda
 * - Suporte a mocks para testes

 * Uso básico:
  import { Token } from "@/libs/token";
  token.configure({
    refresh: async (refreshToken) => {
      // Requisição para endpoint que devolve novo accessToken e refreshToken
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { Authorization: `Bearer ${refreshToken}` }
      });
      const data = await res.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token
      };
    },
    onChange: (decoded) => {
      console.log("Novo token decodificado:", decoded);
    },
    timeSkew: 30 // segundos de tolerância ao relógio
 });

 // Exemplo de uso:
  if (Token.isLoggedIn()) {
    const accessToken = await Token.read();
    fetch("/api/dados", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  } else {
    console.log("Usuário não autenticado");
  }
 */

import { Locker } from "./locker";
import { jwt, TDecoded} from "./jwt";

export type TConfig = {
  refresh?: null | ((_refreshToken: string) => Promise<TSetToken>)
  onChange?: TOnChangeCallback
  timeSkew?: null | number
  mock?: null | string | Record<string, any>
}
export type TSetToken = {
  accessToken?: string | null
  refreshToken?: string | null
}
export type TOnChangeCallback = (evt: TDecoded | null) => void;
const DEFAULT_TIME_SKEW = 15

let config: TConfig
let lastAccessToken = ''
let lastAccessTokenDecoded: TDecoded | null;
let refreshPromise: Promise<any> | null = null;

export const Token = {
  configure(options: TConfig = {}) {
    if (!options.refresh) {
      throw new Error('[token] configure: você deve informar a função de refresh!');
    }
    config = { timeSkew: DEFAULT_TIME_SKEW, ...options };

    const {accessToken, refreshToken, accessTokenDecoded} = load()
    if (accessTokenDecoded && jwt.isExpired(accessTokenDecoded.payload.exp, config.timeSkew)) {
      void Token.refresh();
    } else {
      Token.write(accessToken, refreshToken);
    }
  },
  write(newAccessToken: string, newRefreshToken: string) {
    if (!config) {
      throw new Error('token.configure() not initialized!');
    }

    if (!newAccessToken) {
      return Token.clear();
    }

    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);

    const {accessTokenDecoded} = load()
    config.onChange?.(accessTokenDecoded);
  },
  clear() {
    lastAccessToken = ''
    lastAccessTokenDecoded = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    config.onChange?.(null);
  },
  isConfigured() {
    return Boolean(config);
  },
  isLoggedIn() {
    if (!Token.isConfigured()) return false;

    const { accessTokenDecoded } = load();
    if (!accessTokenDecoded) return false;

    return !jwt.isExpired(accessTokenDecoded.payload.exp, config?.timeSkew ?? DEFAULT_TIME_SKEW);
  },
  async read() {
    if (!config) {
      throw new Error('token.configure() not initialized!');
    }

    let {accessToken, accessTokenDecoded} = load()

    // 1. não existe token atual
    if (!accessTokenDecoded) {
      return null;
    }

    // 2. o token existe e não expirou
    const exp = accessTokenDecoded.payload.exp
    if (!jwt.isExpired(exp, config.timeSkew)) {
      return accessToken
    }

    // 3. o token expirou, tenta fazer o refresh
    await Token.refresh();
    return load().accessToken;
  },
  async refresh() {
    if (!config) {
      throw new Error('token.configure() not initialized!');
    }

    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      const { refreshToken } = load();
      if (!refreshToken) {
        return Token.clear();
      }

      const lock = Locker('refresh-token');
      await lock.block(10_000);

      try {
        const result = await config.refresh!(refreshToken);
        this.write(result.accessToken ?? '', result.refreshToken ?? '');
        return result;
      } catch (err) {
        Token.clear();
        throw err;
      } finally {
        lock.release();
      }
    })()
  },
}

function load() {
  const accessToken = localStorage.getItem('accessToken') ?? '';
  const refreshToken = localStorage.getItem('refreshToken') ?? '';

  lastAccessTokenDecoded = lastAccessToken != accessToken ? jwt.decodeOnly(accessToken) : lastAccessTokenDecoded;
  lastAccessToken = accessToken;

  return {
    accessToken,
    refreshToken,
    accessTokenDecoded: lastAccessTokenDecoded
  }
}
