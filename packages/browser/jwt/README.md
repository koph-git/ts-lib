# @koph-npm/browser-jwt

> Utilitários para manipulação de JWTs no navegador, com suporte a validação de expiração e geração simplificada.

Este pacote oferece funções para decodificar, verificar validade e gerar JSON Web Tokens (JWT) diretamente no navegador, sem dependências externas.

---

## 📦 Instalação

```bash
npm install @koph-npm/browser-jwt
```

---

## 🚀 Uso básico

```ts
import { jwt } from '@koph-npm/browser-jwt';

const token = jwt.encode({ user: 'john' });

const decoded = jwt.decode(token);
console.log(decoded.payload.user); // "john"
```

---

## 🧠 API

### `jwt.decodeOnly(token: string): TDecoded | null`
Decodifica o JWT (header + payload), sem verificar validade. Retorna `null` se malformado.

### `jwt.decode(token: string, timeSkew = 15): TDecoded`
Decodifica e valida o token (verifica expiração). Lança `JsonWebTokenError` ou `TokenExpiredError` se inválido.

### `jwt.encode(data: object, lifeSpan = 5): string`
Gera um JWT simples (sem assinatura) com tempo de vida definido em minutos.

### `jwt.verify(decoded: TDecoded, timeSkew = 15): TDecoded`
Verifica validade de um token decodificado (baseado na propriedade `exp`).

### `jwt.isExpired(exp: number, timeSkew = 15): boolean`
Retorna `true` se o token estiver expirado.

---

## ⚠️ Observações

- Este JWT é não assinado (alg: "none") e deve ser usado apenas em ambientes controlados (ex.: testes).
- A verificação de expiração suporta tolerância configurável (`timeSkew`).
- Em ambiente de desenvolvimento (`NODE_ENV=development`), é possível forçar a expiração com `localStorage.setItem('jwtExpired', '1')`.

---

## 📄 Licença

MIT

---

## 👤 Autor

Koph <kophmail@gmail.com>

---

## 🔗 Repositório

[https://github.com/koph-git/ts-lib](https://github.com/koph-git/ts-lib)

