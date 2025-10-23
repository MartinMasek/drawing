import type { ComponentRef } from 'react'
import React, { useEffect, useImperativeHandle, useRef } from 'react'

import { Input, type InputProps } from './Input'

export interface NumberInputProps extends Omit<InputProps, 'value' | 'onChange' | 'onBlur'> {
    value?: number
    defaultInputValue?: string
    onChange?: (value: number) => void
    onInputChange?: (inputValue: string, e: React.ChangeEvent<HTMLInputElement>) => void
    onBlur?: (value: number, e: React.FocusEvent<HTMLInputElement>) => void
}

/**
 * Few caveats:
 * - empty string return 0
 * - other invalid string return last valid number value (e.g. '123a' return 123)
 */
export const NumberInput = React.forwardRef<React.ComponentRef<typeof Input>, NumberInputProps>(
    ({ value, defaultInputValue, onChange, onBlur, onInputChange, ...props }, forwardedRef) => {
        const ref = useRef<ComponentRef<'input'>>(null)
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        useImperativeHandle(forwardedRef, () => ref.current!, [])

        // this is to update the <input> value when the `value` prop changes (by form.setValue() for example)
        useEffect(() => {
            if (ref.current && value !== undefined && value !== null && value !== Number(ref.current.value)) {
                ref.current.value = value.toString()
            }
        }, [value])

        return (
            <Input
                defaultValue={defaultInputValue ?? (value !== undefined && value !== null ? value.toString() : '')}
                onBlur={(e) => {
                    if (e.target.value === '') {
                        onBlur?.(0, e)
                        return
                    }
                    const newParsedInputValue = Number.parseFloat(e.target.value)
                    // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
                    if (!isNaN(newParsedInputValue)) {
                        onBlur?.(newParsedInputValue, e)
                        return
                    }
                }}
                /**
                 * Pattern to allow decimal numbers.
                 * for now only "." as separator is allowed due to `parseFloat()` having the same behavior
                 */
                onChange={(e) => {
                    onInputChange?.(e.target.value, e)
                    if (e.target.value === '') {
                        onChange?.(0)
                        return
                    }
                    const newParsedInputValue = Number.parseFloat(e.target.value)
                    // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
                    if (!isNaN(newParsedInputValue)) {
                        onChange?.(newParsedInputValue)
                        return
                    }
                }}
                pattern='-*[0-9]*([\.][0-9]*)?'
                ref={ref}
                selectOnFocus
                spellCheck={false}
                type='text'
                {...props}
            />
        )
    }
)