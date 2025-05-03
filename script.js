console.log("🚀 script.js has loaded successfully!");

// Post data
const posts = [
  {
    type: "video",
    username: "Auvelity® dextromethorphan HBr and bupropion HCl",
    media: [
      "https://raw.githubusercontent.com/Alice-Ji/ISIStudy2/main/depression-auvelity-man.mp4",
    ],
    caption: "Sponsored Content",
    likes: 0,
    liked: false,
    comments: [],
    profilePic:
      "https://raw.githubusercontent.com/Alice-Ji/ISIStudy2/main/auvelity_avatar.jpg",
  },
];

//setupVideoAutoplay
function setupVideoAutoplay() {
  let userHasInteracted = false;

  document.addEventListener("scroll", () => {
    if (!userHasInteracted) {
      document.querySelectorAll(".video-post").forEach((video) => {
        video.muted = false;
      });
      userHasInteracted = true;
      enableEndedListeners(); // 💥 Only after scroll, enable ended listeners
    }
  });

  const videos = document.querySelectorAll(".video-post");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.play().catch((error) => console.warn("Autoplay prevented:", error));
        } else {
          entry.target.pause();
        }
      });
    },
    { threshold: 0.9 }
  );

  videos.forEach((video) => {
    observer.observe(video);

    const playOverlay = video.parentElement.querySelector(".play-overlay");
    if (playOverlay) playOverlay.classList.remove("hidden");

    video.addEventListener("click", () => {
      if (video.paused) {
        video.play();
        if (playOverlay) playOverlay.classList.add("hidden");
      } else {
        video.pause();
        if (playOverlay) playOverlay.classList.remove("hidden");
      }
    });

    video.addEventListener("play", () => {
      setTimeout(() => {
        if (playOverlay) playOverlay.classList.add("hidden");
      }, 100);
    });

    video.addEventListener("pause", () => {
      if (playOverlay) playOverlay.classList.remove("hidden");
    });

    // 🚫 DO NOT attach 'ended' yet
  });
}

// ✅ New helper function
function enableEndedListeners() {
  const videos = document.querySelectorAll(".video-post");
  videos.forEach((video) => {
    video.addEventListener("ended", () => {
      console.log("🎬 Video ended, notifying Qualtrics...");
      const qualtricsURL = "https://illinois.qualtrics.com";
      window.parent.postMessage({ videoEnded: true }, qualtricsURL);
    });
  });
}


// randomize post order
function shufflePosts() {
  for (let i = posts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [posts[i], posts[j]] = [posts[j], posts[i]]; // Swap elements
  }
}

// Function to render posts
function renderFeed() {
  shufflePosts(); // 🔀 Randomize posts before rendering

  const feed = document.getElementById("feed");
  feed.innerHTML = ""; // Clear existing content

  posts.forEach((post, index) => {
    const postElement = document.createElement("div");
    postElement.classList.add("post");

    let mediaContent = "";
    if (post.type === "image") {
      mediaContent = `<img src="${post.media[0]}" alt="Post image">`;
    } else if (post.type === "video") {
      mediaContent = `
      <div class="video-container">
      <video class="video-post" muted playsinline>
          <source src="${post.media[0]}" type="video/mp4">
          Your browser does not support the video tag.
      </video>
      <div class="play-overlay hidden"></div> <!-- ✅ This is the only play button now -->
  </div>
      `;
    } else if (post.type === "carousel") {
      mediaContent = `
        <div class="carousel-container">
            <button class="carousel-btn left" onclick="prevImage(${index})">&lt;</button>
            <img id="carousel-${index}" src="${post.media[0]}" alt="Carousel Image">
            <button class="carousel-btn right" onclick="nextImage(${index})">&gt;</button>
            <div class="carousel-indicator" id="indicator-${index}">1 / ${post.media.length}</div>
        </div>
      `;
    }
    // ✅ Add "Learn More" button + record clicks
    if (
      post.username.includes("Auvelity") && // filter username
      post.media[0].includes("auvelity") //filter post media file name
    ) {
      mediaContent += `
          <button class="shop-now-btn" onclick="window.trackShopNowClick('${post.username}')">
          Learn More
          </button>
      `;
    }

    postElement.innerHTML = `
      <div class="post-header">
      <img class="avatar" src="${post.profilePic}" alt="Avatar">
          <span class="username">${post.username}</span>
      </div>
      ${mediaContent}
      <p>${post.caption}</p>
      <div class="post-actions">
          <img id="like-btn-${index}" src="https://raw.githubusercontent.com/ruochongji/affordancePSIPSR/main/ins-like1.png" 
               alt="Like" class="action-icon" onclick="window.likePost(${index})">
          <img id="comment-btn-${index}" src="https://raw.githubusercontent.com/ruochongji/affordancePSIPSR/main/ins-comment.png"
               alt="Comment" class="action-icon" onclick="window.toggleComment(${index})">
      </div>
      <div id="comment-section-${index}" class="comment-section hidden">
          <div class="comment-input-container">
              <input type="text" id="comment-input-${index}" placeholder="Add a comment...">
              <img id="send-comment-${index}" src="https://raw.githubusercontent.com/ruochongji/affordancePSIPSR/main/ins-sendcomment.png" 
                   alt="Send" class="send-icon" onclick="window.addComment(${index})">
          </div>
          <ul id="comments-${index}"></ul>
      </div>
    `;

    feed.appendChild(postElement);
    updateComments(index);
  });

  setupVideoAutoplay(); // ✅ Ensure observer is set up after rendering
}

// Function to switch to the next image in the carousel
window.nextImage = function (index) {
  if (posts[index].type === "carousel") {
    if (posts[index].currentIndex < posts[index].media.length - 1) {
      posts[index].currentIndex++;
      console.log(
        `➡️ Next Image: Now showing ${posts[index].currentIndex + 1} / ${
          posts[index].media.length
        }`
      );
      updateCarousel(index);
    }
  }
};

// Function to switch to the previous image in the carousel
window.prevImage = function (index) {
  if (posts[index].type === "carousel") {
    if (posts[index].currentIndex > 0) {
      posts[index].currentIndex--;
      console.log(
        `⬅️ Previous Image: Now showing ${posts[index].currentIndex + 1} / ${
          posts[index].media.length
        }`
      );
      updateCarousel(index);
    }
  }
};

// Function to update the carousel display, including the indicator
function updateCarousel(index) {
  let post = posts[index];

  console.log(
    `🔄 Updating carousel ${index}: Now at ${post.currentIndex + 1} / ${
      post.media.length
    }`
  );

  let imageElement = document.getElementById(`carousel-${index}`);
  let indicatorElement = document.getElementById(`indicator-${index}`);

  if (imageElement) {
    imageElement.src = post.media[post.currentIndex]; // Update the image
  } else {
    console.warn(`❌ Image element "carousel-${index}" not found.`);
  }

  if (indicatorElement) {
    indicatorElement.textContent = `${post.currentIndex + 1} / ${
      post.media.length
    }`; // Fix: Removed extra parentheses
  } else {
    console.warn(`❌ Indicator element "indicator-${index}" not found.`);
  }
}

// Function to like a post (only once)
window.likePost = function (index) {
  let likeBtn = document.getElementById(`like-btn-${index}`);
  if (!posts[index].liked) {
    posts[index].likes++;
    posts[index].liked = true;
    likeBtn.src =
      "https://raw.githubusercontent.com/ruochongji/affordancePSIPSR/main/ins-like2.png";
  } else {
    posts[index].likes--;
    posts[index].liked = false;
    likeBtn.src =
      "https://raw.githubusercontent.com/ruochongji/affordancePSIPSR/main/ins-like1.png";
  }
};

// Function to add a comment
window.addComment = function (index) {
  const input = document.getElementById(`comment-input-${index}`);
  if (input.value.trim()) {
    posts[index].comments.push(input.value);
    updateComments(index);
    input.value = ""; // Clear input
  }
};

// Function to update comments
function updateComments(index) {
  const commentList = document.getElementById(`comments-${index}`);
  commentList.innerHTML = ""; // Clear and re-add comments

  posts[index].comments.forEach((comment) => {
    const newComment = document.createElement("li");
    newComment.textContent = comment;

    // 🚨 THIS FORCES THE COMMENTS TO BE ON A NEW LINE 🚨
    newComment.style.display = "block";
    newComment.style.width = "100%";
    newComment.style.marginTop = "5px";
    newComment.style.wordWrap = "break-word";
    newComment.style.clear = "both"; // 💥 Ensures no floating elements next to it

    commentList.appendChild(newComment);
  });

  // 🚀 FORCES THE BROWSER TO RERENDER THE COMMENTS 🚀
  commentList.style.display = "none";
  setTimeout(() => (commentList.style.display = "block"), 10);
}

// Load the feed when the page loads
renderFeed();

// Global variable to store all comments
let collectedComments = [];

window.addComment = function (index) {
  const input = document.getElementById(`comment-input-${index}`);
  if (input.value.trim()) {
    let comment = input.value.trim();
    posts[index].comments.push(comment);
    collectedComments.push(comment); // Store comment in global array
    updateComments(index);
    input.value = ""; // Clear input
  }
};

window.addComment = function (index) {
  const input = document.getElementById(`comment-input-${index}`);
  if (input.value.trim()) {
    let comment = input.value.trim();
    posts[index].comments.push(comment);
    collectedComments.push(comment);
    updateComments(index);
    input.value = "";

    console.log("✅ addComment() triggered! New comment:", comment);

    // Auto-send comments
    sendCommentsToQualtrics();
  }
};

window.sendCommentsToQualtrics = function () {
  let commentsString = collectedComments.join(" | ");
  console.log("Trying to send comments:", commentsString);

  let qualtricsURL = "https://illinois.qualtrics.com";
  console.log("Sending message to:", qualtricsURL);

  window.parent.postMessage({ comments: commentsString }, qualtricsURL);
};

window.toggleComment = function (index) {
  let commentSection = document.getElementById(`comment-section-${index}`);
  commentSection.classList.toggle("hidden"); // Show/hide comment section
};

window.trackShopNowClick = function (username) {
  const message = `Shop Now clicked for: ${username}`;
  console.log("🛒", message);

  // Send it to Qualtrics
  const qualtricsURL = "https://illinois.qualtrics.com";
  window.parent.postMessage({ shopNowClick: message }, qualtricsURL);

  // Show popup
  showPopup();
};

function showPopup() {
  const popup = document.getElementById("popup-modal");
  if (popup) popup.classList.remove("hidden");
}

function hidePopup() {
  const popup = document.getElementById("popup-modal");
  if (popup) popup.classList.add("hidden");
}

//show and hide popup
window.showPopup = function () {
  const popup = document.getElementById("popup-modal");
  if (popup) popup.classList.remove("hidden");
};

window.hidePopup = function () {
  const popup = document.getElementById("popup-modal");
  if (popup) popup.classList.add("hidden");
};
