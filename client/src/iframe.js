import {
  Container,
  Skeleton,
  Button,
  Card,
  Typography,
  CardContent,
  Box,
} from "@mui/material";
import axios from "axios";
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
            name: item.name,
            startDate: subItem.date,
            startTime: subItem.startTime,
            timings: null, // Add timings data here if available
            title: subItem.title,
            landscapeImage: subItem.landscapeImage,
            shareUrl: subItem.shareUrl,
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
    if (!dateString) {
      return null;
    }
    const date = new Date(dateString);

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

  const convertTo12HourFormat = (timeString) => {
    const date = new Date(timeString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";

    if (hours > 12) {
      hours -= 12;
    } else if (hours === 0) {
      hours = 12;
    }

    const formattedMinutes = minutes.toString().padStart(2, "0");
    return `${hours}:${formattedMinutes} ${period}`;
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
        <Box sx={{ minHeight: "378px", display: "flex" }}>
          {data ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                overflow: "auto", // Add this line
              }}
            >
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
                  overflowX: "auto",
                  p: 1,
                  whiteSpace: "nowrap",
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                  flexGrow: 1, // This will make the Box take up the remaining space
                }}
              >
                {filteredData &&
                  filteredData.map((item, index) => (
                    <Card
                      key={index}
                      onClick={() => window.open(`${item.shareUrl}`, "_blank")}
                      sx={{
                        backgroundColor: "#f7f7f7",
                        flex: "0 0 auto",
                        mr: 1,
                        cursor: "pointer",
                      }}
                    >
                      <CardContent
                        sx={{
                          maxWidth: "300px",
                          maxHeight: "500px",
                          overflow: "auto",
                        }}
                      >
                        {/*  Add Event Image here */}
                        <div
                          style={{
                            width: "100%",
                            height: "170px",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={
                              item.landscapeImage
                                ? item.landscapeImage.url
                                : `/images/${item.name}.jpeg`
                            }
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
                        {/*  Add Event date here */}
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
                            {formatCardDate(item.startDate)}
                          </Typography>
                        </Box>
                        {/*  Add stadium icon and venue here */}
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
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  flexGrow: 1,
                }}
              >
                <Skeleton
                  sx={{ width: "90%", height: "300px", marginBottom: "-50px" }}
                />
                <Skeleton
                  sx={{ width: "90%", height: "150px" }}
                  animation="wave"
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  flexGrow: 1,
                }}
              >
                <Skeleton
                  sx={{ width: "90%", height: "300px", marginBottom: "-50px" }}
                />
                <Skeleton
                  sx={{ width: "90%", height: "150px" }}
                  animation="wave"
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  flexGrow: 1,
                }}
              >
                <Skeleton
                  sx={{ width: "90%", height: "300px", marginBottom: "-50px" }}
                />
                <Skeleton
                  sx={{ width: "90%", height: "150px" }}
                  animation="wave"
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default Iframe;
