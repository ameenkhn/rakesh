// English | हिंदी language switch.
// English is the markup default. Hindi strings live in i18n-hi.js, keyed by the
// English text (whitespace-collapsed), so pages need no per-element markup.
(() => {
  const STORAGE_KEY = "bsg-lang";
  const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "svg", "SVG", "TEXTAREA"]);
  const ATTRS = ["alt", "placeholder", "aria-label", "title"];

  const originalText = new Map();
  const originalAttrs = new Map();
  let originalTitle = "";
  let originalDescription = "";

  const normalize = (value) => value.replace(/\s+/g, " ").trim();

  const readSavedLang = () => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "hi" ? "hi" : "en";
    } catch (error) {
      return "en";
    }
  };

  const saveLang = (lang) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      // Storage can be unavailable (private mode); the switch still works for this page.
    }
  };

  const isSkipped = (node) => {
    for (let el = node.parentElement; el; el = el.parentElement) {
      if (SKIP_TAGS.has(el.tagName) || el.hasAttribute("data-i18n-skip")) return true;
    }
    return false;
  };

  const collect = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!normalize(node.nodeValue) || isSkipped(node)) continue;
      originalText.set(node, node.nodeValue);
    }

    const selector = ATTRS.map((attr) => `[${attr}]`).join(",");
    document.body.querySelectorAll(selector).forEach((el) => {
      if (el.closest("svg") || el.closest("[data-i18n-skip]")) return;
      const values = {};
      ATTRS.forEach((attr) => {
        if (el.hasAttribute(attr)) values[attr] = el.getAttribute(attr);
      });
      originalAttrs.set(el, values);
    });

    originalTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    originalDescription = meta ? meta.getAttribute("content") : "";
  };

  const translate = (value, dict) => {
    const key = normalize(value);
    if (!dict || !Object.prototype.hasOwnProperty.call(dict, key)) return value;
    const lead = value.match(/^\s*/)[0];
    const trail = value.match(/\s*$/)[0];
    return lead + dict[key] + trail;
  };

  const apply = (lang) => {
    const dict = lang === "hi" ? window.BSG_I18N_HI : null;

    originalText.forEach((value, node) => {
      node.nodeValue = dict ? translate(value, dict) : value;
    });

    originalAttrs.forEach((values, el) => {
      Object.keys(values).forEach((attr) => {
        el.setAttribute(attr, dict ? translate(values[attr], dict) : values[attr]);
      });
    });

    document.title = dict ? translate(originalTitle, dict) : originalTitle;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", dict ? translate(originalDescription, dict) : originalDescription);

    document.documentElement.lang = lang;
    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    collect();

    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.addEventListener("click", () => {
        const lang = button.dataset.lang === "hi" ? "hi" : "en";
        saveLang(lang);
        apply(lang);
      });
    });

    if (readSavedLang() === "hi") apply("hi");
  });
})();
