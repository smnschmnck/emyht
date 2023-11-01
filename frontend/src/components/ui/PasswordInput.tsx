import { FC, useState } from "react";
import { Input } from "./Input";
import { HideOrShowButton } from "./HideOrShowButton";

export const PasswordInput: FC<{ placeholder: string }> = ({ placeholder }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      placeholder={placeholder}
      type={showPassword ? "text" : "password"}
      endAdornment={
        <HideOrShowButton
          show={showPassword}
          setShowPassword={setShowPassword}
        />
      }
    />
  );
};
