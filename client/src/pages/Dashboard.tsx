// Dashboard page component

import React from "react";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

const Dashboard: React.FC = () => {
  const { state } = useAuth();

  return (
    <Container>
      <Row>
        <Col>
          <h1 className="mb-4">Dashboard</h1>
          <Alert variant="success">
            Welcome back, <strong>{state.user?.name}</strong>!
          </Alert>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Total Users</h6>
                  <h4 className="mb-0">1,234</h4>
                </div>
                <div className="text-primary">
                  <i className="fas fa-users fa-2x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Revenue</h6>
                  <h4 className="mb-0">$12,345</h4>
                </div>
                <div className="text-success">
                  <i className="fas fa-dollar-sign fa-2x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Orders</h6>
                  <h4 className="mb-0">567</h4>
                </div>
                <div className="text-info">
                  <i className="fas fa-shopping-cart fa-2x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Growth</h6>
                  <h4 className="mb-0">+12.5%</h4>
                </div>
                <div className="text-warning">
                  <i className="fas fa-chart-line fa-2x"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Activity</h5>
            </Card.Header>
            <Card.Body>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-marker bg-primary"></div>
                  <div className="timeline-content">
                    <h6>New user registered</h6>
                    <p className="text-muted mb-0">
                      John Doe joined the platform
                    </p>
                    <small className="text-muted">2 hours ago</small>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-marker bg-success"></div>
                  <div className="timeline-content">
                    <h6>Payment received</h6>
                    <p className="text-muted mb-0">$299.00 from Jane Smith</p>
                    <small className="text-muted">4 hours ago</small>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-marker bg-info"></div>
                  <div className="timeline-content">
                    <h6>System update</h6>
                    <p className="text-muted mb-0">Version 2.1.0 deployed</p>
                    <small className="text-muted">6 hours ago</small>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary btn-sm">
                  Add New User
                </button>
                <button className="btn btn-outline-secondary btn-sm">
                  View Reports
                </button>
                <button className="btn btn-outline-success btn-sm">
                  Export Data
                </button>
                <button className="btn btn-outline-info btn-sm">
                  Settings
                </button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
