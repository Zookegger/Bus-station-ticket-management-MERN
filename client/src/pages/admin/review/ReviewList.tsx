import React, { useEffect, useState } from "react";
import {
    Rating,
    Typography,
    Avatar,
    Stack,
} from "@mui/material";
import {
    DataGrid,
    type GridColDef,
    type GridRenderCellParams,
} from "@mui/x-data-grid";
import { DataGridPageLayout } from "@components/admin";
import callApi from "@utils/apiCaller";
import { API_ENDPOINTS } from "@constants/index";
import buildImgUrl from "@utils/imageHelper";
import { format } from "date-fns";

const ReviewList: React.FC = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await callApi({
                method: "GET",
                url: API_ENDPOINTS.REVIEWS.ALL,
            });
            if (res && (res as any).data) {
                setReviews((res as any).data);
            }
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 70 },
        {
            field: "user",
            headerName: "User",
            width: 200,
            renderCell: (params: GridRenderCellParams) => {
                const user = params.row.user;
                return (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar src={buildImgUrl(user?.avatar)} alt={user?.firstName} sx={{ width: 24, height: 24 }} />
                        <Typography variant="body2">{user?.firstName} {user?.lastName}</Typography>
                    </Stack>
                );
            },
        },
        {
            field: "trip",
            headerName: "Trip",
            width: 250,
            renderCell: (params: GridRenderCellParams) => {
                const trip = params.row.trip;
                return (
                    <Typography variant="body2">
                        {trip?.route?.name} ({format(new Date(trip?.startTime), "MMM dd HH:mm")})
                    </Typography>
                );
            },
        },
        {
            field: "rating",
            headerName: "Rating",
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Rating value={params.value} readOnly size="small" />
            ),
        },
        {
            field: "comment",
            headerName: "Comment",
            flex: 1,
            minWidth: 200,
        },
        {
            field: "createdAt",
            headerName: "Date",
            width: 180,
            valueFormatter: (value: any) => format(new Date(value), "PPpp"),
        },
    ];

    return (
        <DataGridPageLayout
            title="Reviews"
        >
            <DataGrid
                rows={reviews}
                columns={columns}
                loading={loading}
                getRowId={(row) => row.id}
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 10, page: 0 },
                    },
                }}
                pageSizeOptions={[10, 25, 50]}
                disableRowSelectionOnClick
            />
        </DataGridPageLayout>
    );
};

export default ReviewList;
