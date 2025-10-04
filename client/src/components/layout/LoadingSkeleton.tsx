import React from "react";
import { Container, Box, Skeleton, Stack } from "@mui/material";

const LoadingSkeleton: React.FC = () => {
    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            {/* Header Skeleton */}
            <Box sx={{ mb: 4 }}>
                <Skeleton variant="text" width="40%" height={60} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="60%" height={30} />
            </Box>

            {/* Content Skeletons */}
            <Stack spacing={3}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            </Stack>

            {/* Footer/Action Skeletons */}
            <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
                <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
            </Box>
        </Container>
    );
};

export default LoadingSkeleton;