import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // تحديث القيمة بعد مرور الوقت المحدد
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // إلغاء الـ timeout السابق إذا تغيرت القيمة قبل انتهاء الوقت
    // هذا ما يصنع تأثير الـ Debounce
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
