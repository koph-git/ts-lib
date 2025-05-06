
export type TDecoded<T = Record<string, any>> = {
  header: {
    alg: string
  }
  payload: T & {
    exp: number
  }
  additional: any
}

export class TokenExpiredError extends Error {}
export class JsonWebTokenError extends Error {}

export const jwt = {
  /**
   * Decodifica apenas o payload e o header de um JWT, sem verificar sua validade.
   * @param token - O token JWT a ser decodificado.
   * @returns Um objeto contendo `header` e `payload`, ou `null` se o token for inválido.
   */
  decodeOnly<T = Record<string, any>>(token: string): TDecoded<T> | null {
    try {
      const arr = token.split('.');
      if (arr.length < 2) {
        return null; // JWT deve ter pelo menos header e payload
      }

      const headerPart = arr[0].includes(' ') ? arr[0].split(' ')[1] : arr[0]; // Suporte para "Bearer <token>"
      return {
        header: JSON.parse(atob(headerPart)),
        payload: JSON.parse(atob(arr[1])),
        additional: arr[3] ?? null,
      };
    } catch (err) {
      return null;
    }
  },

  /**
   * Decodifica e verifica a validade de um JWT.
   * @param token - O token JWT a ser decodificado.
   * @param timeSkew - Tempo de tolerância em segundos para expiração.
   * @returns O token decodificado se for válido.
   * @throws {JsonWebTokenError} Se o token for inválido.
   * @throws {TokenExpiredError} Se o token estiver expirado.
   */
  decode<T = Record<string, any>>(token: string, timeSkew: number = 15): TDecoded<T> {
    const decoded = jwt.decodeOnly(token);

    if (!decoded) {
      throw new JsonWebTokenError('JWT malformado.');
    }

    return jwt.verify<T>(decoded, timeSkew);
  },

  /**
   * Gera um JWT simples sem assinatura (apenas para testes e uso em ambiente controlado).
   * @param data - Dados a serem incluídos no payload.
   * @param lifeSpan - Tempo de vida do token em minutos (padrão: 5 min).
   * @returns O token gerado.
   */
  encode(data: Record<string, unknown>, lifeSpan = 5): string {
    const now = new Date();
    const header = JSON.stringify({
      alg: 'none', // Indica que não há assinatura (uso apenas para testes)
      typ: 'JWT',
      kid: 'p_Z3Jjl1c5gX8JPSiP3rxRA7cOX',
    });

    now.setMinutes(now.getMinutes() + lifeSpan);
    const payload = JSON.stringify({
      ...data,
      rnd: Math.random(),
      exp: Math.trunc(now.valueOf() / 1000), // Define a expiração em segundos
    });

    return `${btoa(header)}.${btoa(payload)}.${btoa('signature')}`;
  },

  /**
   * Verifica se um token decodificado é válido e não está expirado.
   * @param decoded - O token decodificado.
   * @param timeSkew - Tempo de tolerância em segundos para expiração.
   * @returns O token decodificado se for válido.
   * @throws {JsonWebTokenError} Se o token for malformado.
   * @throws {TokenExpiredError} Se o token estiver expirado.
   */
  verify<T = Record<string, any>>(decoded: TDecoded, timeSkew: number = 15): TDecoded<T> {
    if (!decoded.payload.exp) {
      throw new JsonWebTokenError('JWT inválido: falta a propriedade "exp" ou está malformada.');
    }

    if (jwt.isExpired(decoded.payload.exp, timeSkew)) {
      throw new TokenExpiredError('JWT expirado.');
    }

    return decoded as TDecoded<T>;
  },

  /**
   * Verifica se um JWT está expirado, considerando um tempo de tolerância (timeSkew).
   * @param exp - Timestamp de expiração do token (em segundos).
   * @param timeSkew - Tempo de tolerância em segundos.
   * @returns `true` se o token estiver expirado, `false` caso contrário.
   */
  isExpired(exp: number, timeSkew: number | null = 15): boolean {
    if (exp <= 0) {
      throw new JsonWebTokenError('Valor de "exp" inválido no JWT.');
    }

    const now = new Date();
    now.setSeconds(now.getSeconds() + (timeSkew ?? 0)); // Adiciona tolerância

    // Em ambiente de desenvolvimento, permite forçar a expiração do token via localStorage.
    if (process.env.NODE_ENV === 'development' && localStorage.getItem('jwtExpired')) {
      console.warn('JWT expirado (forçado pelo ambiente de desenvolvimento).');
      localStorage.removeItem('jwtExpired');
      return true;
    }

    return now >= new Date(exp * 1000);
  },
};
