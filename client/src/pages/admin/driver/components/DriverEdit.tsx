import React from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createDriverAPISchema,
  type CreateDriverAPIFormData,
  type CreateDriverAPISubmitData,
} from "@schemas/driverSchema";
import callApi from "@utils/apiCaller";
import { useNavigate, useParams } from "react-router-dom";
import { type DriverFromServer } from "@my-types/driver";

const DriverEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = React.useState(false);
  const [fetchLoading, setFetchLoading] = React.useState(true);
  const [success, setSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateDriverAPIFormData>({
    resolver: zodResolver(createDriverAPISchema),
  });

  // Fetch driver data
  React.useEffect(() => {
    const fetchDriver = async () => {
      if (!id) return;

      try {
        const response = await callApi<DriverFromServer>({
          method: "GET",
          url: `/drivers/${id}`,
        });

        if (
          response &&
          typeof response === "object" &&
          "fullname" in response
        ) {
          const driverData = response as DriverFromServer;
          // Populate form with existing data
          reset({
            fullname: driverData.fullname || "",
            phoneNumber: driverData.phoneNumber || "",
            licenseNumber: driverData.licenseNumber || "",
            licenseCategory: driverData.licenseCategory || "",
            licenseIssueDate: driverData.licenseIssueDate
              ? new Date(driverData.licenseIssueDate)
                  .toISOString()
                  .split("T")[0]
              : "",
            licenseExpiryDate: driverData.licenseExpiryDate
              ? new Date(driverData.licenseExpiryDate)
                  .toISOString()
                  .split("T")[0]
              : "",
            issuingAuthority: driverData.issuingAuthority || "",
            hiredAt: driverData.hiredAt
              ? new Date(driverData.hiredAt).toISOString().split("T")[0]
              : "",
            isActive: driverData.isActive ?? true,
            isSuspended: driverData.isSuspended ?? false,
            avatar: driverData.avatar || "",
          });
        }
      } catch (err: any) {
        console.error("Failed to fetch driver:", err);
        setErrorMessage("Không thể tải thông tin tài xế.");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchDriver();
  }, [id, reset]);

  const onSubmit = async (formData: CreateDriverAPIFormData) => {
    if (!id) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      // Convert form data to API format
      const submitData: CreateDriverAPISubmitData = {
        fullname: formData.fullname,
        phoneNumber: formData.phoneNumber || null,
        licenseNumber: formData.licenseNumber || null,
        licenseCategory: formData.licenseCategory || null,
        licenseIssueDate: formData.licenseIssueDate || null,
        licenseExpiryDate: formData.licenseExpiryDate || null,
        issuingAuthority: formData.issuingAuthority || null,
        hiredAt: formData.hiredAt || null,
        isActive: formData.isActive ? formData.isActive === true : undefined,
        isSuspended: formData.isSuspended
          ? formData.isSuspended === true
          : undefined,
        avatar: formData.avatar || null,
      };

      const response = await callApi({
        method: "PUT",
        url: `/drivers/${id}`,
        data: submitData,
      });

      if (response) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/dashboard/driver");
        }, 1500);
      }
    } catch (err: any) {
      console.error("Failed to update driver:", err);
      setErrorMessage(
        err.message ?? "Không thể cập nhật tài xế. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: "#2E7D32", mb: 3 }}
      >
        Chỉnh sửa tài xế
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Cập nhật tài xế thành công! Đang chuyển hướng về danh sách...
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {/* === THÔNG TIN CƠ BẢN === */}
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "#1565c0" }}
            >
              Thông tin cơ bản
            </Typography>

            <Controller
              name="fullname"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Họ và tên *"
                  fullWidth
                  error={!!errors.fullname}
                  helperText={errors.fullname?.message}
                />
              )}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Số điện thoại"
                    fullWidth
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message || "VD: 0901234567"}
                  />
                )}
              />

              <Controller
                name="issuingAuthority"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Cơ quan cấp"
                    fullWidth
                    error={!!errors.issuingAuthority}
                    helperText={errors.issuingAuthority?.message}
                  />
                )}
              />
            </Stack>

            <Divider />

            {/* === BẰNG LÁI === */}
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "#1565c0" }}
            >
              Giấy phép lái xe
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="licenseNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Số bằng lái"
                    fullWidth
                    error={!!errors.licenseNumber}
                    helperText={errors.licenseNumber?.message}
                  />
                )}
              />

              <Controller
                name="licenseCategory"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.licenseCategory}>
                    <InputLabel>Hạng bằng lái</InputLabel>
                    <Select {...field} label="Hạng bằng lái">
                      <MenuItem value="B1">B1</MenuItem>
                      <MenuItem value="B2">B2</MenuItem>
                      <MenuItem value="C">C</MenuItem>
                      <MenuItem value="D">D</MenuItem>
                      <MenuItem value="E">E</MenuItem>
                    </Select>
                    <FormHelperText>
                      {errors.licenseCategory?.message}
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="licenseIssueDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Ngày cấp"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.licenseIssueDate}
                    helperText={errors.licenseIssueDate?.message}
                  />
                )}
              />

              <Controller
                name="licenseExpiryDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Ngày hết hạn"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.licenseExpiryDate}
                    helperText={errors.licenseExpiryDate?.message}
                  />
                )}
              />
            </Stack>

            <Divider />

            {/* === THÔNG TIN TUYỂN DỤNG === */}
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "#1565c0" }}
            >
              Thông tin tuyển dụng
            </Typography>

            <Controller
              name="hiredAt"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Ngày tuyển dụng"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.hiredAt}
                  helperText={errors.hiredAt?.message}
                />
              )}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.isActive}>
                    <InputLabel>Trạng thái hoạt động</InputLabel>
                    <Select {...field} label="Trạng thái hoạt động">
                      <MenuItem value={true}>Hoạt động</MenuItem>
                      <MenuItem value={false}>Không hoạt động</MenuItem>
                    </Select>
                    <FormHelperText>{errors.isActive?.message}</FormHelperText>
                  </FormControl>
                )}
              />

              <Controller
                name="isSuspended"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.isSuspended}>
                    <InputLabel>Trạng thái đình chỉ</InputLabel>
                    <Select {...field} label="Trạng thái đình chỉ">
                      <MenuItem value={false}>Không đình chỉ</MenuItem>
                      <MenuItem value={true}>Đình chỉ</MenuItem>
                    </Select>
                    <FormHelperText>
                      {errors.isSuspended?.message}
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </Stack>

            <Controller
              name="avatar"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Ảnh đại diện (URL)"
                  fullWidth
                  error={!!errors.avatar}
                  helperText={errors.avatar?.message}
                />
              )}
            />

            <Divider />

            {/* === HÀNH ĐỘNG === */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                disabled={loading}
                onClick={() => navigate("/dashboard/trip")}
              >
                Hủy
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? "Đang lưu..." : "Cập nhật tài xế"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default DriverEdit;
