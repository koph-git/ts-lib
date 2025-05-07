/**
 * reactive.ts
 * @version 1.0.0
 * @author Fábio Nogueira <fabio.bacabal@gmail.com>
 *
 * Sistema de store reativo simples para React com suporte a múltiplas instâncias nomeadas.
 *
 * Este módulo permite:
 * - Criar um store nomeado com `createStore`
 * - Compartilhar estado entre múltiplos componentes com `useStore`
 * - Observar e reagir a mudanças de propriedades com `Proxy`
 * - Notificar mudanças para os componentes via `$observers`
 * - Atualizar múltas propriedades com `setStore`
 *
 * Exemplo de uso:
 *
 * // Definição do store
 * createStore('user', { name: 'João', age: 30 }, (prop, value) => {
 *   console.log(`Propriedade "${prop}" mudou para`, value)
 * })
 *
 * // Uso dentro de um componente React
 * const user = useStore<{ name: string, age: number }>('user')
 *
 * return <div>{user.name} - {user.age}</div>
 *
 * // Atualizando o store externamente
 * user.name = 'Maria'
 * // ou
 * setStore('user', { name: 'Maria', age: 25 })
 *
 * Observações:
 * - A reatividade funciona via `Proxy`, então `store.prop = x` dispara os observadores.
 * - `useStore` causa re-render do componente sempre que qualquer prop do store for alterada.
 * - Para evitar múltiplos triggers em updates em sequência, considere implementar batching.
 */

import { useCallback, useEffect, useState } from 'react'

type TFunction = () => void
type TSetValue = (_prop: string, _value: unknown) => void
type TObservable = {
  $observers: Record<string, TFunction>
}

const stores: Record<string, Record<string, unknown>> = {}
let KEY = 0

export function createStore<T>(name: string, target: T, callback: null | TSetValue = null) {
  ;(target as TObservable).$observers = {}

  let tm: NodeJS.Timeout

  function debounce(fn: () => void) {
    clearTimeout(tm)
    tm = setTimeout(() => fn(), 1)
  }

  stores[name] = new Proxy(target as Record<string, unknown>, {
    set(obj, prop, value) {
      const old = obj[prop as string]
      const changed = old !== value;
      obj[prop as string] = value

      if (changed) {
        debounce(() => {
          callback?.(prop as string, value)
          Object.values((obj as TObservable).$observers).forEach(fn => fn())
        })
      }

      return true
    },
  })

  return stores[name]
}

export function useStore<T>(name: string) {
  const proxy = stores[name]
  const [value, setValue] = useState(0)
  const onChange = useCallback(() => {
    setValue((v) => v + 1)
  }, [value])

  useEffect(() => {
    const key = KEY++
    ;(proxy as TObservable).$observers[key] = onChange

    return () => {
      delete (proxy as TObservable).$observers[key]
    }
    // eslint-disable-next-line
  }, [onChange, proxy])

  return proxy as T
}

export function getStore<T>(name: string) {
  return stores[name] as T
}

export function setStore(name: string, value: Record<string, unknown>) {
  const store: Record<string, unknown> = stores[name]

  if (store) {
    Object.entries(value).forEach(([k, v]) => {
      store[k] = v
    })
  }
}
