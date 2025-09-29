// Custom Button component

import React from "react";
import { Button as BootstrapButton, Spinner } from "react-bootstrap";
import type { BaseComponentProps } from "../../types";

interface ButtonProps extends BaseComponentProps {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark"
    | "link"
    | "outline-primary"
    | "outline-secondary"
    | "outline-success"
    | "outline-danger"
    | "outline-warning"
    | "outline-info"
    | "outline-light"
    | "outline-dark";
  size?: "sm" | "lg";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  href?: string;
  target?: string;
  block?: boolean;
  as?: any;
  to?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size,
  type = "button",
  disabled = false,
  loading = false,
  onClick,
  href,
  target,
  block = false,
  className = "",
  as,
  to,
}) => {
  const isDisabled = disabled || loading;
  const buttonClass = `${className} ${block ? "w-100" : ""}`.trim();

  if (href) {
    return (
      <BootstrapButton
        as="a"
        href={href}
        target={target}
        variant={variant}
        size={size}
        disabled={isDisabled}
        className={buttonClass}
      >
        {loading && <Spinner size="sm" className="me-2" />}
        {children}
      </BootstrapButton>
    );
  }

  return (
    <BootstrapButton
      as={as}
      variant={variant}
      size={size}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={buttonClass}
      {...(to && { to })}
    >
      {loading && <Spinner size="sm" className="me-2" />}
      {children}
    </BootstrapButton>
  );
};

export default Button;
