import { FC } from 'react';
import { Input, InputProps } from './Input';
import { PasswordInput } from './PasswordInput';

type FormInputProps = InputProps & {
  label: string;
};

export const FormInput: FC<FormInputProps> = ({ label, type, ...props }) => (
  <label className="flex flex-col gap-1">
    <span className="text-sm font-medium">{label}</span>
    {type === 'password' && <PasswordInput {...props} />}
    {type !== 'password' && <Input {...props} type={type} />}
  </label>
);
