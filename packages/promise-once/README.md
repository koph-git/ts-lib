# @koph-npm/promise-once

> Garante que uma promise nomeada seja executada apenas uma vez por chave, mesmo com chamadas concorrentes.

Este utilitário é ideal para cenários onde você deseja evitar chamadas simultâneas duplicadas de uma mesma promise, como requisições para um endpoint ou inicialização de recursos.

---

## 📦 Instalação

```bash
npm install @koph-npm/promise-once
```

---

## 🚀 Uso básico

```ts
import { promiseOnce } from '@koph-npm/promise-once';

async function fetchConfig() {
  return await promiseOnce("config", async () => {
    const res = await fetch("/api/config");
    return await res.json();
  });
}

// Mesmo com chamadas simultâneas, a função será executada uma vez
const [a, b] = await Promise.all([fetchConfig(), fetchConfig()]);
```

---

## 🧠 API

### `promiseOnce<T>(key: string, callback: () => Promise<T>): Promise<T>`

- `key`: Identificador exclusivo da promise
- `callback`: Função que retorna uma promise
- Retorna: Promise resolvida ou rejeitada da execução original

---

## ⚠️ Observações

- A promise é removida do cache após ser resolvida ou rejeitada (`finally`).
- Erros síncronos durante a chamada do `callback()` são tratados corretamente.
- Adequado para uso com `async`/`await`, loaders e caches temporários.

---

## 📄 Licença

MIT

---

## 👤 Autor

Koph <kophmail@gmail.com>

---

## 🔗 Repositório

[https://github.com/koph-git/ts-lib](https://github.com/koph-git/ts-lib)

