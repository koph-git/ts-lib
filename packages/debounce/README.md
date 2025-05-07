# @koph-npm/debounce

> Função utilitária para debouncing de eventos e chamadas repetidas.

Este pacote fornece uma implementação leve de `debounce`, que adia a execução de uma função até que um intervalo de tempo tenha passado desde sua última invocação. Último evento sempre prevalece.

---

## 📦 Instalação

```bash
npm install @koph-npm/debounce
```

---

## 🚀 Uso básico

```ts
import { debounce } from '@koph-npm/debounce';

function logMessage(msg: string) {
  console.log("Mensagem:", msg);
}

const debouncedLog = debounce(logMessage, 500);

debouncedLog("Olá");
debouncedLog("Mundo");
debouncedLog("Debounce");

// Apenas "Debounce" será impresso após 500ms sem novas chamadas
```

---

## 🧠 API

### `debounce(func: Function, delay: number = 10): Function`

- `func`: Função original a ser controlada
- `delay`: Tempo de espera em milissegundos
- Retorna uma nova função com comportamento debounced

---

## 🔄 Casos de uso

- Inputs de busca/autocomplete
- Scroll e resize intensivos
- Redução de chamadas de API

---

## ⚠️ Observações

- A função debounced **não retorna valor**.
- Se `delay = 0`, retorna a função original sem alterações.

---

## 📄 Licença

MIT

---

## 👤 Autor

Koph <kophmail@gmail.com>

---

## 🔗 Repositório

[https://github.com/koph-git/ts-lib](https://github.com/koph-git/ts-lib)

