# @koph-npm/browser-cache

> Cache flexível para navegadores com suporte a localStorage, sessionStorage e armazenamento em memória.

`CacheJS` é uma biblioteca que permite armazenar dados temporariamente no navegador com opções de expiração, prefixo customizável, modo seguro e gerenciamento global.

---

## 📦 Instalação

```bash
npm install @koph-npm/browser-cache
```

---

## 🚀 Uso básico

```ts
import { CacheJS } from '@koph-npm/browser-cache';

// Criar uma instância de cache com timeout de 10 minutos usando localStorage
const cache = new CacheJS("user-cache", 10 * 60000, "local");

// Armazenar um valor
cache.set("username", "JohnDoe");

// Recuperar o valor
console.log(cache.get("username")); // "JohnDoe"

// Remover o item
cache.remove("username");

// Desativar o cache globalmente
CacheJS.disable();

// Limpar todos os caches
CacheJS.clearAll();
```

---

## 🧠 API

### Instância

- `new CacheJS(id, timeout, storageType)`
    - `id`: identificador do conjunto de chaves
    - `timeout`: tempo em milissegundos para expiração (padrão: 5 minutos)
    - `storageType`: "local" | "session" | "memory"

#### Métodos

- `cache.get(id, defaultValue?, persistent?)`
- `cache.set(id, value, timeout?)`
- `cache.remove(id)`
- `cache.clear()`
- `cache.key(id)`

### Estáticos

- `CacheJS.setPrefix(value: string)`
- `CacheJS.clearAll()`
- `CacheJS.disable(flag = true)`
- `CacheJS.version(value: string)`

---

## ⚠️ Observações

- `memoryStorage` é volátil e não persiste após reload.
- `CacheJS.disable()` bloqueia todas as operações de leitura/escrita.
- Use `version()` para invalidar cache entre versões da aplicação.

---

## 📄 Licença

MIT

---

## 👤 Autor

Fabio Nogueira <fabio.bacabal@gmail.com>

---

## 🔗 Repositório

[https://github.com/koph-git/ts-lib](https://github.com/koph-git/ts-lib)

