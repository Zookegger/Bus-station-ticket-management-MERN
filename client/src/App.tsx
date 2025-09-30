import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import { router } from "@components/common/router";

function App() {
  return (
    <Suspense
      fallback={
        <Box display="flex" justifyContent="center" alignItems="center" p={5}>
          <CircularProgress />
        </Box>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
