# @koph-npm/react-reactive

> Store reativo leve para React com suporte a múltiplas instâncias e integração direta com componentes.

Este pacote permite criar stores nomeados que compartilham estado entre vários componentes React de forma simples, utilizando `Proxy` e `useState` para reatividade.

---

## 📦 Instalação

```bash
npm install @koph-npm/react-reactive
```

---

## 🚀 Uso básico

```ts
import { createStore, useStore, setStore } from '@koph-npm/react-reactive';

// Definição do store
createStore('user', { name: 'João', age: 30 }, (prop, value) => {
  console.log(`Propriedade "${prop}" mudou para`, value);
});

// Em um componente React
const user = useStore<{ name: string; age: number }>('user');

return <div>{user.name} - {user.age}</div>;

// Atualizando
user.name = 'Maria';
setStore('user', { name: 'Maria', age: 25 });
```

---

## 🧠 API

### `createStore<T>(name: string, target: T, callback?: (prop, value) => void): T`
Cria um novo store nomeado, observando as mudanças por `Proxy`.

### `useStore<T>(name: string): T`
Hook React para conectar-se a um store. Re-renderiza o componente automaticamente ao detectar mudanças.

### `setStore(name: string, partial: Record<string, any>)`
Atualiza uma ou mais propriedades de um store existente.

### `getStore<T>(name: string): T`
Acessa o store diretamente sem reatividade.

---

## ⚠️ Observações

- Cada store possui um conjunto de observadores (`$observers`) internos.
- O mecanismo é baseado em `Proxy`, garantindo reatividade automática.
- Evita trigger redundante com debounce interno.
- Ideal para SPAs pequenas/médias que precisam compartilhar estado leve.

---

## ⚖️ Comparação com Zustand

| Recurso                           | `@koph-npm/react-reactive`            | Zustand                             |
|----------------------------------|----------------------------------------|--------------------------------------|
| 🧩 API declarativa               | Sim (createStore/useStore/setStore)   | Sim (create + useStore hook)         |
| 🔄 Reatividade via Proxy         | Sim                                    | Não (usa hooks com shallow diff)     |
| 🔁 Sincronização automática      | Sim (entre múltiplos observers)        | Opcional (com middleware/custom)     |
| 🚫 Dependências externas         | Nenhuma                                | Nenhuma                              |
| 📦 Tamanho                      | Muito pequeno (~1KB)                   | Pequeno (~1.1KB gzip)                |
| 📍 Seletores de estado           | Não                                    | Sim (parciais com `useStore(selector)`) |
| 🧪 Testes                        | Fácil via mocks direto no objeto       | Sim, com hook wrappers               |


## ⚖️ Comparação com Redux

| Recurso                     | `@koph-npm/react-reactive`       | Redux                            |
|----------------------------|-----------------------------------|----------------------------------|
| 🧠 Filosofia               | Reatividade direta via Proxy      | Fluxo unidirecional + reducers   |
| 🛠 Configuração            | Nenhuma                           | Verbosa (actions, reducers, etc) |
| 🧩 Escopo                  | Local ou global por nome          | Global e centralizado            |
| 📦 Tamanho                | Muito pequeno (~1KB)              | Médio (~6KB core + libs extras)  |
| 🧪 Testes                 | Fácil com mocks diretos           | Sim, mas requer mais estrutura   |
| 🧰 Middleware             | Não necessário                    | Sim (thunk, saga, etc.)          |
| 🔁 Reatividade automática | Sim (Proxy + hooks)               | Não (depende de dispatch)        |


## 📄 Licença

MIT

---

## 👤 Autor

Fábio Nogueira <fabio.bacabal@gmail.com>

---

## 🔗 Repositório

[https://github.com/koph-git/ts-lib](https://github.com/koph-git/ts-lib)

