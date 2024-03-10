import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import { APIkey } from "./secretkeys.js";

const app = express();
const port = 3000;
var option = "none";

const API_URL = "https://maps.googleapis.com/maps/api/js?";
const GEOCODE_GOOGLE_API_URL =
  "https://maps.googleapis.com/maps/api/geocode/json?";
const DISTANCEMATRIX_API_URL =
  "https://maps.googleapis.com/maps/api/distancematrix/json?";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  option = "none";
  try {
    res.render("index.ejs", {
      APIkey: APIkey,
      API_URL: API_URL,
      option: option,
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/find", async (req, res) => {
  const origin = req.body["origin"];
  option = "find";
  try {
    if (origin) {
      const result = await axios.get(GEOCODE_GOOGLE_API_URL, {
        params: {
          address: origin,
          key: APIkey,
        },
      });
      const address = result.data.results[0].formatted_address;
      const latitude = result.data.results[0].geometry.location.lat;
      const longitude = result.data.results[0].geometry.location.lng;
      res.render("index.ejs", {
        APIkey: APIkey,
        API_URL: API_URL,
        address: address,
        latitude: latitude,
        longitude: longitude,
        option: option,
      });
    } else {
      option = "none";
      const message = "Enter a place of origin";
      res.render("index.ejs", {
        APIkey: APIkey,
        API_URL: API_URL,
        option: option,
        message: message,
      });
    }
  } catch (error) {
    res.render("index.ejs", { content: JSON.stringify(error.response.data) });
  }
});

app.post("/track", async (req, res) => {
  const address1 = req.body["origin"];
  const address2 = req.body["destination"];
  option = "track";
  try {
    if (address1 && address2) {
      let origin = await axios.get(GEOCODE_GOOGLE_API_URL, {
        params: {
          address: address1,
          key: APIkey,
        },
      });
      let destination = await axios.get(GEOCODE_GOOGLE_API_URL, {
        params: {
          address: address2,
          key: APIkey,
        },
      });

      const origin1 = origin.data.results[0];
      const destination1 = destination.data.results[0];

      const Olatitude = origin1.geometry.location.lat;
      const Olongitude = origin1.geometry.location.lng;
      const Dlatitude = destination1.geometry.location.lat;
      const Dlongitude = destination1.geometry.location.lng;

      origin = origin1.formatted_address;
      destination = destination1.formatted_address;

      let distancematrix = await axios.get(DISTANCEMATRIX_API_URL, {
        params: {
          departure_time: "now",
          region: "ZA",
          mode: "driving",
          destinations: destination,
          origins: origin,
          key: APIkey,
        },
      });

      const element = distancematrix.data.rows;
      const elements = element.length;
      var random = Math.floor(Math.random() * elements);
      const route = element[random];
      const routes = route.elements.length;
      var random2 = Math.floor(Math.random() * routes);
      const decision = route.elements[random2];

      const distance = decision.distance.text;
      const time = decision.duration.text;

      res.render("index.ejs", {
        APIkey: APIkey,
        API_URL: API_URL,
        origin: origin,
        destination: destination,
        Olatitude: Olatitude,
        Olongitude: Olongitude,
        Dlatitude: Dlatitude,
        Dlongitude: Dlongitude,
        distance: distance,
        time: time,
        option: option,
      });
    } else {
      if (!address1 && address2) {
        option = "none";
        const message1 = "Enter a place of origin";
        const trackMessage = true;
        res.render("index.ejs", {
          APIkey: APIkey,
          API_URL: API_URL,
          option: option,
          message1: message1,
          trackMessage: trackMessage,
        });
      } else if (address1 && !address2) {
        option = "none";
        const message2 = "Enter a place of destination";
        const trackMessage = true;
        res.render("index.ejs", {
          APIkey: APIkey,
          API_URL: API_URL,
          option: option,
          message2: message2,
          trackMessage: trackMessage,
        });
      } else {
        option = "none";
        const message1 = "Enter a place of origin";
        const message2 = "Enter a place of destination";
        const trackMessage = true;
        res.render("index.ejs", {
          APIkey: APIkey,
          API_URL: API_URL,
          option: option,
          message1: message1,
          message2: message2,
          trackMessage: trackMessage,
        });
      }
    }
  } catch (error) {
    res.render("index.ejs", { content: JSON.stringify(error) });
  }
});

app.listen(process.env.PORT || port, () => {
  console.log(`Server is running on port ${port}`);
});
