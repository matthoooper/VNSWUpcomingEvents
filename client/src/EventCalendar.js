import { Box, Container } from "@mui/material";
import { DataGridPremium, GridToolbar } from "@mui/x-data-grid-premium";

import axios from "axios";
import { useState, useEffect } from "react";

function Iframe() {
  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [selectedName, setSelectedName] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/eventdata");
        setData(response.data);
        console.log("Data:", response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const allItems = data
      ? data.flatMap((item) =>
          item.items.map((subItem) => ({
            id: subItem._kenticoId,
            Venue: item.name,
            startDate: formatDate(subItem.date),
            startTime: formatTime(subItem.startTime),
            endTime: formatTime(subItem.endTime),
            title: subItem.title,
          }))
        )
      : [];

    const filteredItems = allItems.filter((item) => {
      const currentDate = new Date();
      const itemDate = new Date(item.startDate);
      return itemDate >= currentDate;
    });

    if (filteredItems) {
      filteredItems.sort(
        (a, b) => new Date(a.startDate) - new Date(b.startDate)
      );
      if (selectedName) {
        setFilteredData(
          filteredItems.filter((item) => item.name === selectedName)
        );
      } else {
        setFilteredData(filteredItems);
      }
    }
  }, [data, selectedName]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit", hour12: true };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };
  const columns = [
    { field: "Venue", headerName: "Venue", width: 130 },
    { field: "title", headerName: "Title", flex: 1 },

    { field: "startDate", headerName: "Start Date", width: 130 },
    { field: "startTime", headerName: "Start Time", width: 130 },
    { field: "endTime", headerName: "End Time", width: 130 },
  ];

  return (
    <Container sx={{ height: "100vh" }}>
      {filteredData && (
        <Box sx={{ margin: "10px", height: "100vh" }}>
          <DataGridPremium
            rows={filteredData}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            slots={{ toolbar: GridToolbar }}
            density="compact"
            getRowClassName={
              (params) => `venue-type-${params.row.Venue}` // Replace 'venueType' with the actual field name of the venue type in your data
            }
          />
        </Box>
      )}
    </Container>
  );
}

export default Iframe;
