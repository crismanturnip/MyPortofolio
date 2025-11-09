// ======================
// Navbar toggle
// ======================
const menubar = document.querySelector("#menu");
const Navbar = document.querySelector(".navbar");

menubar.onclick = () => {
  menubar.classList.toggle("bx-x");
  Navbar.classList.toggle("active");
};

// ======================
// Scroll section active link
// ======================
const section = document.querySelectorAll("section");
const navlink = document.querySelectorAll("header nav a");

window.onscroll = () => {
  section.forEach((sec) => {
    let top = window.scrollY;
    let offset = sec.offsetTop - 150;
    let height = sec.offsetHeight;
    let id = sec.getAttribute("id");

    if (top > offset && top < offset + height) {
      sec.classList.add("start-animation");
      navlink.forEach((links) => {
        links.classList.remove("active");
        document
          .querySelector("header nav a[href*=" + id + "]")
          .classList.add("active");
      });
    }
  });

  var header = document.querySelector(".header");
  header.classList.toggle("sticky", window.scrollY > 100);
  menubar.classList.remove("bx-x");
  Navbar.classList.remove("active");
};

const swiper = new Swiper(".certificateSwiper", {
  slidesPerView: 1,
  spaceBetween: 30,
  loop: true,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  autoplay: {
    delay: 3500,
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

swiper.on("slideChangeTransitionStart", () => {
  const activeSlide = document.querySelector(".certificateSwiper .swiper-slide-active img");
  activeSlide.style.animation = "none"; 
  void activeSlide.offsetWidth; 
  activeSlide.style.animation = "zoomIn 2s ease forwards";
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
  navigation: {
    nextEl: ".project .swiper-button-next",
    prevEl: ".project .swiper-button-prev",
  },
  autoplay: {
    delay: 3500,
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


