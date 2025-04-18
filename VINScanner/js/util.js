/* Extracts and returns VIN details from the parsed VIN string
 *
 * @param {Object} result - The parsed result object containing VIN details.
 * @returns {Object} An object with key-value pairs of the extracted fields.
 */
export function extractVinDetails(result) {
  const parseResultInfo = {};

  if (!result.exception) {
    parseResultInfo["Region"] = result.getFieldValue("region");
    parseResultInfo["Check Digit"] = result.getFieldValue("checkDigit");
    parseResultInfo["Model Year"] = undefined?.split(",")?.join(" | ");
    parseResultInfo["Plant Code"] = result.getFieldValue("plantCode");
    parseResultInfo["VIS"] = result.getFieldValue("VIS");
  }

  return parseResultInfo;
}

/**
 * Create an HTML paragraph element containing the document field name and value.
 *
 * @param {string} field - The document field name.
 * @param {string} value - The document field value.
 * @returns {HTMLElement} The paragraph element containing the formatted document field name and value.
 */
export function resultToHTMLElement(field, value) {
  const p = document.createElement("p");
  p.className = "parsed-filed";
  const spanFieldName = document.createElement("span");
  spanFieldName.className = "field-name";
  const spanValue = document.createElement("span");
  spanValue.className = "field-value";

  spanFieldName.innerText = `${field} : `;
  spanValue.innerText = `${value || "Not detected"}`;

  p.appendChild(spanFieldName);
  p.appendChild(spanValue);

  return p;
}

/**
 * Checks and returns the current screen orientation.
 *
 * @returns {string} The current screen orientation ('portrait' or 'landscape').
 */
export function checkOrientation() {
  if (window.matchMedia("(orientation: portrait)").matches) {
    return "portrait";
  } else if (window.matchMedia("(orientation: landscape)").matches) {
    return "landscape";
  }
}

export function getVisibleRegionOfVideo() {
  if (!cameraView || !cameraView.getVideoElement()) return;
  const video = cameraView.getVideoElement();
  const { videoWidth, videoHeight } = video;
  const objectFit = cameraView.getVideoFit();

  // Adjust dimensions based on orientation
  const isPortrait = checkOrientation() === "portrait";
  const width = isPortrait ? Math.min(videoWidth, videoHeight) : Math.max(videoWidth, videoHeight);
  const height = isPortrait ? Math.max(videoWidth, videoHeight) : Math.min(videoWidth, videoHeight);

  // Get the CSS dimensions of the video element
  const { width: videoCSSWidth, height: videoCSSHeight } = cameraView._innerComponent.getBoundingClientRect();
  if (videoCSSWidth <= 0 || videoCSSHeight <= 0) {
    throw new Error(`Unable to get video dimensions. Video may not be rendered on the page.`);
  }

  const videoCSSWHRatio = videoCSSWidth / videoCSSHeight,
    videoWHRatio = width / height;
  let cssScaleRatio;

  // Set visible region in pixels
  const regionInPixels = {
    x: 0,
    y: 0,
    width: width,
    height: height,
    isMeasuredInPercentage: false,
  };

  if (objectFit === "cover") {
    if (videoCSSWHRatio < videoWHRatio) {
      // a part of length is invisible
      cssScaleRatio = videoCSSHeight / height;
      regionInPixels.x = Math.floor((width - videoCSSWidth / cssScaleRatio) / 2);
      regionInPixels.y = 0;
      regionInPixels.width = Math.ceil(videoCSSWidth / cssScaleRatio);
      regionInPixels.height = height;
    } else {
      // a part of height is invisible
      cssScaleRatio = videoCSSWidth / width;
      regionInPixels.x = 0;
      regionInPixels.y = Math.floor((height - videoCSSHeight / cssScaleRatio) / 2);
      regionInPixels.width = width;
      regionInPixels.height = Math.ceil(videoCSSHeight / cssScaleRatio);
    }
  }
  return regionInPixels;
}

/** Show notification banner to users
 * @params {string} message - noficiation message
 * @params {string} className - CSS class name to show notification status
 */
export function showNotification(message, className) {
  notification.className = className;
  notification.innerText = message;
  notification.style.display = "block";
  notification.style.opacity = 1;
  setTimeout(() => {
    notification.style.opacity = 0;
    notification.style.display = "none";
  }, 2000);
}

/**
 * Toggles the scan roientation between 'portrait' and 'landscape'
 */
export function toggleScanOrientation() {
  scanOrientation = scanOrientation === "portrait" ? "landscape" : "portrait";
}

/**
 * Reset scan orientation to 'landscape'
 */
export function resetScanOrientation() {
  scanOrientation = "landscape";
}

/**
 * Checks if we should show the switch scan orientation button
 * @returns true if screen is portrait and current mode is scanning barcode, false otherwise
 */
export function shouldShowScanOrientation() {
  const isScreenPortrait = window.innerHeight > window.innerWidth;
  const isScanningBarcode = currentMode === "barcode";
  return isScreenPortrait && isScanningBarcode;
}

/**
 * Checks if we should show the switch scan mode buttons
 * @returns true if cameraEnhancer is open, false otherwise
 */
export function shouldShowScanModeContainer() {
  const isHomepageClosed = homePage.style.display === "none";
  const isResultClosed = resultContainer.style.display === "none" || resultContainer.style.display === "";
  scanModeContainer.style.display = isHomepageClosed && isResultClosed ? "flex" : "none";
}

/** Check if current resolution is Full HD or HD
 * @params {Object} currentResolution - an object with `width` and `height` to represent the current resolution of the camera
 * @returns {string} Either "HD" or "Full HD" depending of the resolution of the screen
 */
export const judgeCurResolution = (currentResolution) => {
  const width = currentResolution?.width ?? 0;
  const height = currentResolution?.height ?? 0;
  const minValue = Math.min(width, height);
  const maxValue = Math.max(width, height);

  if (minValue >= 480 && minValue <= 960 && maxValue >= 960 && maxValue <= 1440) {
    return "HD";
  } else if (minValue >= 900 && minValue <= 1440 && maxValue >= 1400 && maxValue <= 2160) {
    return "Full HD";
  }
};
