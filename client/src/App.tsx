import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@context/AuthContext";
import { PageLoading } from "@components/ui/Loading";
import { router } from "@components/common/router";

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoading text="Loading page..." />}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthProvider>
  );
}

export default App;
