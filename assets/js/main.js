document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const preloader = document.querySelector("[data-preloader]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("#siteNav");

  const welcomePopup = document.querySelector("[data-welcome-popup]");
  const WELCOME_SEEN_KEY = "bsg-welcome-seen";
  let welcomeScheduled = false;

  const welcomeAlreadySeen = () => {
    try {
      return window.sessionStorage.getItem(WELCOME_SEEN_KEY) === "1";
    } catch (error) {
      return false;
    }
  };

  const closeWelcome = () => {
    if (welcomePopup && welcomePopup.open) welcomePopup.close();
  };

  // Shown once per browser session, right after the preloader clears.
  const scheduleWelcome = () => {
    if (welcomeScheduled || !welcomePopup || typeof welcomePopup.showModal !== "function") return;
    welcomeScheduled = true;
    if (welcomeAlreadySeen()) return;

    window.setTimeout(() => {
      welcomePopup.showModal();
      try {
        window.sessionStorage.setItem(WELCOME_SEEN_KEY, "1");
      } catch (error) {
        // Without storage the popup may show again on the next page; harmless.
      }
    }, 400);
  };

  if (welcomePopup) {
    welcomePopup.querySelectorAll("[data-welcome-close]").forEach((button) => {
      button.addEventListener("click", closeWelcome);
    });

    // Clicking the dimmed backdrop (outside the panel) closes the popup.
    welcomePopup.addEventListener("click", (event) => {
      if (event.target === welcomePopup) closeWelcome();
    });
  }

  const hidePreloader = () => {
    if (!preloader) return;
    preloader.classList.add("is-hidden");
    body.classList.remove("is-loading");
    window.setTimeout(() => {
      preloader.remove();
    }, 500);
    scheduleWelcome();
  };

  if (preloader) {
    body.classList.add("is-loading");
    window.addEventListener("load", hidePreloader, { once: true });
    window.setTimeout(hidePreloader, 1800);
  } else {
    scheduleWelcome();
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = body.classList.toggle("menu-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        body.classList.remove("menu-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

  document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      const expanded = item.classList.toggle("open");
      button.setAttribute("aria-expanded", String(expanded));
    });
  });

  const yearNode = document.querySelector("[data-year]");
  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }
});
