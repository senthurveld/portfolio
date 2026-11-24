// Boot loader. External file: CSP script-src 'self'.
(function () {
  var el = document.getElementById("boot");
  if (!el) return;
  var bar = el.querySelector(".boot-bar");
  var shown = 0;
  var target = 0.15;
  var finishing = null;
  var raf = 0;

  function bump(v) {
    if (v > target) target = v;
  }

  function tick() {
    if (!finishing) bump(Math.min(0.9, target + 0.0015));
    shown += (target - shown) * (finishing ? 0.14 : 0.06);
    if (finishing && 1 - shown < 0.004) shown = 1;
    bar.style.transform = "scaleX(" + shown.toFixed(4) + ")";    if (shown < 1) raf = requestAnimationFrame(tick);
    else if (finishing) finishing();
  }
  raf = requestAnimationFrame(tick);

  var revealed = false;
  var t0 = Date.now();
  var introDone;
  var intro = new Promise(function (r) {
    introDone = r;
  });
  function reveal() {
    if (revealed) return;
    revealed = true;
    el.classList.add("is-ready");
    setTimeout(introDone, 1700);
  }
  function checkFont() {
    if (revealed) return;
    if (!document.fonts || Date.now() - t0 > 2500) return reveal();
    document.fonts.load('800 1em "Urbanist Variable"', "SENTHURVEL").then(
      function (faces) {
        if (faces.length) reveal();
        else setTimeout(checkFont, 60);
      },
      function () {
        setTimeout(checkFont, 60);
      },
    );
  }
  checkFont();

  document.addEventListener("DOMContentLoaded", function () {
    bump(0.5);
  });
  addEventListener("load", function () {
    bump(0.85);
  });

  function leave() {
    return new Promise(function (resolve) {
      el.classList.add("is-out");
      setTimeout(function () {
        el.style.visibility = "hidden";
        resolve();
        setTimeout(function () {
          (window.requestIdleCallback || setTimeout)(function () {
            el.remove();
          });
        }, 3000);
      }, 1500);
    });
  }

  window.__boot = {
    finish: function () {
      if (window.__boot.done) return window.__boot.done;
      target = 1;
      window.__boot.done = new Promise(function (resolve) {
        finishing = resolve;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(tick);
      });
      return window.__boot.done;
    },
    leave: leave,
    intro: intro,
    done: null,
  };

  setTimeout(function () {
    if (document.getElementById("boot") && !window.__boot.done) window.__boot.finish().then(leave);
  }, 12000);
})();
