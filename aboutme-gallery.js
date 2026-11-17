(function () {
      const mount = document.getElementById("photostrips");
      if (!mount) return;

      // Order matters: directions alternate right, left, right...
      const categories = [
        {
          title: "Art", note: "", folder: "Gallery/art/",
          files: [
            "crown.jpg", "deer.jpg", "drink.jpg", "heavy.jpg", "murky.jpg",
            "mustache.jpg", "pierce.jpg", "reckless.jpg", "starfish.jpg",
            "sweep.jpg", "trunk.jpg", "weave.jpg", "Apple.jpg", "Artifact.jpg",
            "Ogre.jpg", "Miniature.jpg", "Ram.jpg", "Stinky.jpg", "RamBnW.jpg",
            "Panic.jpg", "PeopleInMyLIfe.jpg", "StinkyBnW.jpg", "StinkyColored.jpg",
            "Smack.jpg"
          ],
          
        },
        {
          title: "Myself", note: "", folder: "Gallery/myself/",
          files: ["5.png", "6.png", "7.png", "8.png", "10.png", "14.png"],
        },
        {
          title: "Café", note: "", folder: "Gallery/cafe/",
          files: [
            "Angel's Cat Cafe.jpg", "Coffee idea.jpg",
            "Fikastalle.jpg", "HoHo Naicha.jpg", "Pick-Up Coffee.jpg",
            "Pine Valley.jpg", "Quatro Marias.jpg", "Sabreena's.jpg",
            "Starbucks Downhill.jpg", "Sugar Cafe.jpg", "Sweet and Savor.jpg",
            "Tim's Cup.jpg", "What If Coffee.jpg", "Y Dough.jpg",
          ],
        },
      ];

      // Speed in pixels per second (lower = slower). Phones are a bit slower.
      const SPEED_DESKTOP = 60;
      const SPEED_MOBILE = 40;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const mobileQuery = window.matchMedia("(max-width: 600px)");
      const canAnimate = typeof Element.prototype.animate === "function";

      function pxPerSecond() {
        const base = mobileQuery.matches ? SPEED_MOBILE : SPEED_DESKTOP;
        return reduceMotion ? base * 0.4 : base; // slower, never frozen
      }

      // One set must be wider than the screen so the loop never shows a gap
      const minFrames = Math.ceil(Math.max(window.screen.width, window.innerWidth) / 170) + 2;

      const allPhotos = [];
      const photoIndexes = new Map();

      function makeFrame(folder, file) {
        const fig = document.createElement("figure");
        fig.className = "strip-frame";

        const img = document.createElement("img");
        img.src = folder + encodeURIComponent(file);
        const name = file.replace(/\.[^/.]+$/, "");
        const photo = { src: img.src, name: name, category: folder };
        if (!photoIndexes.has(photo.src)) {
          photoIndexes.set(photo.src, allPhotos.length);
          allPhotos.push(photo);
        }
        fig.dataset.photoSrc = photo.src;
        fig.setAttribute("role", "button");
        fig.setAttribute("tabindex", "0");
        fig.setAttribute("aria-label", "View " + name);
        img.alt = name;
        img.decoding = "async";
        // eager on purpose: lazy images inside a moving strip can stay blank on phones
        img.loading = "eager";
        img.addEventListener("error", function () {
          fig.classList.add("is-missing");
          console.warn("Photostrip: image not found ->", img.src);
        });

        const cap = document.createElement("figcaption");
        cap.textContent = name;

        fig.appendChild(img);
        fig.appendChild(cap);
        return fig;
      }

      const strips = [];

      categories.forEach(function (cat, i) {
        if (!cat.files.length) return;
        const goesRight = i % 2 === 0;

        const row = document.createElement("div");
        row.className = "strip-row " + (goesRight ? "dir-right" : "dir-left");

        const head = document.createElement("div");
        head.className = "strip-head";

        const label = document.createElement("h3");
        label.className = "strip-label";
        label.innerHTML = cat.title + " <small>" + cat.note + "</small>";

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "strip-toggle";
        toggle.textContent = "Pause";
        toggle.setAttribute("aria-label", "Pause " + cat.title + " photostrip");

        head.appendChild(label);
        head.appendChild(toggle);

        const viewport = document.createElement("div");
        viewport.className = "strip-viewport";
        const track = document.createElement("div");
        track.className = "strip-track";

        const set = [];
        while (set.length < Math.max(minFrames, 12)) set.push.apply(set, cat.files);

        // Two identical sets => sliding by 50% loops seamlessly
        for (let copy = 0; copy < 2; copy++) {
          set.forEach(function (file) {
            const f = makeFrame(cat.folder, file);
            if (copy === 1) f.setAttribute("aria-hidden", "true");
            track.appendChild(f);
          });
        }

        viewport.appendChild(track);
        row.appendChild(head);
        row.appendChild(viewport);
        mount.appendChild(row);

        strips.push({ cat: cat, goesRight: goesRight, track: track, viewport: viewport,
                      toggle: toggle, anim: null,
                      userPaused: false, holding: false, visible: true });
      });

      function durationFor(s) {
        const half = s.track.scrollWidth / 2;           // width of one full set
        return Math.max(half / pxPerSecond(), 5) * 1000; // ms
      }

      function sync(s) {
        const stop = s.userPaused || s.holding || !s.visible;
        if (s.anim) { stop ? s.anim.pause() : s.anim.play(); }
        s.toggle.textContent = s.userPaused ? "Play" : "Pause";
        s.toggle.setAttribute("aria-label",
          (s.userPaused ? "Play " : "Pause ") + s.cat.title + " photostrip");
      }

      function start(s) {
        const dur = durationFor(s);
        const from = s.goesRight ? "translateX(-50%)" : "translateX(0)";
        const to   = s.goesRight ? "translateX(0)"    : "translateX(-50%)";

        if (canAnimate) {
          // Web Animations are not affected by the global "animation: none" reduced-motion rule
          s.anim = s.track.animate(
            [{ transform: from }, { transform: to }],
            { duration: dur, iterations: Infinity, easing: "linear" }
          );
        } else {
          // Fallback to the CSS @keyframes
          s.track.classList.add("css-anim");
          s.track.style.animationDuration = dur + "ms";
        }
        sync(s);
      }

      strips.forEach(function (s) {
        // Pause button
        s.toggle.addEventListener("click", function () {
          s.userPaused = !s.userPaused;
          sync(s);
        });

        // Hover pauses with a mouse; press-and-hold pauses on touch
        s.viewport.addEventListener("pointerenter", function (e) {
          if (e.pointerType === "mouse") { s.holding = true; sync(s); }
        });
        s.viewport.addEventListener("pointerdown", function (e) {
          if (e.pointerType !== "mouse") { s.holding = true; sync(s); }
        });
        ["pointerleave", "pointerup", "pointercancel"].forEach(function (ev) {
          s.viewport.addEventListener(ev, function () { s.holding = false; sync(s); });
        });

        // Only animate while on screen (saves battery on phones)
        if ("IntersectionObserver" in window) {
          new IntersectionObserver(function (entries) {
            s.visible = entries[0].isIntersecting;
            sync(s);
          }, { threshold: 0 }).observe(s.viewport);
        }

        start(s);
      });

      // Manual pointer interaction: taps open images; drags move the strip
      // in the same direction as the pointer on mouse, pen, and touch.
      strips.forEach(function (s) {
        const viewport = s.viewport;
        let pointer = null;

        viewport.addEventListener("pointerdown", function (e) {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          if (!s.anim || pointer) return;
          pointer = { id: e.pointerId, startX: e.clientX, lastX: e.clientX,
            lastY: e.clientY, dragged: false, wasPaused: s.userPaused,
            wasHolding: s.holding };
          s.holding = true;
          s.anim.pause();
          viewport.classList.add("is-pointer-down");
        });

        viewport.addEventListener("pointermove", function (e) {
          if (!pointer || e.pointerId !== pointer.id || !s.anim) return;
          const totalDelta = e.clientX - pointer.startX;
          if (!pointer.dragged && Math.abs(totalDelta) > 5) {
            pointer.dragged = true;
            viewport.classList.add("is-dragging");
            if (viewport.setPointerCapture) {
              try { viewport.setPointerCapture(e.pointerId); } catch (_) {}
            }
          }
          if (!pointer.dragged) return;
          const delta = e.clientX - pointer.lastX;
          const halfWidth = s.track.scrollWidth / 2;
          const duration = durationFor(s);
          if (halfWidth > 0 && duration > 0) {
            // Right-moving rows advance their timeline on rightward drag;
            // left-moving rows reverse their timeline. Visually, both follow the pointer.
            const direction = s.goesRight ? 1 : -1;
            let time = Number(s.anim.currentTime) || 0;
            time += direction * (delta / halfWidth) * duration;
            s.anim.currentTime = ((time % duration) + duration) % duration;
          }
          pointer.lastX = e.clientX;
          pointer.lastY = e.clientY;
          e.preventDefault();
        });

        function restorePointerState(completed) {
          viewport.classList.remove("is-pointer-down", "is-dragging");
          s.holding = completed.wasHolding;
          s.userPaused = completed.wasPaused;
          sync(s);
        }

        viewport.addEventListener("pointerup", function (e) {
          if (!pointer || e.pointerId !== pointer.id) return;
          const completed = pointer;
          pointer = null;
          if (completed.dragged) {
            viewport.dataset.dragged = "true";
            window.setTimeout(function () { delete viewport.dataset.dragged; }, 250);
          } else {
            // Handle taps explicitly so desktop clicks reliably open the carousel.
            const frame = document.elementFromPoint(e.clientX, e.clientY)?.closest(".strip-frame");
            if (frame && viewport.contains(frame)) openLightbox(frame.dataset.photoSrc, frame);
          }
          restorePointerState(completed);
        });

        ["pointercancel", "lostpointercapture"].forEach(function (eventName) {
          viewport.addEventListener(eventName, function (e) {
            if (!pointer || e.pointerId !== pointer.id) return;
            const completed = pointer;
            pointer = null;
            restorePointerState(completed);
          });
        });
      });

      // Layered, overlapping large-image carousel inspired by the supplied reference.
      const lightbox = document.getElementById("photoLightbox");
      const lightboxName = document.getElementById("photoLightboxName");
      const lightboxCount = document.getElementById("photoLightboxCount");
      const closeButton = document.getElementById("photoLightboxClose");
      const prevButton = document.getElementById("photoPrev");
      const nextButton = document.getElementById("photoNext");
      const carouselSlides = Array.from(lightbox.querySelectorAll(".photo-carousel__slide"));
      let currentPhotoIndex = 0;
      let previousFocus = null;
      let carouselPointerStart = null;

      function showPhoto(index) {
        if (!allPhotos.length) return;
        currentPhotoIndex = (index + allPhotos.length) % allPhotos.length;
        const count = allPhotos.length;
        carouselSlides.forEach(function (slide) {
          const step = Number(slide.dataset.step);
          const photoIndex = (currentPhotoIndex + step + count * 2) % count;
          const photo = allPhotos[photoIndex];
          slide.style.backgroundImage = 'url("' + photo.src.replace(/"/g, '%22') + '")';
          slide.dataset.photoIndex = String(photoIndex);
          slide.setAttribute("aria-label", step === 0 ? "Current image: " + photo.name : "View " + photo.name);
        });
        const photo = allPhotos[currentPhotoIndex];
        lightboxName.textContent = photo.name;
        lightboxCount.textContent = String(currentPhotoIndex + 1).padStart(2, "0") + " / " + String(count).padStart(2, "0");
      }

      function openLightbox(photoSrc, trigger) {
        const index = photoIndexes.get(photoSrc);
        if (index === undefined) return;
        previousFocus = trigger || document.activeElement;
        showPhoto(index);
        lightbox.hidden = false;
        document.body.classList.add("lightbox-open");
        closeButton.focus();
      }

      function closeLightbox() {
        if (lightbox.hidden) return;
        lightbox.hidden = true;
        document.body.classList.remove("lightbox-open");
        if (previousFocus && previousFocus.focus) previousFocus.focus();
      }

      mount.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        const frame = e.target.closest(".strip-frame");
        if (!frame) return;
        e.preventDefault();
        openLightbox(frame.dataset.photoSrc, frame);
      });

      prevButton.addEventListener("click", function () { showPhoto(currentPhotoIndex - 1); });
      nextButton.addEventListener("click", function () { showPhoto(currentPhotoIndex + 1); });
      closeButton.addEventListener("click", closeLightbox);
      lightbox.addEventListener("click", function (e) {
        if (e.target.hasAttribute("data-lightbox-close")) closeLightbox();
        const slide = e.target.closest(".photo-carousel__slide");
        if (slide && slide.dataset.step) showPhoto(currentPhotoIndex + Number(slide.dataset.step));
      });

      // Swipe/drag directly across the large carousel, including touch screens.
      const carouselStage = document.getElementById("photoCarouselStage");
      carouselStage.addEventListener("pointerdown", function (e) {
        if (e.target.closest("button")) return;
        carouselPointerStart = { x: e.clientX, y: e.clientY, id: e.pointerId };
        if (carouselStage.setPointerCapture) carouselStage.setPointerCapture(e.pointerId);
      });
      carouselStage.addEventListener("pointerup", function (e) {
        if (!carouselPointerStart || carouselPointerStart.id !== e.pointerId) return;
        const dx = e.clientX - carouselPointerStart.x;
        if (Math.abs(dx) > 45) showPhoto(currentPhotoIndex + (dx < 0 ? 1 : -1));
        carouselPointerStart = null;
      });
      carouselStage.addEventListener("pointercancel", function () { carouselPointerStart = null; });

      document.addEventListener("keydown", function (e) {
        if (lightbox.hidden) return;
        if (e.key === "Escape") closeLightbox();
        else if (e.key === "ArrowLeft") showPhoto(currentPhotoIndex - 1);
        else if (e.key === "ArrowRight") showPhoto(currentPhotoIndex + 1);
      });

      // Keep speed right after rotating the phone / resizing, without jumping
      let resizeTimer;
      window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          strips.forEach(function (s) {
            if (!s.anim) return;
            const oldDur = s.anim.effect.getTiming().duration;
            const progress = ((s.anim.currentTime || 0) % oldDur) / oldDur;
            const newDur = durationFor(s);
            s.anim.effect.updateTiming({ duration: newDur });
            s.anim.currentTime = progress * newDur;
          });
        }, 200);
      });
    })();
