import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const SearchPage: React.FC = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [fromLocation, setFromLocation] = useState<string>("");
	const [toLocation, setToLocation] = useState<string>("");
	const [travelDate, setTravelDate] = useState<string>("");
	const [pageNumber, setPageNumber] = useState<string>("1");

   useEffect(() => {
      const from = searchParams.get("from") ?? "";
      const to = searchParams.get("to") ?? "";
      const date = searchParams.get("date") ?? "";
      const page = searchParams.get("page") ?? "1";

      setFromLocation(from);
      setToLocation(to);
      setTravelDate(date);
      setPageNumber(page);
   })

	return (<>
      <Typography>{fromLocation}</Typography>
      <Typography>{toLocation}</Typography>
      <Typography>{travelDate}</Typography>
      <Typography>{pageNumber}</Typography>
   </>);
};

export default SearchPage;
