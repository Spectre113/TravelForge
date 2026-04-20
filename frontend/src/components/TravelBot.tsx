import React, { useEffect, useMemo, useRef, useState } from 'react'
import { apiService } from '../services/api'
import { City, BudgetBreakdown } from '../types'
import { useBudget } from '../context/BudgetContext'

export default function TravelBot({ city }: { city?: City }) {
  const [q, setQ] = useState('')
  const [a, setA] = useState('Я готов помогать с вашими планами!')
  const [loading, setLoading] = useState(false)
  const { params, adjusted, setAdjusted } = useBudget() as any
  const prevAdjustRef = useRef<BudgetBreakdown | null>(null)
  const debTimer = useRef<number | null>(null)
  const greetedCityRef = useRef<string | null>(null)
  const touchedKeysRef = useRef<Set<'flights'|'lodging'|'food'|'local'|'buffer'>>(new Set())
  const chatHistoryRef = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([])

  const formatAnswer = (text: string) => {
    let formatted = text
    
    formatted = formatted.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
    formatted = formatted.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
    formatted = formatted.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
    formatted = formatted.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>')
    formatted = formatted.replace(/(<\/h[1-4]>)<br>/gi, '$1')
    formatted = formatted.replace(/\n/g, '<br>')
    
    return formatted
  }

  const contextCity = useMemo(() => {
    return city ? { name: city.name, country: city.country } : undefined
  }, [city])

  const handleAsk = async (question?: string) => {
    const questionText = question || q
    if (!questionText.trim()) return

    setLoading(true)
    try {
      // Добавляем вопрос в историю
      chatHistoryRef.current.push({ role: 'user', content: questionText })
      
      const response = await apiService.askTravelBot({
        question: questionText,
        origin: params.origin,
        city: contextCity,
        country: contextCity?.country,
        budget: params.budget,
        budgetBreakdown: adjusted,
        preferences: {
          culture: params.prefCulture,
          nature: params.prefNature,
          party: params.prefParty,
        },
        startDate: params.startDate,
        endDate: params.endDate,
      })
      
      // Добавляем ответ в историю
      chatHistoryRef.current.push({ role: 'assistant', content: response.answer })
      
      setA(response.answer)
      if (!question) setQ('') // Очищаем поле ввода только если это был вопрос из поля ввода
    } catch (error) {
      console.error('Failed to get answer:', error)
      setA('Извините, произошла ошибка при получении ответа.')
    } finally {
      setLoading(false)
    }
  }

  const handleRebalanceFromChat = async () => {
    if (!chatHistoryRef.current.length) {
      setA('Сначала проведите диалог с ботом, чтобы он мог предложить перераспределение бюджета на основе вашего общения.')
      return
    }

    setLoading(true)
    try {
      // Формируем контекст чата из последних сообщений
      const recentMessages = chatHistoryRef.current.slice(-6) // Последние 6 сообщений (3 пары вопрос-ответ)
      const chatContext = recentMessages
        .map(msg => `${msg.role === 'user' ? 'Пользователь' : 'Ассистент'}: ${msg.content}`)
        .join('\n\n')

      // Определяем, какие категории были затронуты в чате
      const chatText = chatContext.toLowerCase()
      const lock: Array<'flights' | 'lodging' | 'food' | 'local' | 'buffer'> = []
      
      // Если пользователь явно не упоминал категорию, она может быть изменена
      if (!/(перелет|билет|avia|flight|рейс)/.test(chatText)) lock.push('flights')
      if (!/(жиль|отел|гостиниц|apartment|отель|размещен)/.test(chatText)) lock.push('lodging')
      if (!/(еда|ресторан|кухн|food|restaurant|cuisine|питание)/.test(chatText)) lock.push('food')
      if (!/(экскурс|развлечен|активност|местн|транспорт|музей|park|парк|достопримечатель)/.test(chatText)) lock.push('local')
      if (!/(резерв|страхов|непредвиден|запас)/.test(chatText)) lock.push('buffer')

      const result = await apiService.rebalanceBudget({
        budget: params.budget,
        current: adjusted,
        lock: lock.length > 0 ? lock : [],
        city: contextCity,
        preferences: {
          culture: params.prefCulture,
          nature: params.prefNature,
          party: params.prefParty,
        },
        chatContext: chatContext,
      })

      // Округляем проценты до целых чисел
      const roundedBreakdown = {
        flights: Math.round(result.breakdown.flights),
        lodging: Math.round(result.breakdown.lodging),
        food: Math.round(result.breakdown.food),
        local: Math.round(result.breakdown.local),
        buffer: Math.round(result.breakdown.buffer),
      }
      // Нормализуем сумму до 100
      const sum = roundedBreakdown.flights + roundedBreakdown.lodging + roundedBreakdown.food + roundedBreakdown.local + roundedBreakdown.buffer
      if (sum !== 100) {
        const diff = 100 - sum
        roundedBreakdown.buffer = Math.max(0, roundedBreakdown.buffer + diff)
      }
      
      // Обновляем ползунки
      setAdjusted(roundedBreakdown)

      // Формируем ответ от бота о перераспределении
      const breakdownText = `Перелёты: ${roundedBreakdown.flights}%, Жильё: ${roundedBreakdown.lodging}%, Еда: ${roundedBreakdown.food}%, Местное: ${roundedBreakdown.local}%, Резерв: ${roundedBreakdown.buffer}%`
      
      const rebalanceMessage = `Я проанализировал наш диалог и перераспределил бюджет:\n\n${breakdownText}\n\nБюджет обновлён! Теперь вы можете скорректировать ползунки вручную или продолжить общение.`
      
      chatHistoryRef.current.push({ role: 'assistant', content: rebalanceMessage })
      setA(rebalanceMessage)
    } catch (error) {
      console.error('Failed to rebalance:', error)
      setA('Извините, произошла ошибка при перераспределении бюджета.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const prev = prevAdjustRef.current
    prevAdjustRef.current = adjusted
    if (!prev) return

    const keys: Array<keyof BudgetBreakdown> = ['flights', 'lodging', 'food', 'local', 'buffer']
    const changedKey = keys.find((k) => prev[k] !== adjusted[k])
    if (!changedKey) return

    const evt = {
      key: changedKey as 'flights' | 'lodging' | 'food' | 'local' | 'buffer',
      oldValue: prev[changedKey],
      newValue: adjusted[changedKey],
    }
    touchedKeysRef.current.add(evt.key)

    const genQuestion = (k: typeof evt.key, oldV: number, newV: number) => {
      const dir = newV > oldV ? 'увеличил' : 'уменьшил'
      switch (k) {
        case 'food':
          return `Пользователь ${dir} долю на Еда c ${oldV}% до ${newV}%. Предложи конкретные рестораны, рынки и блюда в этом городе.`
        case 'lodging':
          return `Пользователь ${dir} долю на Жильё c ${oldV}% до ${newV}%. Дай варианты размещения с учётом изменения бюджета.`
        case 'flights':
          return `Пользователь ${dir} долю на Перелёты c ${oldV}% до ${newV}%. Подскажи, как оптимизировать перелёты/на что обратить внимание.`
        case 'local':
          return `Пользователь ${dir} долю на Местное c ${oldV}% до ${newV}%. Предложи локальные активности, транспорт и развлечения.`
        case 'buffer':
          return `Пользователь ${dir} долю на Резерв c ${oldV}% до ${newV}%. Дай советы по резерву и страхованию.`
      }
    }

    const question = genQuestion(evt.key, evt.oldValue, evt.newValue)
    if (!question) return

    if (debTimer.current) window.clearTimeout(debTimer.current)
    debTimer.current = window.setTimeout(async () => {
      try {
        setLoading(true)
        const response = await apiService.askTravelBot({
          question,
          origin: params.origin,
          city: contextCity,
          country: contextCity?.country,
          budget: params.budget,
          budgetBreakdown: adjusted,
          preferences: {
            culture: params.prefCulture,
            nature: params.prefNature,
            party: params.prefParty,
          },
          changeEvent: evt,
          startDate: params.startDate,
          endDate: params.endDate,
        })
        // Добавляем в историю
        chatHistoryRef.current.push({ role: 'user', content: question })
        chatHistoryRef.current.push({ role: 'assistant', content: response.answer })
        setA(response.answer)
      } catch (e) {
      } finally {
        setLoading(false)
      }
    }, 500)
  }, [adjusted, contextCity, params.budget, params.prefCulture, params.prefNature, params.prefParty, params.origin, params.startDate, params.endDate])

  useEffect(() => {
    if (!city) return
    if (greetedCityRef.current === city.id) return
    greetedCityRef.current = city.id
    // Сбрасываем историю чата при смене города
    chatHistoryRef.current = []
    const question = `Составь короткое приветственное сообщение для путешественника в городе ${city.name}. Встрои 3-5 персональных рекомендаций, учитывая предпочтения: культура ${params.prefCulture}%, природа ${params.prefNature}%, ночная жизнь ${params.prefParty}%.`
    ;(async () => {
      try {
        setLoading(true)
        const response = await apiService.askTravelBot({
          question,
          origin: params.origin,
          city: contextCity,
          country: contextCity?.country,
          budget: params.budget,
          budgetBreakdown: adjusted,
          preferences: {
            culture: params.prefCulture,
            nature: params.prefNature,
            party: params.prefParty,
          },
          startDate: params.startDate,
          endDate: params.endDate,
        })
        // Добавляем в историю приветствие
        chatHistoryRef.current.push({ role: 'assistant', content: response.answer })
        setA(response.answer)
      } catch {
      } finally {
        setLoading(false)
      }
    })()
  }, [city, contextCity, params.prefCulture, params.prefNature, params.prefParty, params.budget, adjusted, params.origin, params.startDate, params.endDate])

  return (
    <div className="card travel-bot-card">
      <div className="label" style={{ textAlign: 'center', fontSize: '1.125rem' }}>TravelBot</div>
      <textarea
        className="input textarea"
        rows={3}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Подскажи лучшие идеи для моей поездки"
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button
          className="btn"
          onClick={() => handleAsk()}
          disabled={loading}
        >
          {loading ? 'Загрузка...' : 'Спросить'}
        </button>
        <button
          className="btn btn--outline"
          disabled={loading}
          onClick={async () => {
            setLoading(true)
            try {
              // Блокируем все категории, которые пользователь изменял вручную
              const lock = Array.from(touchedKeysRef.current) as Array<'flights' | 'lodging' | 'food' | 'local' | 'buffer'>
              
              const chatContext = chatHistoryRef.current.length > 0
                ? chatHistoryRef.current.slice(-4).map(msg => `${msg.role === 'user' ? 'Пользователь' : 'Ассистент'}: ${msg.content}`).join('\n\n')
                : ''

              const result = await apiService.rebalanceBudget({
                budget: params.budget,
                current: adjusted,
                lock: lock.length > 0 ? lock : [],
                city: contextCity,
                preferences: {
                  culture: params.prefCulture,
                  nature: params.prefNature,
                  party: params.prefParty,
                },
                chatContext: chatContext,
              })

              // Округляем проценты до целых чисел
              const roundedBreakdown = {
                flights: Math.round(result.breakdown.flights),
                lodging: Math.round(result.breakdown.lodging),
                food: Math.round(result.breakdown.food),
                local: Math.round(result.breakdown.local),
                buffer: Math.round(result.breakdown.buffer),
              }
              // Нормализуем сумму до 100
              const sum = roundedBreakdown.flights + roundedBreakdown.lodging + roundedBreakdown.food + roundedBreakdown.local + roundedBreakdown.buffer
              if (sum !== 100) {
                const diff = 100 - sum
                roundedBreakdown.buffer = Math.max(0, roundedBreakdown.buffer + diff)
              }

              // Обновляем ползунки
              setAdjusted(roundedBreakdown)

              const breakdownText = `Перелёты: ${roundedBreakdown.flights}%, Жильё: ${roundedBreakdown.lodging}%, Еда: ${roundedBreakdown.food}%, Местное: ${roundedBreakdown.local}%, Резерв: ${roundedBreakdown.buffer}%`
              const message = `Я перераспределил проценты бюджета, сохранив ваши выборы:\n\n${breakdownText}\n\nБюджет обновлён!`
              
              chatHistoryRef.current.push({ role: 'assistant', content: message })
              setA(message)
            } catch (error) {
              console.error('Failed to rebalance:', error)
              setA('Извините, произошла ошибка при перераспределении бюджета.')
            } finally {
              setLoading(false)
            }
          }}
        >Переформировать проценты</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <button
          className="btn btn--outline"
          disabled={loading}
          onClick={handleRebalanceFromChat}
        >Переформировать бюджет на основе чата</button>

        {city && (
          <button
            className="btn btn--outline"
            disabled={loading}
            onClick={() => {
              handleAsk('Подскажи лучшие варианты авиабилетов для моей поездки')
            }}
          >Поиск билетов</button>
        )}
      </div>
      <div style={{ marginTop: 12, padding: '12px', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', whiteSpace: 'pre-wrap', height: '550px', overflowY: 'auto' }} dangerouslySetInnerHTML={{ __html: formatAnswer(a) }}></div>
    </div>
  )
}
