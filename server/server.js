const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");

async function fetchJSON({ url, headers = {}, name }) {
  const response = await axios.get(url, { headers });
  return { name, data: response.data };
}

function normalizeData({ name, data }) {
  let items = data.items ? data.items : data;

  // If the name is 'Commbank' or 'Accor', sort the items by event_date
  if (name === "Commbank" || name === "Accor") {
    items = items.sort((a, b) => {
      const dateA = a.acf.event_date.split("/").reverse().join("-");
      const dateB = b.acf.event_date.split("/").reverse().join("-");
      return new Date(dateA) - new Date(dateB);
    });
  }

  return { name, items };
}

async function fetchMultipleJSONs(jsonUrls) {
  const promises = jsonUrls.map(fetchJSON);
  const results = await Promise.all(promises);
  return results.map(normalizeData);
}

app.get("/api/eventdata", async (req, res) => {
  const jsonUrls = [
    {
      name: "Accor",
      url: "https://accorstadium.com.au/wp-json/wp/v2/events?per_page=100&orderby=id&order=asc",
    },
    {
      name: "Commbank",
      url: "https://commbankstadium.com.au/wp-json/wp/v2/events?per_page=100&orderby=id&order=asc",
    },
    {
      name: "SFS",
      url: "https://cms-service.onrewind.tv/stadium-mobile/kentico/events?limit=30",
      headers: { "x-account-key": "rkZIFi4_c" },
    },
    {
      name: "SCG",
      url: "https://cms-service.onrewind.tv/stadium-mobile/kentico/events?limit=30",
      headers: { "x-account-key": "SkcV2EjmK" },
    },
    {
      name: "MJS",
      url: "https://cms-service.onrewind.tv/stadium-mobile/kentico/events?limit=30",
      headers: { "x-account-key": "B16U1sGss" },
    },
    {
      name: "WSEC",
      url: "https://cms-service.onrewind.tv/stadium-mobile/kentico/events?limit=30",
      headers: { "x-account-key": "Bky7fofji" },
    },
    {
      name: "NEC",
      url: "https://cms-service.onrewind.tv/stadium-mobile/kentico/events?limit=30",
      headers: { "x-account-key": "B1Fjyo5Fn" },
    },
  ];

  try {
    const data = await fetchMultipleJSONs(jsonUrls);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data");
  }
});

app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
