# ISI Study2

### qualtrics javascript v1 (without video end event listener)
Qualtrics.SurveyEngine.addOnload(function () {
  window.addEventListener("message", function (event) {
    console.log("📨 Received message from iframe:", event.origin, event.data);

    // ✅ SECURITY CHECK — make sure this matches your iframe origin
    if (event.origin !== "https://alice-ji.github.io") return;

    if (event.data.shopNowClick) {
      console.log("✅ Setting Embedded Data: shop_now_click =", event.data.shopNowClick);
      Qualtrics.SurveyEngine.setEmbeddedData("shop_now_click", event.data.shopNowClick);
    }

    if (event.data.comments) {
      console.log("✅ Setting Embedded Data: user_comments =", event.data.comments);
      Qualtrics.SurveyEngine.setEmbeddedData("user_comments", event.data.comments);
    }
  });
});

### qualtrics javascript v2 (+ video end event listener & hide next button)
Qualtrics.SurveyEngine.addOnload(function () {
  this.hideNextButton(); // Hide NextButton initially

  window.addEventListener("message", function (event) {
    console.log("📨 Received message from iframe:", event.origin, event.data);

    if (event.origin !== "https://alice-ji.github.io") return;

    if (event.data.shopNowClick) {
      Qualtrics.SurveyEngine.setEmbeddedData("shop_now_click", event.data.shopNowClick);
    }

    if (event.data.comments) {
      Qualtrics.SurveyEngine.setEmbeddedData("user_comments", event.data.comments);
    }

    if (event.data.videoEnded) {
      console.log("✅ Video ended, showing NextButton...");
      this.showNextButton();
    }
  }.bind(this));
});
