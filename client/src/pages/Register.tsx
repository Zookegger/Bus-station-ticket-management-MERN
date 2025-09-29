// Register page component

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
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROUTES, VALIDATION_RULES } from "../constants";
import Button from "../components/ui/Button";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    gender: "Male",
    dateOfBirth: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { state, register, clearError } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < VALIDATION_RULES.NAME_MIN_LENGTH) {
      newErrors.name = `Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`;
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!VALIDATION_RULES.EMAIL_REGEX.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (
      formData.password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH
    ) {
      newErrors.password = `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
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
      await register(formData);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card
            className="mt-5 shadow-lg border-0"
            style={{ borderRadius: "15px" }}
          >
            {/* Header với background xanh */}
            <div
              className="bg-success text-white py-3 px-4"
              style={{ borderRadius: "15px 15px 0 0" }}
            >
              <h4 className="mb-0 fw-bold">Register</h4>
            </div>

            <Card.Body className="p-0">
              {state.error && (
                <Alert variant="danger" className="m-4 mb-0">
                  {state.error}
                </Alert>
              )}

              <Row className="g-0">
                {/* Form bên trái */}
                <Col md={8} className="p-4">
                  <h6 className="text-muted mb-4">Create a new account.</h6>

                  <Form onSubmit={handleSubmit}>
                    <Row>
                      {/* Email */}
                      <Col md={6} className="mb-3">
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
                      </Col>

                      {/* Password */}
                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-semibold">
                          Password
                        </Form.Label>
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
                      </Col>

                      {/* Confirm Password */}
                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-semibold">
                          Confirm Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          isInvalid={!!errors.confirmPassword}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.confirmPassword}
                        </Form.Control.Feedback>
                      </Col>

                      {/* Full Name */}
                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-semibold">
                          Full Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          isInvalid={!!errors.name}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.name}
                        </Form.Control.Feedback>
                      </Col>

                      {/* Phone Number */}
                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-semibold">
                          Phone Number
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          isInvalid={!!errors.phone}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.phone}
                        </Form.Control.Feedback>
                      </Col>

                      {/* Address */}
                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-semibold">Address</Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          isInvalid={!!errors.address}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.address}
                        </Form.Control.Feedback>
                      </Col>

                      {/* Gender */}
                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-semibold">Gender</Form.Label>
                        <Form.Select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          isInvalid={!!errors.gender}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.gender}
                        </Form.Control.Feedback>
                      </Col>

                      {/* Date of Birth */}
                      <Col md={6} className="mb-3">
                        <Form.Label className="fw-semibold">
                          Date of Birth
                        </Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            isInvalid={!!errors.dateOfBirth}
                            placeholder="dd/mm/yyyy"
                          />
                          <InputGroup.Text className="bg-light">
                            <i className="fas fa-calendar text-muted"></i>
                          </InputGroup.Text>
                        </InputGroup>
                        <Form.Control.Feedback type="invalid">
                          {errors.dateOfBirth}
                        </Form.Control.Feedback>
                      </Col>
                    </Row>

                    {/* Register Button */}
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      loading={isLoading}
                      block
                      disabled={state.isLoading}
                      className="mt-3"
                    >
                      {isLoading ? "Creating Account..." : "Register"}
                    </Button>
                  </Form>
                </Col>

                {/* Social Login bên phải */}
                <Col
                  md={4}
                  className="bg-light p-4 d-flex flex-column justify-content-center"
                >
                  <div className="text-center">
                    <h6 className="text-muted mb-4">Or sign up using</h6>

                    <div className="d-flex flex-column gap-3">
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
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
