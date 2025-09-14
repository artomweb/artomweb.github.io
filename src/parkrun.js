import { formatDate, timeago, getOrdinalSuffix } from "./usefullFunc.js";
import PARKRUN_EVENTS from "./filtered_events.js";

export default function parse5k(data) {
  if (!data || data?.error) {
    console.log("Error processing fallback CSV data:");
    document.getElementById("parkrunCard").classList.add("hidden");
  } else {
    try {
      showParkrunData(data.data); // Pass the relevant part of the data
    } catch (error) {
      console.log("Error processing parkrun data", error);
      document.getElementById("parkrunCard").classList.add("hidden");
    }
  }
}
function showParkrunData(data) {
  const openfreemap = new ol.layer.Group();
  const map = new ol.Map({
    layers: [openfreemap],
    view: new ol.View({
      center: ol.proj.fromLonLat([-2.8, 54.5]),
      zoom: 5.4,
    }),
    target: "parkrunMap",
    interactions: [],
    controls: [],
  });
  olms.apply(openfreemap, "./positron.json");

  const myEvents = data.events;

  const vectorSource = new ol.source.Vector({
    features: new ol.format.GeoJSON().readFeatures(PARKRUN_EVENTS, {
      featureProjection: "EPSG:3857",
    }),
  });

  const grayLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: vectorSource
        .getFeatures()
        .filter((f) => !myEvents.includes(f.get("eventname"))),
    }),
    style: new ol.style.Style({
      image: new ol.style.Circle({
        radius: 4,
        fill: new ol.style.Fill({ color: "lightgrey" }),
        stroke: new ol.style.Stroke({ color: "white", width: 0.5 }),
      }),
    }),
  });

  const greenLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: vectorSource
        .getFeatures()
        .filter((f) => myEvents.includes(f.get("eventname"))),
    }),
    style: new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({ color: "green" }),
        stroke: new ol.style.Stroke({ color: "white", width: 0.5 }),
      }),
    }),
  });

  grayLayer.setZIndex(1);
  greenLayer.setZIndex(2);

  map.addLayer(grayLayer);
  map.addLayer(greenLayer);

  // === Tooltip setup ===
  const tooltipEl = document.createElement("div");
  tooltipEl.className = "tooltip hidden";
  document.body.appendChild(tooltipEl);

  const tooltip = new ol.Overlay({
    element: tooltipEl,
    offset: [10, 0],
    positioning: "center-left",
  });
  map.addOverlay(tooltip);

  map.on("pointermove", function (evt) {
    const feature = map.forEachFeatureAtPixel(evt.pixel, (feat, layer) => {
      if (layer === greenLayer) return feat;
    });

    if (feature) {
      const eventName = feature.get("EventShortName");
      tooltipEl.innerHTML = eventName;
      tooltip.setPosition(evt.coordinate);
      tooltipEl.classList.remove("hidden");
    } else {
      tooltipEl.classList.add("hidden");
    }
  });

  document.getElementById("parkrunComplete").innerHTML =
    data.events.length + "/" + PARKRUN_EVENTS.features.length;
  document.getElementById("parkrunCount").innerHTML = data.runCount;
  document.getElementById("parkrunFastest").innerHTML = data.fastestTime;
  document.getElementById("parkrunBestPos").innerHTML =
    data.bestPosition + getOrdinalSuffix(data.bestPosition);

  const formattedDate = formatDate(data.lastRunDate);
  const dateOfLastRunMessage = `${formattedDate} (${timeago(
    data.lastRunDate
  )})`;

  document.getElementById("lastParkrun").innerHTML = dateOfLastRunMessage;
}
