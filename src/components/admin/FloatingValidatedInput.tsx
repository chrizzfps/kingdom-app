import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';

interface Rules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

interface Props {
  label: string;
  value: string;
  onChange: (val: string) => void;
  rules?: Rules;
  type?: string;
  placeholder?: string;
  helper?: string;
}

export function FloatingValidatedInput({ label, value, onChange, rules, type = 'text', placeholder = '', helper }: Props) {
  const [error, setError] = useState<string | null>(null);

  const validate = useMemo(() => {
    return (val: string) => {
      if (rules?.required && !val.trim()) return 'Este campo es obligatorio';
      if (rules?.minLength && val.length < rules.minLength) return `Mínimo ${rules.minLength} caracteres`;
      if (rules?.maxLength && val.length > rules.maxLength) return `Máximo ${rules.maxLength} caracteres`;
      if (rules?.pattern && !rules.pattern.test(val)) return 'Formato inválido';
      return null;
    };
  }, [rules]);

  useEffect(() => {
    setError(validate(value));
  }, [value, validate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    onChange(v);
    setError(validate(v));
  };

  return (
    <div className="relative">
      <Input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder || ' '}
        aria-invalid={!!error}
        className={`peer ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
      />
      <span
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-200
                   peer-focus:top-1 peer-focus:text-xs peer-focus:text-foreground
                   peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm
                   peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:text-xs"
      >
        {label}
      </span>
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  );
}
