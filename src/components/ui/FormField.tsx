import { cn } from '@/lib/cn'

const inputBase =
  'w-full rounded-xl border border-line bg-surface-raised px-4 py-2.5 text-ink transition-colors placeholder:text-taupe/70 focus:border-deep-teal focus:outline-2 focus:outline-offset-0 focus:outline-deep-teal/20 disabled:opacity-50'

type BaseProps = {
  label: string
  name: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
}

function FieldWrap({
  label,
  name,
  hint,
  error,
  required,
  className,
  children,
}: BaseProps & { children: React.ReactNode }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={name} className="text-sm font-semibold text-deep-teal">
        {label}
        {required && <span className="ms-1 text-burgundy">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-burgundy" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-taupe">{hint}</p>
      ) : null}
    </div>
  )
}

type InputProps = BaseProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'className'>

export function FormField({ label, name, hint, error, required, className, ...input }: InputProps) {
  return (
    <FieldWrap label={label} name={name} hint={hint} error={error} required={required} className={className}>
      <input
        id={name}
        name={name}
        required={required}
        aria-invalid={!!error}
        className={cn(inputBase, error && 'border-burgundy/60')}
        {...input}
      />
    </FieldWrap>
  )
}

type TextareaProps = BaseProps & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name' | 'className'>

export function FormTextarea({ label, name, hint, error, required, className, ...textarea }: TextareaProps) {
  return (
    <FieldWrap label={label} name={name} hint={hint} error={error} required={required} className={className}>
      <textarea
        id={name}
        name={name}
        required={required}
        aria-invalid={!!error}
        rows={4}
        className={cn(inputBase, 'resize-y', error && 'border-burgundy/60')}
        {...textarea}
      />
    </FieldWrap>
  )
}

type SelectProps = BaseProps & {
  options: Array<{ value: string; label: string }>
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'name' | 'className'>

export function FormSelect({ label, name, hint, error, required, className, options, ...select }: SelectProps) {
  return (
    <FieldWrap label={label} name={name} hint={hint} error={error} required={required} className={className}>
      <select
        id={name}
        name={name}
        required={required}
        aria-invalid={!!error}
        className={cn(inputBase, 'appearance-none', error && 'border-burgundy/60')}
        {...select}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldWrap>
  )
}
