import express from "express";
import http from "http";
import https from "https";
import { JSDOM } from "jsdom";
import { Promise as RsvpPromise } from "rsvp";
import { adjustUrl } from "./utils.js";

const app = express();

const fetchTitle = (url) => {
  return new RsvpPromise((resolve) => {
    const protocol = url.startsWith("https") ? https : http;

    protocol
    
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
            
            data += chunk;
          });

        res.on("end", () => {
          try {
            const dom = new JSDOM(data);
            
            const title =
              dom.window.document.querySelector("title")?.textContent ||
              "NO RESPONSE";
            resolve({ url, title });
          } catch {
            resolve({ url, title: "NO RESPONSE" });
          }
        });
      })
      .on("error", () => resolve({ url, title: "NO RESPONSE" }));
  });
};


app.get("/I/want/title", (req, res) => {
  let { address } = req.query;
  if (!address) return res.status(400).send("No address provided");

  const addresses = Array.isArray(address) ? address : [address];
  const urls = adjustUrl(addresses);

  RsvpPromise.all(urls.map(fetchTitle))
    .then((results) => {
      const htmlResponse = `
        <html>
          <head></head>
          <body>
            <h1>Following are the titles of given websites:</h1>
            <ul>
              ${results
                .map(({ url, title }) => `<li>${url} - "${title}"</li>`)
                .join("")}
            </ul>
          </body>
        </html>`;

      res.send(htmlResponse);
    })
    .catch(() => res.status(500).send("Internal Server Error"));
});


app.use((req, res) => res.status(404).send("Not Found"));


const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running on :${PORT}`)
);
