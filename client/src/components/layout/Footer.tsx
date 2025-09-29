// Footer component

import React from "react";
import { APP_CONFIG } from "../../constants";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-success text-light py-4 mt-auto w-100">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>{APP_CONFIG.name}</h5>
            <p className="mb-0">{APP_CONFIG.description}</p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="mb-2">
              © {currentYear} {APP_CONFIG.author}. All rights reserved. Privacy
              Policy
            </p>
            <div className="d-flex justify-content-md-end gap-3">
              <i className="fab fa-facebook fs-4 text-light"></i>
              <i className="fab fa-linkedin fs-4 text-light"></i>
              <i className="fas fa-envelope fs-4 text-light"></i>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
