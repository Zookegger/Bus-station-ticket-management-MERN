// Loading components

import React from "react";
import { Spinner, Container } from "react-bootstrap";

interface LoadingProps {
  size?: "sm";
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark";
  text?: string;
  centered?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = "sm",
  variant = "primary",
  text,
  centered = false,
}) => {
  const spinner = (
    <div className="d-flex align-items-center">
      <Spinner animation="border" size={size} variant={variant} />
      {text && <span className="ms-2">{text}</span>}
    </div>
  );

  if (centered) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "200px" }}
      >
        {spinner}
      </Container>
    );
  }

  return spinner;
};

export const PageLoading: React.FC<{ text?: string }> = ({
  text = "Loading...",
}) => (
  <Container
    className="d-flex justify-content-center align-items-center"
    style={{ minHeight: "60vh" }}
  >
    <div className="text-center">
      <Spinner animation="border" variant="primary" />
      <div className="mt-3">
        <h5>{text}</h5>
      </div>
    </div>
  </Container>
);

export default Loading;
