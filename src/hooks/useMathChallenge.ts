import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * A lightweight, dependency-free anti-bot check: a short arithmetic
 * question generated client-side. It won't stop a determined attacker, but
 * filters out the generic scripts that submit every form they find,
 * without requiring an external CAPTCHA service or site key.
 */
export function useMathChallenge() {
  const [round, setRound] = useState(0)
  const { a, b } = useMemo(() => ({ a: randomInt(2, 9), b: randomInt(2, 9) }), [round])
  const [answer, setAnswer] = useState('')

  const isValid = answer.trim() !== '' && Number(answer) === a + b

  return {
    question: `¿Cuánto es ${a} + ${b}?`,
    answer,
    onChange: (event: ChangeEvent<HTMLInputElement>) => setAnswer(event.target.value),
    isValid,
    reset: () => {
      setRound((r) => r + 1)
      setAnswer('')
    },
  }
}
