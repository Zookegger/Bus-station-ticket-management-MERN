// Home page component - EasyRide Bus Booking

import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";

const Home: React.FC = () => {
  // fc = function component
  const [searchForm, setSearchForm] = useState({
    from: "",
    to: "",
    date: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchForm);
  };

  const popularTrips = [
    {
      route: "Thao Cam Vien Sai Gon - Cho Ben Thanh",
      departure: "01/06/2023 17:00",
      arrival: "01/06/2023 19:00",
      price: "200.000 đ",
    },
    {
      route: "Thanh Pho Ho Chi Minh",
      departure: "01/06/2023 14:20",
      arrival: "01/06/2023 15:20",
      price: "6.050.000 đ",
    },
  ];

  return (
    <>
      {/* Header Section */}
      <div
        className="bg-light-green py-5 position-relative"
        style={{ backgroundColor: "#d4e6d4", minHeight: "500px" }}
      >
        <Container>
          {" "}
          {/* <=> div */}
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h1 className="display-4 text-primary fw-bold ">
                Book Your Bus Ticket Online
              </h1>
              <p className="lead text-muted mb-5">
                Fast, easy, and secure travel reservations
              </p>

              {/* Search Form */}
              <Card.Body className="p-4">
                <Form onSubmit={handleSearch}>
                  <Row className="g-3">
                    <Col md={4}>
                      <div className="position-relative">
                        <Form.Control
                          type="text"
                          name="from"
                          value={searchForm.from}
                          onChange={handleInputChange}
                          placeholder="From"
                          className="border-0 shadow-sm pe-5"
                          style={{ height: "48px" }}
                        />
                        <button
                          type="button"
                          className="btn btn-link position-absolute top-50 end-0 translate-middle-y p-0 me-2"
                          style={{ color: "#6c757d" }}
                        >
                          <i className="fas fa-chevron-down"></i>
                        </button>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="position-relative">
                        <Form.Control
                          type="text"
                          name="to"
                          value={searchForm.to}
                          onChange={handleInputChange}
                          placeholder="To"
                          className="border-0 shadow-sm pe-5"
                          style={{ height: "48px" }}
                        />
                        <button
                          type="button"
                          className="btn btn-link position-absolute top-50 end-0 translate-middle-y p-0 me-2"
                          style={{ color: "#6c757d" }}
                        >
                          <i className="fas fa-chevron-down"></i>
                        </button>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="position-relative">
                        <Form.Control
                          type="text"
                          name="date"
                          value={searchForm.date}
                          onChange={handleInputChange}
                          placeholder="dd/mm/yyyy"
                          className="border-0 shadow-sm pe-5"
                          style={{ height: "48px" }}
                        />
                        <button
                          type="button"
                          className="btn btn-link position-absolute top-50 end-0 translate-middle-y p-0 me-2"
                          style={{ color: "#6c757d" }}
                        >
                          <i className="fas fa-calendar-alt"></i>
                        </button>
                      </div>
                    </Col>
                  </Row>
                  <Row className="mt-3">
                    <Col md={12}>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        className="w-100 fw-semibold"
                      >
                        <i className="fas fa-search me-2"></i>
                        Search
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Col>
          </Row>
        </Container>

        {/* Bus Icon Background */}
        <div
          className="position-absolute"
          style={{
            bottom: "20px",
            right: "20px",
            fontSize: "100px",
            color: "#28a745",
            opacity: 0.1,
            zIndex: 1,
          }}
        >
          <i className="fas fa-bus"></i>
        </div>
      </div>

      {/* Popular Trips Section */}
      <Container className="py-5">
        <Row>
          <Col>
            <div className="d-flex align-items-center mb-4">
              <h2 className="fw-bold text-dark mb-0 me-3">Popular Trips</h2>
              <i className="fas fa-bus text-primary fs-4"></i>
            </div>
          </Col>
        </Row>

        <Row className="g-4">
          {popularTrips.map((trip, index) => (
            <Col md={4} key={index}>
              <Card
                className="h-100 shadow-sm border-0 d-flex flex-column"
                style={{ transition: "none" }}
              >
                <Card.Body className="p-4 d-flex flex-column">
                  <h5 className="card-title fw-semibold mb-3">{trip.route}</h5>

                  <div className="mb-3 flex-grow-1">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Departure:</span>
                      <span className="fw-medium">{trip.departure}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Arrival:</span>
                      <span className="fw-medium">{trip.arrival}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted small">Price:</span>
                      <span className="fw-bold text-success fs-5">
                        {trip.price}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-100 fw-semibold mt-auto"
                  >
                    Select Seat
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default Home;
