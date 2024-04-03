import { FC, InputHTMLAttributes, ReactNode } from 'react';
import { Input } from './Input';
import { PasswordInput } from './PasswordInput';

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
};

export const FormInput: FC<FormInputProps> = ({ label, type, ...props }) => (
  <label className="flex flex-col gap-1">
    <span className="text-sm font-medium">{label}</span>
    {type === 'password' && <PasswordInput {...props} />}
    {type !== 'password' && <Input {...props} type={type} />}
  </label>
);
