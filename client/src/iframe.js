import {
  Container,
  CircularProgress,
  Button,
  Card,
  Typography,
  CardContent,
  Box,
} from "@mui/material";
import axios from "axios";
import he from "he";
import { useState, useEffect } from "react";
import StadiumIcon from "@mui/icons-material/Stadium";
import EventIcon from "@mui/icons-material/Event";

function Iframe() {
  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [selectedName, setSelectedName] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/eventdata");
        setData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  function formatDate(dateString) {
    if (dateString.includes("-")) {
      // ISO string
      const date = new Date(dateString);
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    } else {
      // "day/month/year" string
      const [day, month, year] = dateString.split("/");
      return `${year}/${month}/${day}`;
    }
  }

  useEffect(() => {
    if (selectedName) {
      const filtered = data
        ?.find((item) => item.name === selectedName)
        .items.map((item) => {
          const date = item.acf?.event_date
            ? formatDate(item.acf.event_date)
            : formatDate(new Date(item.date).toLocaleDateString());
          return {
            name: selectedName,
            title:
              typeof item.title === "string"
                ? he.decode(item.title)
                : he.decode(item.title?.rendered) || "No title available",
            date,
            time: typeof date === "string" ? "" : date.toLocaleTimeString(),
            image:
              item.landscapeImage?.url ||
              item.yoast_head_json?.og_image[0]?.url,
          };
        });
      setFilteredData(filtered);
    } else {
      const allItems = data
        ?.flatMap((item) =>
          item.items.map((subItem) => {
            const date = subItem.acf?.event_date
              ? formatDate(subItem.acf.event_date)
              : formatDate(subItem.date);
            return {
              name: item.name, // Add this line
              title:
                typeof subItem.title === "string"
                  ? he.decode(subItem.title)
                  : he.decode(subItem.title?.rendered) || "No title available",
              date,
              time: typeof date === "string" ? "" : date.toLocaleTimeString(),
              image:
                subItem.landscapeImage?.url ||
                subItem.yoast_head_json?.og_image[0]?.url,
            };
          })
        )
        .filter((item) => {
          const currentDate = new Date();
          const itemDate = new Date(item.date);
          return itemDate >= currentDate;
        });
      if (allItems) {
        allItems.sort((a, b) => new Date(a.date) - new Date(b.date));
        setFilteredData(allItems);
      }
    }
  }, [selectedName, data]);

  const handleButtonClick = (name) => {
    setSelectedName(name);
  };

  const handleAllButtonClick = () => {
    setSelectedName(null);
  };

  function formatCardDate(dateString) {
    const [year, month, day] = dateString.split("/");
    const date = new Date(year, month - 1, day);

    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  }

  function getFontSize(text) {
    let baseSize = 16; // Base font size
    let maxLength = 25; // The maximum length of text that will get the base size

    if (text.length > maxLength) {
      return `${baseSize - (text.length - maxLength) * 0.2}px`;
    } else {
      return `${baseSize}px`;
    }
  }

  return (
    <Container>
      <Card sx={{ minHeight: "378px", height: "100%" }}>
        {data ? (
          <div style={{ height: "100%" }}>
            <div>
              <Button
                variant="outlined"
                sx={{
                  marginRight: 2,
                  bgcolor: selectedName === null ? "#dddddd" : "inherit",
                }}
                onClick={handleAllButtonClick}
              >
                All
              </Button>
              {data.map((item, index) => (
                <Button
                  variant="outlined"
                  sx={{
                    marginRight: 2,
                    bgcolor: selectedName === item.name ? "#dddddd" : "inherit",
                  }}
                  key={index}
                  onClick={() => handleButtonClick(item.name)}
                >
                  {item.name}
                </Button>
              ))}
            </div>
            <Box
              sx={{
                display: "flex",
                overflowX: "auto",
                p: 1,
                whiteSpace: "nowrap",
              }}
            >
              {filteredData &&
                filteredData.map((item, index) => (
                  <Card
                    key={index}
                    sx={{
                      flex: "0 0 auto",
                      mr: 1,
                    }}
                  >
                    <CardContent
                      sx={{
                        maxWidth: "300px",
                        maxHeight: "500px",
                        overflow: "auto",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "170px",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={item.image || `/images/${item.name}.jpeg`}
                          alt={item.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            backgroundColor: "#d7d6d6",
                            borderRadius: "5px",
                          }}
                        />
                      </div>
                      <Typography
                        variant="h5"
                        component="div"
                        sx={{
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: getFontSize(item.title),
                          mt: 1,
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                          mt: 1,
                        }}
                      >
                        <EventIcon sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          {formatCardDate(item.date)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                          mt: 1,
                        }}
                      >
                        <StadiumIcon sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          {item.name === "Accor"
                            ? "Accor Stadium"
                            : item.name === "Commbank"
                            ? "Commbank Stadium"
                            : item.name === "SCG"
                            ? "Sydney Cricket Ground"
                            : item.name === "SFS"
                            ? "Allianz Stadium"
                            : item.name}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
            </Box>
          </div>
        ) : (
          <Box
            sx={{
              display: "flex",
              height: "100%",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Card>
    </Container>
  );
}

export default Iframe;
