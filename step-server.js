import express from "express";
import http from "http";
import https from "https";
import { JSDOM } from "jsdom";
import Step from "step";
import { adjustUrl } from "./utils.js";

const app = express();


const fetchTitle = (url, callback) => {
  const protocol = url.startsWith("https") ? https : http;

  protocol
    .get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => (data += chunk));

      res.on("end", () => {
        try {
          const dom = new JSDOM(data);
          const title = dom.window.document.querySelector("title")?.textContent || "NO RESPONSE";
          callback(null, title);
        } catch {
          callback(null, "NO RESPONSE");
        }
      });
    })
    .on("error", () => callback(null, "NO RESPONSE"));
};

app.get("/I/want/title", (req, res) => {
  let { address } = req.query;
  if (!address) return res.status(400).send("No address provided");
  console.log("step funcjafdsj;")

  const addresses = Array.isArray(address) ? address : [address];
  const urls = adjustUrl(addresses)

  Step(
    function fetchTitles() {
      const group = this.group();
      console.log("group => ",group)
      urls.forEach((url) => fetchTitle(url, group()));
    },
    function renderResults(err, results) {
      if (err) return res.status(500).send("Internal Server Error");

      const htmlResponse = `
        <html>
          <head></head>
          <body>
            <h1>Following are the titles of given websites:</h1>
            <ul>
              ${urls.map((url, i) => `<li>${url} - "${results[i]}"</li>`).join("")}
            </ul>
          </body>
        </html>`;

      res.send(htmlResponse);
    }
  );
});


app.use((req, res) => res.status(404).send("Not Found"));

const PORT = 3000;
app.listen(PORT, () => console.log(` Server running on ${PORT}`));
