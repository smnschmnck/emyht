import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

type RadioGroupProps<T extends string> = {
  disabled?: boolean;
  className?: string;
  onValueChange?: (value: T) => void;
  value?: T;
  defauleValue?: T;
  children: ReactNode;
};

export const RadioGroup = <T extends string>({
  disabled,
  className,
  ...props
}: RadioGroupProps<T>) => {
  return (
    <RadioGroupPrimitive.Root
      {...props}
      disabled={disabled}
      className={twMerge(disabled ? 'opacity-50 grayscale' : '', className)}
    />
  );
};

type RadioGroupItemProps<T extends string> = {
  id: string;
  label: string;
  value: T;
  disabled?: boolean;
};

export const RadioGroupItem = <T extends string>({
  id,
  label,
  value,
  disabled,
}: RadioGroupItemProps<T>) => (
  <div className="flex w-fit items-center justify-center gap-2">
    <RadioGroupPrimitive.Item
      disabled={disabled}
      className="peer h-4 w-4 rounded-full border border-zinc-300 bg-white data-[state=checked]:border-none data-disabled:border-zinc-100 data-[state=checked]:bg-blue-500"
      value={value}
      id={id}
    >
      <RadioGroupPrimitive.Indicator className="relative flex h-full w-full items-center justify-center after:block after:h-1 after:w-1 after:rounded-[50%] after:bg-white after:content-['']" />
    </RadioGroupPrimitive.Item>
    <label className="text-sm peer-data-disabled:text-zinc-400" htmlFor={id}>
      {label}
    </label>
  </div>
);
