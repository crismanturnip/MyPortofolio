// ======================
// Navbar toggle
// ======================
const menubar = document.querySelector("#menu");
const Navbar = document.querySelector(".navbar");
const navlink = document.querySelectorAll("header nav a");

const toggleNavbar = () => {
  Navbar.classList.toggle("active");
  const isExpanded = Navbar.classList.contains("active");
  menubar.setAttribute("aria-expanded", String(isExpanded));
  menubar.querySelector("i").classList.toggle("bx-x", isExpanded);
  menubar.querySelector("i").classList.toggle("bx-menu", !isExpanded);
};

const closeNavbar = () => {
  Navbar.classList.remove("active");
  menubar.setAttribute("aria-expanded", "false");
  menubar.querySelector("i").classList.remove("bx-x");
  menubar.querySelector("i").classList.add("bx-menu");
};

menubar.addEventListener("click", toggleNavbar);

navlink.forEach((link) => {
  link.addEventListener("click", closeNavbar);
});

document.addEventListener("click", (event) => {
  if (!Navbar.contains(event.target) && !menubar.contains(event.target)) {
    closeNavbar();
  }
});

// ======================
// Scroll section active link
// ======================
const sections = document.querySelectorAll("section");

function handleScrollAnimation() {
  const viewportTrigger = window.innerHeight * 0.85;
  const activePoint = window.scrollY + window.innerHeight * 0.5;
  const pageBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
  let activeId = "";

  sections.forEach((sec) => {
    const rect = sec.getBoundingClientRect();
    const offset = sec.offsetTop;
    const height = sec.offsetHeight;
    const id = sec.getAttribute("id");

    if (rect.top <= viewportTrigger || pageBottom) {
      sec.classList.add("start-animation");
    }

    if (activePoint >= offset && activePoint < offset + height) {
      activeId = id;
    }
  });

  if (pageBottom && sections.length) {
    const lastSection = sections[sections.length - 1];
    lastSection.classList.add("start-animation");
    activeId = lastSection.getAttribute("id");
  }

  navlink.forEach((links) => {
    links.classList.remove("active");
  });

  const activeLink = document.querySelector(`header nav a[href*="${activeId}"]`);
  if (activeLink) {
    activeLink.classList.add("active");
  }

  var header = document.querySelector(".header");
  header.classList.toggle("sticky", window.scrollY > 100);
  closeNavbar();
}

window.addEventListener("scroll", handleScrollAnimation);
window.addEventListener("load", handleScrollAnimation);
handleScrollAnimation();

// ======================
// About read more toggle
// ======================
const aboutContent = document.querySelector(".text-content2");
const aboutToggle = document.querySelector(".about-toggle");
const aboutMore = document.querySelector("#about-more");

if (aboutContent && aboutToggle && aboutMore) {
  aboutToggle.addEventListener("click", () => {
    const isExpanded = aboutContent.classList.toggle("is-expanded");

    aboutToggle.setAttribute("aria-expanded", String(isExpanded));
    aboutMore.setAttribute("aria-hidden", String(!isExpanded));
    aboutToggle.textContent = isExpanded ? "Show Less" : "Read More";
  });
}

/*------------------------ Certificate-----------------------*/

const gallerySwiper = new Swiper(".gallerySwiper", {
  slidesPerView: 1,
  spaceBetween: 30,
  loop: true,
  pagination: {
    el: ".gallery .swiper-pagination",
    clickable: true,
  },
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },
  breakpoints: {
    768: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: 3,
    },
  },
});

const galleryLightbox = document.getElementById("gallery-lightbox");
const galleryLightboxImg = document.getElementById("gallery-lightbox-img");
const galleryLightboxCaption = document.getElementById("gallery-lightbox-caption");
const galleryLightboxClose = document.querySelector(".gallery-lightbox-close");
let activePreviewSwiper = null;

function openLightboxFromSlide(slide, swiperInstance) {
  if (!galleryLightbox || !galleryLightboxImg || !slide) {
    return;
  }

  const image = slide.querySelector("img");
  if (!image) {
    return;
  }

  const galleryCaption = slide.querySelector(".gallery-info p")?.textContent?.trim();
  const title = slide.querySelector("h3")?.textContent?.trim();
  const subtitle = slide.querySelector("h4")?.textContent?.trim();
  const caption = galleryCaption || [title, subtitle].filter(Boolean).join(" - ") || image.alt || "";

  galleryLightboxImg.src = image.currentSrc || image.src;
  galleryLightboxImg.alt = image.alt || "Preview gambar";

  if (galleryLightboxCaption) {
    galleryLightboxCaption.textContent = caption;
  }

  galleryLightbox.classList.add("active");
  galleryLightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  activePreviewSwiper = swiperInstance;
  activePreviewSwiper?.autoplay?.stop();
  galleryLightboxClose?.focus();
}

function closeGalleryLightbox(options = {}) {
  if (!galleryLightbox || !galleryLightboxImg) {
    return;
  }

  if (!galleryLightbox.classList.contains("active")) {
    return;
  }

  const { resumeAutoplay = true } = options;

  galleryLightbox.classList.remove("active");
  galleryLightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  galleryLightboxImg.src = "";
  if (resumeAutoplay) {
    activePreviewSwiper?.autoplay?.start();
  }
  activePreviewSwiper = null;
}

document.querySelector(".gallerySwiper")?.addEventListener("click", (event) => {
  const slide = event.target.closest(".gallery-item");
  if (!slide || !gallerySwiper.allowClick) {
    return;
  }

  openLightboxFromSlide(slide, gallerySwiper);
});

gallerySwiper.on("slideChangeTransitionStart", () => {
  closeGalleryLightbox({ resumeAutoplay: false });
});

galleryLightboxClose?.addEventListener("click", closeGalleryLightbox);

galleryLightbox?.addEventListener("click", (event) => {
  if (event.target === galleryLightbox) {
    closeGalleryLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && galleryLightbox?.classList.contains("active")) {
    closeGalleryLightbox();
  }
});

const swiper = new Swiper(".certificateSwiper", {
  slidesPerView: 1,
  spaceBetween: 30,
  loop: true,
  pagination: {
    el: ".certificate .swiper-pagination",
    clickable: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },
  breakpoints: {
    768: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: 3,
    },
  },
});

document.querySelector(".certificateSwiper")?.addEventListener("click", (event) => {
  const slide = event.target.closest(".swiper-slide");
  if (!slide || !swiper.allowClick) {
    return;
  }

  openLightboxFromSlide(slide, swiper);
});

swiper.on("slideChangeTransitionStart", () => {
  closeGalleryLightbox({ resumeAutoplay: false });
});

// ======================
// Project Swiper
// ======================
const projectSwiper = new Swiper(".projectSwiper", {
  slidesPerView: 1,
  spaceBetween: 30,
  loop: true,
  pagination: {
    el: ".project .swiper-pagination",
    clickable: true,
  },
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },
  breakpoints: {
    768: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: 3,
    },
  },
});

projectSwiper.on("slideChangeTransitionStart", () => {
  const activeSlide = document.querySelector(".projectSwiper .swiper-slide-active img");
  activeSlide.style.animation = "none";
  void activeSlide.offsetWidth;
  activeSlide.style.animation = "zoomIn 2s ease forwards";
});

// ======================
// Public content integration (Next.js Content Studio)
// ======================
const CONTENT_BASE = window.location.origin;
const publicBlogList = document.getElementById("public-blog-list");
const publicNovelList = document.getElementById("public-novel-list");
const allBlogLink = document.getElementById("all-blog-link");
const allNovelLink = document.getElementById("all-novel-link");

if (allBlogLink) {
  allBlogLink.href = `${CONTENT_BASE}/blog`;
}

if (allNovelLink) {
  allNovelLink.href = `${CONTENT_BASE}/novel`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatDate(value) {
  if (!value) {
    return "Baru dipublish.";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Baru dipublish.";
  }

  return `Update ${parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })}`;
}

function truncateText(value, maxLength = 130) {
  const text = String(value || "").trim();
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
}

function getAssetUrl(value) {
  if (!value) {
    return "assets/images/img5.jpg";
  }

  if (value.startsWith("http") || value.startsWith("assets/")) {
    return value;
  }

  return `${CONTENT_BASE}${value.startsWith("/") ? "" : "/"}${value}`;
}

function getFallbackImage(type, index = 0) {
  const blogImages = ["assets/images/img5.jpg", "assets/images/img6.jpg", "assets/images/img7.jpg"];
  const novelImages = ["assets/images/project1.png", "assets/images/project2.jpg", "assets/images/project3.png"];
  const images = type === "novel" ? novelImages : blogImages;
  return images[index % images.length];
}

function iconCalendar() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 2v4"></path>
      <path d="M16 2v4"></path>
      <path d="M3 10h18"></path>
      <path d="M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"></path>
    </svg>
  `;
}

function iconBook() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"></path>
    </svg>
  `;
}

function iconArrow() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14"></path>
      <path d="m12 5 7 7-7 7"></path>
    </svg>
  `;
}

function renderPublicCards(container, items, type) {
  if (!container) {
    return;
  }

  if (!items.length) {
    container.innerHTML = `
      <article class="blog-card">
        <span class="blog-label">Kosong</span>
        <h3>Belum ada ${type} published</h3>
        <p>Konten akan muncul di sini setelah dipublish dari dashboard admin.</p>
      </article>
    `;
    return;
  }

  container.innerHTML = items
    .map((item) => {
      const href =
        type === "blog"
          ? `${CONTENT_BASE}/blog/${encodeURIComponent(item.slug)}`
          : `${CONTENT_BASE}/novel/${encodeURIComponent(item.slug)}`;

      return `
        <article class="blog-card dynamic-card">
          <span class="blog-label">Published</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(formatDate(item.updatedAt))}</p>
          <a class="read-link" href="${href}" target="_blank" rel="noopener noreferrer">Baca Selengkapnya</a>
        </article>
      `;
    })
    .join("");
}

function renderWritingUniverse(container, items) {
  if (!container) {
    return;
  }

  if (!items.length) {
    container.innerHTML = `
      <article class="writing-card">
        <div class="writing-status"><span></span>Belum tersedia</div>
        <h3>Belum ada novel published</h3>
        <p>Novel yang sudah dipublish dari dashboard admin akan tampil di bagian ini.</p>
      </article>
    `;
    return;
  }

  const novels = items.slice(0, 3);

  container.innerHTML = novels
    .map((item, index) => {
      const href = `${CONTENT_BASE}/novel/${encodeURIComponent(item.slug)}`;
      const imageUrl = getAssetUrl(item.coverUrl);
      const fallbackImage = getFallbackImage("novel", index);
      const chapterCount = Number(item.chapterCount || 0);
      const chapterLabel = chapterCount > 0 ? `${chapterCount} Bab` : "Bab segera hadir";

      return `
        <article class="writing-card">
          <div class="writing-cover">
            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.onerror=null;this.src='${escapeHtml(fallbackImage)}';">
            <span class="writing-type">Novel</span>
          </div>
          <div class="writing-status"><span></span>Published</div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(truncateText(item.summary || "Cerita published dari dashboard admin akan tampil di ruang ini."))}</p>
          <div class="writing-meta">
            <span>${iconCalendar()} ${escapeHtml(formatDate(item.updatedAt))}</span>
            <i>•</i>
            <span>${iconBook()} ${escapeHtml(chapterLabel)}</span>
          </div>
          <a class="writing-link" href="${href}" target="_blank" rel="noopener noreferrer">
            Baca Selengkapnya
          </a>
        </article>
      `;
    })
    .join("");
}

function renderBlogUniverse(container, items) {
  if (!container) {
    return;
  }

  if (!items.length) {
    container.innerHTML = `
      <article class="writing-card">
        <div class="writing-status"><span></span>Belum tersedia</div>
        <h3>Belum ada blog published</h3>
        <p>Blog yang sudah dipublish dari dashboard admin akan tampil di bagian ini.</p>
      </article>
    `;
    return;
  }

  const blogs = items.slice(0, 3);

  container.innerHTML = blogs
    .map((item, index) => {
      const href = `${CONTENT_BASE}/blog/${encodeURIComponent(item.slug)}`;
      const imageUrl = getAssetUrl(item.thumbnailUrl);
      const fallbackImage = getFallbackImage("blog", index);

      return `
        <article class="writing-card">
          <div class="writing-cover">
            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.onerror=null;this.src='${escapeHtml(fallbackImage)}';">
            <span class="writing-type">Blog</span>
          </div>
          <div class="writing-status"><span></span>Published</div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(truncateText(item.excerpt || "Artikel published dari dashboard admin akan tampil di ruang ini."))}</p>
          <div class="writing-meta">
            <span>${iconCalendar()} ${escapeHtml(formatDate(item.updatedAt))}</span>
            <i>•</i>
            <span>${iconBook()} Artikel</span>
          </div>
          <a class="writing-link" href="${href}" target="_blank" rel="noopener noreferrer">
            Baca Selengkapnya
          </a>
        </article>
      `;
    })
    .join("");
}

async function loadPublicContent() {
  try {
    const response = await fetch(`${CONTENT_BASE}/api/public/portfolio-feed`);
    if (!response.ok) {
      throw new Error("Feed publik gagal dimuat.");
    }
    const result = await response.json();
    const items = Array.isArray(result.data) ? result.data : [];

    renderBlogUniverse(
      publicBlogList,
      items.filter((item) => item.type === "blog"),
    );
    renderWritingUniverse(
      publicNovelList,
      items.filter((item) => item.type === "novel"),
    );
  } catch (_error) {
    renderBlogUniverse(publicBlogList, []);
    renderWritingUniverse(publicNovelList, []);
  }
}

loadPublicContent();
