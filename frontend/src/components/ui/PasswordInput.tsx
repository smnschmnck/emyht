import { FC, InputHTMLAttributes, useState } from "react";
import { Input } from "./Input";
import { HideOrShowButton } from "./HideOrShowButton";

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement>;

export const PasswordInput: FC<PasswordInputProps> = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      type={showPassword ? "text" : "password"}
      endAdornment={
        <HideOrShowButton
          show={showPassword}
          setShowPassword={setShowPassword}
        />
      }
      {...props}
    />
  );
};
