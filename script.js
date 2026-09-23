(function () {
  "use strict";

  var header = document.getElementById("siteHeader");
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");
  var navLinks = document.querySelectorAll(".nav-link");
  var sections = document.querySelectorAll("main section[id]");
  var wheel = document.getElementById("wheel");
  var spokes = document.getElementById("spokes");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Nav style changes on scroll ---------- */
  function updateHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  }

  /* ---------- 2. Wheel spokes ---------- */
  var SPOKE_COUNT = 32;
  var svgNS = "http://www.w3.org/2000/svg";
  for (var i = 0; i < SPOKE_COUNT; i++) {
    var line = document.createElementNS(svgNS, "line");
    var angle = (i / SPOKE_COUNT) * Math.PI * 2;
    line.setAttribute("x1", (Math.cos(angle) * 10).toFixed(2));
    line.setAttribute("y1", (Math.sin(angle) * 10).toFixed(2));
    line.setAttribute("x2", (Math.cos(angle) * 88).toFixed(2));
    line.setAttribute("y2", (Math.sin(angle) * 88).toFixed(2));
    spokes.appendChild(line);
  }

  /* The wheel turns as the page scrolls */
  function updateWheel() {
    if (reduceMotion) return;
    wheel.style.transform = "rotate(" + window.scrollY * 0.12 + "deg)";
  }

  /* One scroll handler, throttled with requestAnimationFrame */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateHeader();
      updateWheel();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  updateHeader();
  updateWheel();

  /* ---------- 3. Highlight the link for the section on screen ---------- */
  function setActive(id) {
    navLinks.forEach(function (link) {
      var isCurrent = link.getAttribute("href") === "#" + id;
      link.classList.toggle("is-active", isCurrent);
      if (isCurrent) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ---------- 4. Mobile menu ---------- */
  function setMenu(open) {
    navMenu.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  }

  navToggle.addEventListener("click", function () {
    setMenu(navToggle.getAttribute("aria-expanded") !== "true");
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () { setMenu(false); });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setMenu(false);
      navToggle.focus();
    }
  });

  document.addEventListener("click", function (event) {
    if (!header.contains(event.target)) setMenu(false);
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 820) setMenu(false);
  });

  /* ---------- 5. Contact form validation ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  function showError(fieldId, message) {
    var input = document.getElementById(fieldId);
    document.getElementById(fieldId + "Error").textContent = message;
    input.closest(".field").classList.toggle("has-error", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    status.textContent = "";

    var name = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    var message = form.elements.message.value.trim();
    var valid = true;

    showError("name", "");
    showError("email", "");
    showError("message", "");

    if (!name) {
      showError("name", "Enter your name.");
      valid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("email", "Enter an email address like name@example.com.");
      valid = false;
    }
    if (message.length < 10) {
      showError("message", "Describe the problem in at least 10 characters.");
      valid = false;
    }

    if (!valid) {
      var firstBad = form.querySelector(".has-error input, .has-error textarea");
      if (firstBad) firstBad.focus();
      return;
    }

    /* Replace this with a real request (fetch to your backend) when you have one */
    form.reset();
    status.textContent = "Request sent. We'll reply within one working day.";
  });

  /* ---------- 6. Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();