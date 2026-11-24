// Pre-paint theme, no flash. External file: CSP script-src 'self'.
(function () {
  var t = "dark";
  try {
    t = localStorage.getItem("theme") === "light" ? "light" : "dark";
  } catch (e) {}
  document.documentElement.classList.add(t);
  var m = document.querySelector('meta[name="theme-color"]');
  if (m) m.setAttribute("content", t === "light" ? "#F4F5F6" : "#0C0C0C");
})();
