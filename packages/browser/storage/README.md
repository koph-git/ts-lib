# @koph-npm/browser-storage

> Armazenamento seguro e reativo com suporte a `localStorage` e `sessionStorage` + sincronização entre abas.

Este pacote fornece uma interface unificada para acesso a armazenamento no navegador com:

- Prefixo codificado para isolamento de chave
- Opção de criptografia simples (base64 com prefixo aleatório)
- Suporte a `localStorage` e `sessionStorage`
- API `read`/`write` mais segura e flexível
- Proxy reativo via `createStore()` com sincronização automática entre abas

---

## 📦 Instalação

```bash
npm install @koph-npm/browser-storage
```

---

## 🚀 Uso básico

### Classe `Storage`
```ts
import { Storage } from '@koph-npm/browser-storage';

const store = new Storage(true, false, "app");

store.write("user", { name: "Ana" });
console.log(store.read("user")); // { name: "Ana" }
```

### Proxy reativo com `createStore()`
```ts
import { createStore } from '@koph-npm/browser-storage';

const user = createStore("session", { name: "", token: "" });

user.name = "João"; // sincroniza em tempo real com sessionStorage e outras abas
console.log(user.token); // recupera token de forma segura
```

---

## 🧠 API

### `new Storage(encrypt = false, useSession = false, key = '')`
- `encrypt`: ativa ofuscação base64 com prefixo aleatório
- `useSession`: usa `sessionStorage` em vez de `localStorage`
- `key`: prefixo para as chaves

#### Métodos:
- `read(key: string): T | null`
- `write(key: string, value: any): void`
- `getItem(key: string): string | null`
- `setItem(key: string, value: string): void`
- `removeItem(key: string): void`
- `remove(key: string): void`

### `createStore<T>(name: string, obj: T): T`
- Cria um `Proxy` reativo sincronizado com `sessionStorage`

---

## ⚠️ Observações

- A criptografia é apenas uma ofuscação base64 com prefixo aleatório.
- Eventos `storage` mantêm valores sincronizados entre abas.
- Não é recomendada para dados altamente sensíveis.

---

## 📄 Licença

MIT

---

## 👤 Autor

Koph <kophmail@gmail.com>

---

## 🔗 Repositório

[https://github.com/koph-git/ts-lib](https://github.com/koph-git/ts-lib)

