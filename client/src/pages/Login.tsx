// Login page component

import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Alert,
  InputGroup,
  Button as BootstrapButton,
} from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { ROUTES } from "@constants/index";
import Button from "@components/ui/Button";
import { VALIDATION_RULES } from "@constants/index";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "admin@example.com",
    password: "******",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { state, login, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || ROUTES.DASHBOARD;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!VALIDATION_RULES.EMAIL_REGEX.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card
            className="shadow-lg border-0 mt-5"
            style={{ borderRadius: "15px" }}
          >
            {/* Header với background xanh */}
            <div
              className="bg-success text-white text-center py-3"
              style={{ borderRadius: "15px 15px 0 0" }}
            >
              <h4 className="mb-0 fw-bold">Log in</h4>
            </div>

            <Card.Body className="p-4">
              {state.error && (
                <Alert variant="danger" className="mb-3">
                  {state.error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                {/* Email Field với icon */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Email</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0">
                      <i className="fas fa-envelope text-muted"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      isInvalid={!!errors.email}
                      className="border-start-0"
                      style={{ borderLeft: "none" }}
                    />
                  </InputGroup>
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Password Field với icon và eye toggle */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0">
                      <i className="fas fa-key text-muted"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      isInvalid={!!errors.password}
                      className="border-start-0"
                      style={{ borderLeft: "none" }}
                    />
                    <InputGroup.Text
                      className="bg-light border-start-0 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: "pointer" }}
                    >
                      <i
                        className={`fas ${
                          showPassword ? "fa-eye-slash" : "fa-eye"
                        } text-muted`}
                      ></i>
                    </InputGroup.Text>
                  </InputGroup>
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Remember me và Forgot password */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Form.Check
                    type="checkbox"
                    id="rememberMe"
                    label="Remember me"
                    checked={formData.rememberMe}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        rememberMe: e.target.checked,
                      }))
                    }
                  />
                  <Link to="#" className="text-primary text-decoration-none">
                    Forgot your password?
                  </Link>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-3 mb-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={isLoading}
                    disabled={state.isLoading}
                    className="flex-fill d-flex align-items-center justify-content-center"
                  >
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Log In
                  </Button>
                  <Link to={ROUTES.REGISTER} className="flex-fill">
                    <BootstrapButton
                      variant="secondary"
                      size="sm"
                      className="w-100 d-flex align-items-center justify-content-center"
                    >
                      <i className="fas fa-user me-2"></i>
                      Register
                    </BootstrapButton>
                  </Link>
                </div>

                {/* Divider */}
                <div className="position-relative text-center mb-4">
                  <hr />
                  <span className="bg-white px-3 text-muted position-absolute top-50 start-50 translate-middle">
                    Or log in using
                  </span>
                </div>

                {/* Social Login Buttons */}
                <div className="d-flex flex-column gap-2">
                  <BootstrapButton
                    variant="outline-danger"
                    size="sm"
                    className="d-flex align-items-center justify-content-center"
                  >
                    <i className="fab fa-google me-2"></i>
                    Google
                  </BootstrapButton>
                  <BootstrapButton
                    variant="outline-primary"
                    size="sm"
                    className="d-flex align-items-center justify-content-center"
                  >
                    <i className="fab fa-facebook me-2"></i>
                    Facebook
                  </BootstrapButton>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
