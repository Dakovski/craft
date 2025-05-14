import type { PropsWithChildren } from "react";
import "./CustomButton.scss";

export interface CustomButtonProps {
  variant?: "primary" | "success";
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

const CustomButton: React.FC<PropsWithChildren<CustomButtonProps>> = ({
  children,
  variant,
  isLoading,
  disabled,
  onClick,
  className,
}) => {
  return (
    <button
      className={
        "custom-button" +
        (variant ? " " + variant : "") +
        (className ? " " + className : "")
      }
      onClick={onClick}
      disabled={disabled}
    >
      {isLoading && <div className="custom-button-loading-indicator"></div>}
      {!isLoading && children}
    </button>
  );
};

export default CustomButton;
