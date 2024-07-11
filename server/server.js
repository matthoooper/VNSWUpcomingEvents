const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");

// Middleware to set security headers
app.use((req, res, next) => {
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: https://assets-eu-01.kc-usercontent.com; script-src 'self'; style-src 'self' 'unsafe-inline';"
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});

async function fetchJSON({ url, headers = {}, name }) {
  const response = await axios.get(url, { headers });
  return { name, data: response.data };
}

function normalizeData({ name, data }) {
  if (!data) {
    return { name, items: [] }; // return a default value when data is null
  }

  let items = data.items ? data.items : data;

  if (name === "Commbank" || name === "Accor") {
    items = items.sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return dateA - dateB;
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
      url: "https://cms-service.onrewind.tv/stadium-mobile/kentico/events?limit=30",
      headers: { "x-account-key": "ryCSDIO96" },
    },
    {
      name: "Commbank",
      url: "https://cms-service.onrewind.tv/stadium-mobile/kentico/events?limit=30",
      headers: { "x-account-key": "B13TwU_cT" },
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

app.get("/api/eventnames", async (req, res) => {
  const jsonUrls = [
    {
      name: "Accor",
      url: "https://cms-service.onrewind.tv/stadium-mobile/kentico/events?limit=30",
      headers: { "x-account-key": "ryCSDIO96" },
    },
    {
      name: "Commbank",
      url: "https://cms-service.onrewind.tv/stadium-mobile/kentico/events?limit=30",
      headers: { "x-account-key": "B13TwU_cT" },
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
    // {
    //   name: "MJS",
    //   url: "https://cms-service.onrewind.tv/stadium-mobile/kentico/events?limit=30",
    //   headers: { "x-account-key": "B16U1sGss" },
    // },
    // {
    //   name: "WSEC",
    //   url: "https://cms-service.onrewind.tv/stadium-mobile/kentico/events?limit=30",
    //   headers: { "x-account-key": "Bky7fofji" },
    // },
    // {
    //   name: "NEC",
    //   url: "https://cms-service.onrewind.tv/stadium-mobile/kentico/events?limit=30",
    //   headers: { "x-account-key": "B1Fjyo5Fn" },
    // },
  ];
  try {
    const data = await fetchMultipleJSONs(jsonUrls);
    // Step 1: Flatten the array of items from all stadiums
    const allItems = data.flatMap((stadium) => stadium.items);
    // Step 2: Sort the flattened array by startTime
    const sortedItems = allItems.sort(
      (a, b) => new Date(a.startTime) - new Date(b.startTime)
    );
    // Step 3: Map the sorted array to extract titles
    const sortedTitles = sortedItems.map((item) => item.title);
    // Modify here: Slice the array to get only the top 10 results
    const sortedTitlesWithTime = sortedItems.map(
      (item) => `${item.title} (${item.startTime})`
    );
    // Modify here: Slice the array to get only the top 10 results
    const topTenTitlesWithFormattedDate = sortedItems
      .map((item) => {
        const date = new Date(item.startTime);
        const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${date.getFullYear()}`;
        return `${item.title} (${formattedDate})`;
      })
      .slice(0, 10); // Ensures only the top 10 are selected

    res.json(topTenTitlesWithFormattedDate);
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
