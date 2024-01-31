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
import StadiumIcon from "@mui/icons-material/Stadium";
import EventIcon from "@mui/icons-material/Event";
import { useRef, useState, useEffect } from "react";
import { IconButton } from "@mui/material";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";

import AccessTime from "@mui/icons-material/AccessTime";

function Iframe() {
  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [selectedName, setSelectedName] = useState(null);
  const scrollContainerRef = useRef(null);
  const [showScrollLeft, setShowScrollLeft] = useState(false);

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

  const formatDate = (dateString) => {
    let date;
    if (dateString.includes("/")) {
      const [day, month, year] = dateString.split("/");
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateString);
    }
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(date.getDate()).padStart(2, "0")}`;
  };

  function convertUTCtoAEST(dateString) {
    const date = new Date(dateString);
    const options = {
      timeZone: "Australia/Sydney",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    return date.toLocaleString("en-AU", options);
  }

  const extractUTCTime = (isoString) => {
    const date = new Date(isoString);
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    if (selectedName) {
      const filtered = data
        ?.find((item) => item.name === selectedName)
        .items.map((item) => {
          console.log(item.timings);
          const date = item.startDate
            ? formatDate(item.startDate)
            : formatDate(new Date(item.date).toISOString());
          const startTimeAEST = convertUTCtoAEST(item.startTime);
          const extractedTime = item.timings?.[0]?.time
            ? extractUTCTime(item.timings?.[0]?.time)
            : null;
          const startTime = extractedTime || startTimeAEST;
          return {
            name: selectedName,
            title:
              typeof item.title === "string"
                ? he.decode(item.title)
                : he.decode(item.title?.rendered) || "No title available",
            date,
            time: typeof date === "string" ? "" : date.toLocaleTimeString(),
            image: item.landscapeImage?.url || item.listingImageUrl,
            startTime,
          };
        })
        .filter((item) => {
          const currentDate = new Date();
          const itemDate = new Date(item.date);
          return itemDate >= currentDate;
        });
      if (filtered) {
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        setFilteredData(filtered);
      }
    } else {
      const allItems = data
        ?.flatMap((item) =>
          item.items.map((subItem) => {
            const date = subItem.startDate
              ? formatDate(subItem.startDate)
              : formatDate(new Date(subItem.date).toISOString());
            const startTimeAEST = convertUTCtoAEST(subItem.startTime);
            const extractedTime = subItem.timings?.[0]?.time
              ? extractUTCTime(subItem.timings?.[0]?.time)
              : null;
            const startTime = extractedTime || startTimeAEST;
            return {
              name: item.name,
              title:
                typeof subItem.title === "string"
                  ? he.decode(subItem.title)
                  : he.decode(subItem.title?.rendered) || "No title available",
              date,
              time: typeof date === "string" ? "" : date.toLocaleTimeString(),
              image: subItem.landscapeImage?.url || subItem.listingImageUrl,
              startTime,
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
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  };

  const handleAllButtonClick = () => {
    setSelectedName(null);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
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

  useEffect(() => {
    function handleScroll() {
      if (scrollContainerRef.current) {
        setShowScrollLeft(scrollContainerRef.current.scrollLeft > 0);
      }
    }

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      // Check the scroll position immediately
      handleScroll();
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [filteredData]);
  const convertTo12HourFormat = (time) => {
    const [hour, minute] = time.split(":");
    const hourIn24HourFormat = parseInt(hour, 10);
    const hourIn12HourFormat = ((hourIn24HourFormat + 11) % 12) + 1;
    const period = hourIn24HourFormat >= 12 ? "PM" : "AM";
    return `${hourIn12HourFormat}:${minute} ${period}`;
  };

  return (
    <Container>
      <Box
        sx={{
          position: "relative", // Add this line
        }}
      >
        <IconButton
          onClick={() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTo({
                left: scrollContainerRef.current.scrollLeft + 600,
                behavior: "smooth",
              });
            } else {
              console.log("Scroll container not found");
            }
          }}
          sx={{
            position: "absolute", // Add this line
            top: "50%", // Add this line
            right: "-20px", // Add this line
            transform: "translateY(-50%)", // Add this line
            backgroundColor: "#00cd7e",
          }}
        >
          <ArrowRightIcon />
        </IconButton>
        <IconButton
          onClick={() => {
            console.log("Button clicked");
            if (scrollContainerRef.current) {
              console.log("Scroll container found", scrollContainerRef.current);
              scrollContainerRef.current.scrollTo({
                left: scrollContainerRef.current.scrollLeft - 600,
                behavior: "smooth",
              });
            } else {
              console.log("Scroll container not found");
            }
          }}
          sx={{
            position: "absolute",
            top: "50%",
            left: "-20px",
            transform: "translateY(-50%)",
            backgroundColor: "#00cd7e",
            display: `${showScrollLeft ? "inline-flex" : "none"} !important`, // Add !important
          }}
        >
          <ArrowLeftIcon />
        </IconButton>
        <Box sx={{ minHeight: "378px", height: "100%" }}>
          {data ? (
            <div style={{ height: "100%" }}>
              <div>
                <Button
                  sx={{
                    color: "rgb(0, 91, 198)",
                    fontWeight: "600",
                    marginRight: 2,
                    bgcolor: selectedName === null ? "#dddddd" : "inherit",
                  }}
                  onClick={handleAllButtonClick}
                >
                  All
                </Button>
                {data.map((item, index) => (
                  <Button
                    sx={{
                      color: "rgb(0, 91, 198)",
                      fontWeight: "600",
                      marginRight: 2,
                      bgcolor:
                        selectedName === item.name ? "#dddddd" : "inherit",
                    }}
                    key={index}
                    onClick={() => handleButtonClick(item.name)}
                  >
                    {item.name}
                  </Button>
                ))}
              </div>
              <Box
                ref={scrollContainerRef}
                sx={{
                  display: "flex",
                  overflowX: "auto", // Ensure this is set to 'scroll' or 'auto'
                  p: 1,
                  whiteSpace: "nowrap",
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                }}
              >
                {filteredData &&
                  filteredData.map((item, index) => (
                    <Card
                      key={index}
                      sx={{
                        backgroundColor: "#f7f7f7",
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

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            mt: 1,
                          }}
                        >
                          {item.startTime !== "Invalid Date" ? (
                            <>
                              <AccessTime sx={{ mr: 1 }} />
                              <Typography variant="body1">
                                {convertTo12HourFormat(item.startTime)}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="body1">&nbsp;</Typography>
                          )}
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
        </Box>
      </Box>
    </Container>
  );
}

export default Iframe;
