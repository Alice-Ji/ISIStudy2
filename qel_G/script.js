console.log("🚀 QEL script.js has loaded successfully!");

// -----------------------------
// State persistence
// -----------------------------
function saveState() {
  localStorage.setItem("qel_G_state", JSON.stringify({
    posts,
    collectedComments,
    shopNowClicks
  }));
}

function loadState() {
  const saved = localStorage.getItem("qel_G_state");
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
      "https://raw.githubusercontent.com/Alice-Ji/ISIStudy2/main/qel_GN.mp4",
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
// Video player
// -----------------------------
function setupVideoPlayer() {
  const videos = document.querySelectorAll(".video-post");

  videos.forEach((video) => {
    const playOverlay = video.parentElement.querySelector(".play-overlay");
    if (playOverlay) playOverlay.classList.remove("hidden");

    // ✅ Overlay click starts the video
    if (playOverlay) {
      playOverlay.addEventListener("click", () => {
        video.muted = false;
        video.play().then(() => {
          playOverlay.classList.add("hidden");
        }).catch(err => console.warn("Playback failed:", err));
      });
    }

    // ✅ Prevent right-click seeking / context menu
    video.addEventListener("contextmenu", (e) => e.preventDefault());

    // ✅ Keep overlay hidden when video plays, show if it pauses
    video.addEventListener("play", () => {
      if (playOverlay) playOverlay.classList.add("hidden");
    });
    video.addEventListener("pause", () => {
      if (playOverlay) playOverlay.classList.remove("hidden");
    });
  });

  enableEndedListeners(); // sends Qualtrics video end ping
}


// ✅ Notify Qualtrics when video ends
function enableEndedListeners() {
  const videos = document.querySelectorAll(".video-post");
  videos.forEach((video) => {
    video.addEventListener("ended", () => {
      console.log("🎬 Video ended, notifying Qualtrics...");
      window.parent.postMessage({ qel_videoEnded: true }, "https://illinois.qualtrics.com");
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
    if (post.type === "image") {
      mediaContent = `<img src="${post.media[0]}" alt="Post image">`;
    } else if (post.type === "video") {
      mediaContent = `
      <div class="video-container">
      <video class="video-post" playsinline>
          <source src="${post.media[0]}" type="video/mp4">
          Your browser does not support the video tag.
      </video>
      <div class="play-overlay hidden"></div>
  </div>`;
    }

    //Learn More button
    {
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
          <img id="like-btn-${index}" 
     src="${post.liked 
       ? "https://raw.githubusercontent.com/ruochongji/affordancePSIPSR/main/ins-like2.png" 
       : "https://raw.githubusercontent.com/ruochongji/affordancePSIPSR/main/ins-like1.png"}" 
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

  setupVideoPlayer();;
}

// -----------------------------
// Like / Comment / Click tracking
// -----------------------------
window.likePost = function (index) {
  let likeBtn = document.getElementById(`like-btn-${index}`);
  if (!posts[index].liked) {
    posts[index].likes++;
    posts[index].liked = true;
    likeBtn.src = "https://raw.githubusercontent.com/ruochongji/affordancePSIPSR/main/ins-like2.png";
  } else {
    posts[index].likes--;
    posts[index].liked = false;
    likeBtn.src = "https://raw.githubusercontent.com/ruochongji/affordancePSIPSR/main/ins-like1.png";
  }

  console.log("❤️ Sending QEL like count:", posts[index].likes);
  window.parent.postMessage({ qel_like: posts[index].likes }, qualtricsURL);
  saveState();
};

// ✅ Toggle comment section
window.toggleComment = function (index) {
  const commentSection = document.getElementById(`comment-section-${index}`);
  if (commentSection) {
    commentSection.classList.toggle("hidden");
  }
};

// ✅ Add comment
window.addComment = function (index) {
  const input = document.getElementById(`comment-input-${index}`);
  if (input.value.trim()) {
    let comment = input.value.trim();
    posts[index].comments.push(comment);
    collectedComments.push(comment);
    updateComments(index);
    input.value = "";

    console.log("✅ QEL addComment():", comment);
    sendCommentsToQualtrics();
    saveState();
  }
};

// ✅ Update comments
function updateComments(index) {
  const commentList = document.getElementById(`comments-${index}`);
  commentList.innerHTML = "";

  posts[index].comments.forEach((comment) => {
    const newComment = document.createElement("li");
    newComment.textContent = comment;
    newComment.style.display = "block";
    newComment.style.width = "100%";
    newComment.style.marginTop = "5px";
    newComment.style.wordWrap = "break-word";
    newComment.style.clear = "both";
    commentList.appendChild(newComment);
  });

  commentList.style.display = "none";
  setTimeout(() => (commentList.style.display = "block"), 10);
}

// ✅ Send comments
window.sendCommentsToQualtrics = function () {
  let commentsString = collectedComments.join(" | ");
  console.log("💬 Sending QEL comments:", commentsString);
  window.parent.postMessage({ qel_comment: commentsString }, qualtricsURL);
};

// ✅ Track Shop Now clicks
window.trackShopNowClick = function (username) {
  const video = document.querySelector(".video-post");
  let videoTime = "N/A";
  if (video) {
    const seconds = Math.floor(video.currentTime);
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    videoTime = `${mm}:${ss}`;
  }

  const nowISO = new Date().toISOString();
  const logEntry = `${videoTime} (${nowISO})`;
  shopNowClicks.push(logEntry);

  console.log("🛒 Sending QEL click:", logEntry);
  window.parent.postMessage({ qel_click: shopNowClicks.join(" | ") }, qualtricsURL);

  showPopup();
  saveState();
};

// -----------------------------
// Popup
// -----------------------------
function showPopup() {
  const popup = document.getElementById("popup-modal");
  if (popup) popup.classList.remove("hidden");
}

function hidePopup() {
  const popup = document.getElementById("popup-modal");
  if (popup) popup.classList.add("hidden");
}

window.showPopup = showPopup;
window.hidePopup = hidePopup;

// -----------------------------
// Init
// -----------------------------
renderFeed();
