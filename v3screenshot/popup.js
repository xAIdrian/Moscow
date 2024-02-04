document.addEventListener("DOMContentLoaded", function() {
    const captureButton = document.getElementById("capture");
    const screenshotContainer = document.getElementById("screenshotContainer");
  
    captureButton.addEventListener("click", function() {
      chrome.tabs.captureVisibleTab(function(screenshotDataUrl) {
        //get the image object
        const screenshotImage = new Image();
        screenshotImage.src = screenshotDataUrl;
        //add to view
        screenshotContainer.appendChild(screenshotImage);
        //prepare image for backend
        const blob = dataUrlToBlob(screenshotDataUrl);
        const formData = new FormData();
        formData.append("myFile", blob, "screenshot.png");
        //send image to server
        fetch("http://localhost:3000/upload", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((result) => {
            console.log("Success:", result);
            //send file path to backend
            fetch("http://localhost:3000/opener", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ filePath: result.file }),
            })
              .then((response) => response.json())
              .then((result) => {
                console.log("Success:", result);
                //display result
                const resultDiv = document.createElement("div");
                resultDiv.textContent = result;
                screenshotContainer.appendChild(resultDiv);
              })
              .catch((error) => {
                console.error("Error:", error);
              });
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      });
    });
  });

  function dataUrlToBlob(dataUrl) {
    const parts = dataUrl.split(';base64,');
    const contentType = parts[0].split(":")[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
  
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
  
    return new Blob([uInt8Array], { type: contentType });
  }
  