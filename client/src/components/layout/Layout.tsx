// Main Layout component

import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import type { BaseComponentProps } from "../../types";

interface LayoutProps extends BaseComponentProps {
  fluid?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />

      <main className="flex-grow-1 w-100">{children}</main>

      <Footer />
    </div>
  );
};

export default Layout;
