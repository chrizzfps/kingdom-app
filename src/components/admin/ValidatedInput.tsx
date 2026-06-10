import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
  placeholder?: string;
  multiline?: boolean;
}

export function ValidatedInput({ label, value, onChange, rules, placeholder, multiline }: Props) {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value;
    onChange(v);
    setError(validate(v));
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {multiline ? (
        <Textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          aria-invalid={!!error}
          className={error ? 'border-destructive focus-visible:ring-destructive' : undefined}
        />
      ) : (
        <Input
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          aria-invalid={!!error}
          className={error ? 'border-destructive focus-visible:ring-destructive' : undefined}
        />
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
