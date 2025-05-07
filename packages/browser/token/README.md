# @koph-npm/browser-token

> Gerenciador de autenticação baseado em JWT com refresh automático e controle entre abas.

Este pacote oferece uma solução completa para gerenciar tokens JWT em SPAs:

- Armazenamento de `accessToken` e `refreshToken`
- Decodificação e validação automática do JWT
- Refresh automático do token quando expira
- Controle de concorrência entre abas com `Locker`
- Callback `onChange` para reagir a mudanças de token
- Suporte a mocks para testes

---

## 📦 Instalação

```bash
npm install @koph-npm/browser-token
```

---

## 🚀 Uso básico

```ts
import { Token } from '@koph-npm/browser-token';

Token.configure({
  refresh: async (refreshToken) => {
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
  timeSkew: 30
});

if (Token.isLoggedIn()) {
  const token = await Token.read();
  fetch("/api/dados", {
    headers: { Authorization: `Bearer ${token}` }
  });
}
```

---

## 🧠 API

### `Token.configure(config: TConfig)`
Inicializa o gerenciador com funções de `refresh`, `onChange`, etc.

### `Token.write(accessToken, refreshToken)`
Armazena os tokens manualmente.

### `Token.read(): Promise<string | null>`
Retorna o `accessToken` atual, atualizando-o se estiver expirado.

### `Token.refresh(): Promise<TSetToken>`
Força a atualização do token usando o `refreshToken`.

### `Token.clear()`
Remove os tokens armazenados.

### `Token.isLoggedIn(): boolean`
Verifica se o token atual é válido.

### `Token.isConfigured(): boolean`
Verifica se o gerenciador foi inicializado.

---

## ⚠️ Observações

- Usa `@koph-npm/browser-jwt` para decodificar/verificar tokens
- Usa `@koph-npm/browser-locker` para evitar refresh concorrente entre abas
- Requer configuração inicial obrigatória com `refresh()`

---

## 📄 Licença

MIT

---

## 👤 Autor

Koph <kophmail@gmail.com>

---

## 🔗 Repositório

[https://github.com/koph-git/ts-lib](https://github.com/koph-git/ts-lib)

