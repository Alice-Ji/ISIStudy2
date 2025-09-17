console.log("🚀 qel/script.js has loaded successfully!");

// -----------------------------
// State persistence
// -----------------------------
function saveState() {
  localStorage.setItem("qel_state", JSON.stringify({
    posts,
    collectedComments,
    shopNowClicks
  }));
}

function loadState() {
  const saved = localStorage.getItem("qel_state");
  if (saved) {
    const state = JSON.parse(saved);
    if (state.posts) posts = state.posts;
    if (state.collectedComments) collectedComments = state.collectedComments;
    if (state.shopNowClicks) shopNowClicks = state.shopNowClicks;
  }
}

// -----------------------------
// Post data
// -----------------------------
let posts = [
  {
    type: "video",
    username: "Qelbree® (viloxazine)",
    media: [
      "https://raw.githubusercontent.com/Alice-Ji/ISIStudy2/main/qel_control.mp4",
    ],
    caption: "Sponsored Content",
    likes: 0,
    liked: false,
    comments: [],
    profilePic:
      "https://raw.githubusercontent.com/Alice-Ji/ISIStudy2/main/qelbree_avatar.jpg",
  },
];

// Global arrays
let collectedComments = [];
let shopNowClicks = [];
const qualtricsURL = "https://illinois.qualtrics.com";

// Load saved state if it exists
loadState();

// -----------------------------
// Video player (click-to-play)
// -----------------------------
function setupVideoPlayer() {
  const videos = document.querySelectorAll(".video-post");

  videos.forEach((video) => {
    const playOverlay = video.parentElement.querySelector(".play-overlay");
    if (playOverlay) playOverlay.classList.remove("hidden");

    video.addEventListener("click", () => {
      if (video.paused) {
        video.muted = false;
        video.play().catch(() => {});
        if (playOverlay) playOverlay.classList.add("hidden");
      } else {
        video.play(); // force play through (no toggle pause)
      }
    });

    video.addEventListener("contextmenu", (e) => e.preventDefault());

    video.addEventListener("play", () => {
      if (playOverlay) playOverlay.classList.add("hidden");
    });
    video.addEventListener("pause", () => {
      if (playOverlay) playOverlay.classList.remove("hidden");
    });
  });

  enableEndedListeners();
}

// ✅ Notify Qualtrics when video ends
function enableEndedListeners() {
  const videos = document.querySelectorAll(".video-post");
  videos.forEach((video) => {
    video.addEventListener("ended", () => {
      console.log("🎬 Video ended, notifying Qualtrics...");
      window.parent.postMessage({ qel_videoEnded: true }, qualtricsURL);
    });
  });
}

// -----------------------------
// Shuffle + render feed
// -----------------------------
function shufflePosts() {
  for (let i = posts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [posts[i], posts[j]] = [posts[j], posts[i]];
  }
}

function renderFeed() {
  shufflePosts();

  const feed = document.getElementById("feed");
  feed.innerHTML = "";

  posts.forEach((post, index) => {
    const postElement = document.createElement("div");
    postElement.classList.add("post");

    let mediaContent = "";
    if (post.type === "video") {
      mediaContent = `
        <div class="video-container">
          <video class="video-post" playsinline preload="auto">
              <source src="${post.media[0]}" type="video/mp4">
              Your browser does not support the video tag.
          </video>
          <div class="play-overlay hidden"></div>
        </div>
      `;
    }

    mediaContent += `
      <button class="shop-now-btn" onclick="window.trackShopNowClick('${post.username}')">
        Learn More
      </button>
    `;

    postElement.innerHTML = `
      <div class="post-header">
        <img class="avatar" src="${post.profilePic}" alt="Avatar">
        <span class="username">${post.username}</span>
      </div>
      ${mediaContent}
      <p>${post.caption}</p>
      <div class="post-actions">
        <img id="like-btn-${index}" 
         src="${post.liked 
           ? "https://raw.githubusercontent.com/ruochongji/affordancePSIPSR/main/ins-like2.png" 
           : "https://raw.githubusercontent.com/ruochongji/affordancePSIPSR/main/ins-like1.png"}" 
           alt="Like" class="action-icon" onclick="window.likePost(${index})">
        <img id="comment-btn-${index}" 
             src="https://raw.githubusercontent.com/ruochongji/affordancePSIPSR/main/ins-comment.png"
             alt="Comment" class="action-icon" onclick="window.toggleComment(${index})">
      </div>
      <div id="comment-section-${index}" class="comment-section hidden">
        <div class="comment-input-container">
            <input type="text" id="comment-input-${index}" placeholder="Add a comment...">
            <img id="send-comment-${index}" 
                 src="https://raw.githubusercontent.com/ruochongji/affordancePSIPSR/main/ins-sendcomment.png" 
                 alt="Send" class="send-icon" onclick="window.addComment(${index})">
        </div>
        <ul id="comments-${index}"></ul>
      </div>
    `;

    feed.appendChild(postElement);
    updateComments(index);
  });

  setupVideoPlayer();
}
renderFeed();
