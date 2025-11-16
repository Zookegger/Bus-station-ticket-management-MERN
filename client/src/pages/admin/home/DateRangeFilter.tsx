import { TextField, Button, Stack } from "@mui/material";
import { useState } from "react";

interface Props {
  onApply: (from: string, to: string) => void;
  onClear: () => void;
}

export const DateRangeFilter: React.FC<Props> = ({ onApply, onClear }) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <TextField
        label="From Date"
        type="date"
        size="small"
        InputLabelProps={{ shrink: true }}
        value={from}
        onChange={(e) => setFrom(e.target.value)}
      />
      <TextField
        label="To Date"
        type="date"
        size="small"
        InputLabelProps={{ shrink: true }}
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />
      <Button variant="contained" onClick={() => onApply(from, to)}>
        Apply Filter
      </Button>
      <Button variant="outlined" color="error" onClick={onClear}>
        Clear Filter
      </Button>
    </Stack>
  );
};
