import type React from 'react'

import { cn } from '~/utils/ui-utils'

export interface InputProps extends React.ComponentProps<'input'> {
    /**
     * Size of the input
     */
    inputSize?: 'sm' | 'md'
    /**
     * Icons (or whatever) that will be displayed on the left side of the input
     */
    startAdornment?: React.ReactNode
    /**
     * Icons (or whatever) that will be displayed on the right side of the input
     */
    endAdornment?: React.ReactNode
    /**
     * If true, the input will be in error state
     */
    error?: boolean
    /**
     * If true selects the text in the input when it is focused (clicked on)
     */
    selectOnFocus?: boolean
    /**
     * @deprecated
     * In past used to position label differently - now `form-new/Form` components should be used
     */
    isHorizontalLayout?: boolean
    isLoading?: boolean
    fullWidth?: boolean
}

/**
 * Styled <input/> - should not be used on its own but through `TextField`
 * Should not contain any logic
 */
export function Input({
    inputSize = 'md',
    startAdornment,
    endAdornment,
    error,
    selectOnFocus,
    onFocus,
    isHorizontalLayout,
    isLoading,
    className,
    disabled,
    fullWidth,
    ...props
}: InputProps) {
    return (
        <div className={cn("relative flex items-center rounded-md", fullWidth ? 'w-full' : 'w-[140px]', isHorizontalLayout && 'w-[120px]')}>
            <input
                aria-invalid={error ? 'true' : 'false'}
                className={cn(
                    'w-full rounded-lg border border-border-input-default bg-background-input-default px-[14px] py-[9px] text-text-input-filled shadow-none transition-shadow placeholder:text-text-input-placeholder hover:bg-background-input-hoverActive focus:border-border-input-active focus:shadow-general-focus focus:outline-none dark:focus:shadow-general-focus-dark',
                    error &&
                    'border-border-input-error transition-colors hover:border-border-input-error focus:border-border-input-error focus:shadow-error-focus focus:outline-none dark:focus:shadow-error-focus-dark',
                    disabled && '!border-border-input-disabled !bg-background-input-disabled !text-text-neutral-disabled',
                    inputSize === 'md' ? 'h-11 text-base' : 'h-9 text-sm',
                    className,
                    startAdornment && 'pl-8',
                    endAdornment && 'pr-8',
                    isLoading && '!text-transparent cursor-not-allowed'
                )}
                disabled={!!disabled || !!isLoading}
                onFocus={
                    selectOnFocus
                        ? (e) => {
                            e.target.select()
                            onFocus?.(e)
                        }
                        : onFocus
                }
                {...props}
            />
            {startAdornment && (
                <div className={`absolute left-2 my-auto ${inputSize === 'sm' ? 'text-sm' : 'text-base'}`}>{startAdornment}</div>
            )}
            {endAdornment && (
                <div className={`absolute right-3 my-auto ${inputSize === 'sm' ? 'text-sm' : 'text-base'}`}>{endAdornment}</div>
            )}
        </div>
    )
}
