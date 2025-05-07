# @koph-npm/browser-locker

> Mutex simples entre abas do navegador usando `localStorage` + `StorageEvent`.

Este utilitário permite coordenar o acesso a recursos compartilhados entre diferentes abas abertas de uma mesma aplicação. Ideal para evitar execuções concorrentes de operações como *refresh token*, *jobs programados*, etc.

---

## 📦 Instalação

```bash
npm install @koph-npm/browser-locker
```

---

## 🚀 Uso básico

```ts
import { Locker } from '@koph-npm/browser-locker';

const tokenLocker = Locker("token-locked");

await tokenLocker.block(5000); // tenta adquirir o lock por 5s
try {
  // seção crítica - apenas uma aba entra aqui
  const data = await fetch("/api/refresh-token").then(r => r.json());
  localStorage.setItem("api_token", data.token);
} finally {
  tokenLocker.release();
}
```

---

## 🧠 API

### `Locker(key: string)`
Retorna um objeto com duas funções:

#### `await block(timeoutMs?: number): Promise<number>`
- Tenta adquirir o lock pela chave fornecida.
- Retorna:
    - `0` se conseguiu imediatamente
    - `1` se aguardou outra aba liberar
    - `2` se expirou o tempo de espera

#### `release(): void`
- Libera o lock imediatamente

---

## ⚠️ Observações

- Usa `localStorage` para persistir o lock entre abas.
- Remove locks expirados automaticamente.
- Não impede concorrência entre **abas diferentes de domínios distintos**.

---

## 📄 Licença

MIT

---

## 👤 Autor

Koph <kophmail@gmail.com>

---

## 🔗 Repositório

[https://github.com/koph-git/ts-lib](https://github.com/koph-git/ts-lib)



