import { useState } from 'react'
import type { ChangeEvent } from 'react'

/**
 * A decoy field real visitors never see or fill (see HONEYPOT_STYLE in
 * ../utils/honeypotStyle). Simple scripted bots that blindly fill every
 * input in a <form> populate it too, which marks the submission as spam
 * without requiring any external CAPTCHA service.
 */
export function useHoneypot() {
  const [value, setValue] = useState('')

  return {
    value,
    onChange: (event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value),
    isSuspicious: value.trim() !== '',
    reset: () => setValue(''),
  }
}
