// 404 Not Found page component

import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ROUTES } from "../constants";
import Button from "../components/ui/Button";

const NotFound: React.FC = () => {
  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="mt-5 text-center">
            <Card.Body className="p-5">
              <div className="mb-4">
                <h1 className="display-1 text-muted">404</h1>
                <h2 className="mb-3">Page Not Found</h2>
                <p className="text-muted mb-4">
                  Sorry, the page you are looking for doesn't exist or has been
                  moved.
                </p>
              </div>

              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <Button as={Link} to={ROUTES.HOME} variant="primary" size="sm">
                  Go Home
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => window.history.back()}
                >
                  Go Back
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
