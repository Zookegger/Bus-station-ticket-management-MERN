// src/components/user/PendingRatingBanner.tsx
import { Alert, AlertTitle, Button, Stack } from "@mui/material";
import { Link } from "react-router-dom";

type Props = {
  count: number;
};

export default function PendingRatingBanner({ count }: Props) {
  return (
    <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
      <AlertTitle>Bạn có {count} chuyến đi đang chờ bạn đánh giá!</AlertTitle>
      Phản hồi của bạn giúp chúng tôi cải thiện chất lượng dịch vụ. Vui lòng
      dành chút thời gian để đánh giá chuyến đi gần đây của bạn.{" "}
      <Button
        component={Link}
        to="/rate-trip"
        variant="contained"
        size="small"
        color="inherit"
        sx={{ ml: 2 }}
      >
        Đánh giá ngay
      </Button>
    </Alert>
  );
}
