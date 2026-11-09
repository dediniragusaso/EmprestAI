import { useEffect } from 'react';

interface Props {
  message: string;
  variant?: 'ok' | 'error';
  onDone: () => void;
}

// Toast (ADR-003 §5.6): fixo embaixo, centralizado, sai sozinho em 2600 ms.
// A recusa da API aparece aqui em texto (spec 003, R12), com a cor de erro.
export function Toast({ message, variant = 'ok', onDone }: Props) {
  useEffect(() => {
    const id = setTimeout(onDone, 2600);
    return () => clearTimeout(id);
  }, [message, onDone]);

  return (
    <div
      className={variant === 'error' ? 'toast toast-error' : 'toast'}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      {message}
    </div>
  );
}
