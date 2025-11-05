import type { ComponentRef } from 'react'
import React, { useEffect, useImperativeHandle, useRef } from 'react'

import { Input, type InputProps } from './Input'

export interface NumberInputProps extends Omit<InputProps, 'value' | 'onChange' | 'onBlur'> {
    value?: number
    defaultInputValue?: string
    min?: number
    max?: number
    onChange?: (value: number) => void
    onInputChange?: (inputValue: string, e: React.ChangeEvent<HTMLInputElement>) => void
    onBlur?: (value: number, e: React.FocusEvent<HTMLInputElement>) => void
    onlyPositive?: boolean
}

/**
 * Few caveats:
 * - empty string return 0
 * - invalid characters are filtered out during typing
 * - values are clamped to min/max on change
 */
export const NumberInput = React.forwardRef<React.ComponentRef<typeof Input>, NumberInputProps>(
    ({ value, defaultInputValue, min, max, onChange, onBlur, onInputChange, onlyPositive, ...props }, forwardedRef) => {
        const ref = useRef<ComponentRef<'input'>>(null)
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        useImperativeHandle(forwardedRef, () => ref.current!, [])

        // this is to update the <input> value when the `value` prop changes (by form.setValue() for example)
        useEffect(() => {
            if (ref.current && value !== undefined && value !== null && value !== Number(ref.current.value)) {
                ref.current.value = value.toString()
            }
        }, [value])

        // Filter input to only allow valid numeric characters
        const sanitizeInput = (inputValue: string): string => {
            // Allow empty string
            if (inputValue === '') return ''

            // Allow minus sign only at the start
            let sanitized = inputValue
            if (!onlyPositive && sanitized.startsWith('-')) {
                sanitized = `-${sanitized.slice(1).replace(/[^0-9.]/g, '')}`
            } else {
                sanitized = sanitized.replace(/[^0-9.]/g, '').replace(/^0+/, '')
            }

            // Allow only one decimal point
            const parts = sanitized.split('.')
            if (parts.length > 2) {
                sanitized = `${parts[0]}.${parts.slice(1).join('')}`
            }

            return sanitized
        }

        // Clamp value to min/max bounds
        const clampValue = (num: number): number => {
            if (min !== undefined && num < min) return min
            if (max !== undefined && num > max) return max
            return num
        }

        return (
            <Input
                defaultValue={defaultInputValue ?? (value !== undefined && value !== null ? value.toString() : '')}
                onBlur={(e) => {
                    const sanitized = sanitizeInput(e.target.value)
                    if (sanitized !== e.target.value) {
                        e.target.value = sanitized
                    }

                    if (sanitized === '' || sanitized === '-') {
                        const clampedValue = clampValue(0)
                        e.target.value = clampedValue.toString()
                        onBlur?.(clampedValue, e)
                        return
                    }
                    const newParsedInputValue = Number.parseFloat(sanitized)
                    // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
                    if (!isNaN(newParsedInputValue)) {
                        const clampedValue = clampValue(newParsedInputValue)
                        if (clampedValue !== newParsedInputValue) {
                            e.target.value = clampedValue.toString()
                        }
                        onBlur?.(clampedValue, e)
                        return
                    }
                }}
                onChange={(e) => {
                    const sanitized = sanitizeInput(e.target.value)
                    if (sanitized !== e.target.value) {
                        e.target.value = sanitized
                    }

                    onInputChange?.(sanitized, e)

                    if (sanitized === '' || sanitized === '-') {
                        const clampedValue = clampValue(0)
                        if (clampedValue !== 0) {
                            e.target.value = clampedValue.toString()
                        }
                        onChange?.(clampedValue)
                        return
                    }
                    const newParsedInputValue = Number.parseFloat(sanitized)
                    // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
                    if (!isNaN(newParsedInputValue)) {
                        const clampedValue = clampValue(newParsedInputValue)
                        if (clampedValue !== newParsedInputValue) {
                            e.target.value = clampedValue.toString()
                        }
                        onChange?.(clampedValue)
                        return
                    }
                }}
                pattern='-?[0-9]*([\.][0-9]*)?'
                ref={ref}
                selectOnFocus
                spellCheck={false}
                type='text'
                {...props}
            />
        )
    }
)