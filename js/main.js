/* =========================================================
   Edana Montessori School – main script
   Sections:
     1. Helpers
     2. Page UI (nav, scroll effects, reveal)
     3. School calendar  (edit the DATA block to add events)
     4. Newsletters      (edit NEWSLETTERS to add a new issue)
     4b. Photo gallery   (filters + full-size photo viewer)
     4c. School fees     (edit PROGRAMMES / OPTIONAL / BANKS to update fees & bills)
     5. Forms
   ========================================================= */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  /* ---------------------------------------------------------
     1. Helpers
     --------------------------------------------------------- */
  var $ = function (sel, root) {
    return (root || document).querySelector(sel);
  };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };
  var pad = function (n) {
    return String(n).padStart(2, "0");
  };
  // Dates are handled as "YYYY-MM-DD" keys so they compare correctly as strings.
  var toKey = function (d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  };
  var fromKey = function (k) {
    var p = k.split("-").map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  };
  var fmt = function (d, opts) {
    return d.toLocaleDateString("en-GB", opts);
  };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /* ---------------------------------------------------------
     2. Page UI
     --------------------------------------------------------- */
  var header = $("#siteHeader");
  var navToggle = $("#navToggle");
  var nav = $("#mainNav");

  function setNav(open) {
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  }
  navToggle.addEventListener("click", function () {
    setNav(!nav.classList.contains("is-open"));
  });
  $$("a", nav).forEach(function (a) {
    a.addEventListener("click", function () {
      setNav(false);
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setNav(false);
  });

  window.addEventListener(
    "scroll",
    function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    },
    { passive: true }
  );

  $("#year").textContent = new Date().getFullYear();

  // Highlight the nav link of the section currently in view
  var navLinks = $$(".nav__link");
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    $$("main section[id]").forEach(function (s) {
      spy.observe(s);
    });

    // Scroll-reveal
    var reveal = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    $$(".reveal").forEach(function (el) {
      reveal.observe(el);
    });
  } else {
    $$(".reveal").forEach(function (el) {
      el.classList.add("in");
    });
  }

  // Club "Join" buttons pre-select the matching option in the contact form
  $$("[data-interest]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var select = $("#cInterest");
      var wanted = btn.getAttribute("data-interest");
      $$("option", select).forEach(function (o) {
        if (o.value === wanted || o.textContent === wanted) select.value = o.value;
      });
    });
  });

  /* ---------------------------------------------------------
     3. School calendar
     --------------------------------------------------------- */

  /* ===== DATA – edit these lists to update the calendar ===== */

  // Calendar categories (id, label)
  var CATEGORIES = [
    { id: "academic", label: "Term dates" },
    { id: "holiday", label: "Holidays & breaks" },
    { id: "event", label: "School events" },
    { id: "meeting", label: "Meetings" },
    { id: "club", label: "Clubs & activities" }
  ];

  // Term dates (start = first day, end = last day)
  var TERMS = [
    { n: 1, year: "2025/26", start: "2025-09-08", end: "2025-12-12" },
    { n: 2, year: "2025/26", start: "2026-01-12", end: "2026-03-27" },
    { n: 3, year: "2025/26", start: "2026-04-20", end: "2026-07-03" },
    { n: 1, year: "2026/27", start: "2026-09-07", end: "2026-12-11" },
    { n: 2, year: "2026/27", start: "2027-01-11", end: "2027-04-30" },
    { n: 3, year: "2026/27", start: "2027-04-19", end: "2027-07-02" }
  ];

  // Holidays & breaks (clubs do not meet on these days)
  var BREAKS = [
    { title: "Mid-Term Break", start: "2025-10-27", end: "2025-10-31" },
    { title: "Christmas Break", start: "2025-12-15", end: "2026-01-09" },
    { title: "Mid-Term Break", start: "2026-02-16", end: "2026-02-20" },
    { title: "Easter Break", start: "2026-03-30", end: "2026-04-17" },
    { title: "Mid-Term Break", start: "2026-05-25", end: "2026-05-29" },
    { title: "Summer Break", start: "2026-07-06", end: "2026-09-04" },
    { title: "Mid-Term Break", start: "2026-11-02", end: "2026-11-06" },
    { title: "Christmas Break", start: "2026-12-14", end: "2027-01-08" },
    { title: "Mid-Term Break", start: "2027-02-15", end: "2027-02-19" },
    { title: "Easter Break", start: "2027-03-29", end: "2027-04-16" },
    { title: "Mid-Term Break", start: "2027-05-24", end: "2027-05-28" },
    { title: "Summer Break", start: "2027-07-05", end: "2027-09-03" }
  ];

  // One-off events: { title, date, [end], type, [time], [place], [desc] }
  var EVENTS = [
    { title: "Parents' Orientation Evening", date: "2025-09-19", type: "meeting", time: "5:30 pm", place: "School Hall", desc: "Meet your child's class teacher and learn about the year ahead." },
    { title: "Christmas Carols & Music Concert", date: "2025-12-05", type: "club", time: "6:00 pm", place: "School Hall", desc: "The Music Club choir and band perform festive favourites." },
    { title: "Parent–Teacher Conferences", date: "2026-01-22", type: "meeting", time: "2:00 – 6:00 pm", place: "Classrooms", desc: "Book a 10-minute slot with your child's teacher." },
    { title: "Coding Challenge Day", date: "2026-02-06", type: "club", time: "9:00 am – 1:00 pm", place: "Computer Lab", desc: "ICT Club members tackle problem-solving challenges in teams." },
    { title: "World Book Day", date: "2026-03-05", type: "event", time: "All day", place: "Whole school", desc: "Come dressed as your favourite book character!" },
    { title: "Inter-School Chess Tournament", date: "2026-03-20", type: "club", time: "9:00 am – 3:00 pm", place: "School Library", desc: "Edana's Chess Club hosts teams from neighbouring schools." },
    { title: "Labour Day (school closed)", date: "2026-05-01", type: "holiday", desc: "Public holiday – school is closed." },
    { title: "Annual Sports Day", date: "2026-05-15", type: "event", time: "9:00 am – 2:00 pm", place: "School Field", desc: "Inter-house races, relay and family picnic." },
    { title: "Spring Music Showcase", date: "2026-06-12", type: "club", time: "6:00 pm", place: "School Hall", desc: "Solo and group performances by the Music Club." },
    { title: "ICT Expo & Science Fair", date: "2026-06-19", type: "club", time: "10:00 am – 1:00 pm", place: "School Hall", desc: "Students present apps, websites and experiments." },
    { title: "Prize-Giving & Graduation", date: "2026-06-26", type: "event", time: "10:00 am", place: "School Hall", desc: "Celebrating our graduating class and award winners." },
    { title: "Parents' Orientation Evening", date: "2026-09-18", type: "meeting", time: "5:30 pm", place: "School Hall", desc: "A warm welcome for new and returning families." },
    { title: "Open Day", date: "2026-09-26", type: "event", time: "9:00 am – 1:00 pm", place: "Whole campus", desc: "Tour our classrooms and meet the ICT, Music and Chess clubs." },
    { title: "Edana Coding Hackathon", date: "2026-10-16", type: "club", time: "9:00 am – 2:00 pm", place: "Computer Lab", desc: "A day of building games and apps with the ICT Club." },
    { title: "College & Primary Open Day", date: "2026-10-30", type: "event", time: "12:00 noon", place: "Primary Section", desc: "Edana Montessori School (Nursery/Primary) and Edana Model College come together at the Primary school for Open Day. Parents are welcomed from 12 noon." },
    { title: "All Staff Meeting", date: "2026-11-02", type: "meeting", time: "11:00 am prompt", place: "Edana Montessori School", desc: "General staff meeting for all teaching and non-teaching, full-time and part-time staff, covering Nursery/Primary and College matters. Attendance is compulsory." },
    { title: "School Chess Championship", date: "2026-11-13", type: "club", time: "1:00 – 4:00 pm", place: "School Library", desc: "Who will be Edana's chess champion this year?" },
    { title: "Parent–Teacher Conferences", date: "2026-11-20", type: "meeting", time: "2:00 – 6:00 pm", place: "Classrooms", desc: "Book a slot to discuss your child's progress." },
    { title: "Christmas Carols & Music Concert", date: "2026-12-04", type: "club", time: "6:00 pm", place: "School Hall", desc: "A festive evening with the Music Club." },
    { title: "Parent–Teacher Conferences", date: "2027-01-21", type: "meeting", time: "2:00 – 6:00 pm", place: "Classrooms", desc: "Term 2 progress conversations." },
    { title: "Inter-School Chess Tournament", date: "2027-03-19", type: "club", time: "9:00 am – 3:00 pm", place: "School Library", desc: "Our annual friendly tournament returns." },
    { title: "Spring Music Showcase", date: "2027-06-11", type: "club", time: "6:00 pm", place: "School Hall", desc: "An evening of music from our young performers." },
    { title: "Prize-Giving & Graduation", date: "2027-06-25", type: "event", time: "10:00 am", place: "School Hall", desc: "Celebrating achievements across the school." }
  ];

  // Weekly club sessions (day: 0 = Sunday … 6 = Saturday). Run in term time only.
  var CLUB_SESSIONS = [
    { title: "Karate Club meets", day: 2, time: "2:00 – 2:30 pm", place: "Activity Hall", desc: "Karate basics, kata and belt grading." },
    { title: "ICT Club meets", day: 2, time: "3:30 – 4:30 pm", place: "Computer Lab", desc: "Coding, robotics and digital design." },
    { title: "Ballet Dance Club meets", day: 3, time: "3:00 – 4:00 pm", place: "Activity Hall", desc: "Ballet routines, posture and coordination." },
    { title: "Music Club meets", day: 3, time: "3:30 – 5:00 pm", place: "Music Room", desc: "Band and choir rehearsal." },
    { title: "Chess Club meets", day: 4, time: "3:30 – 4:30 pm", place: "School Library", desc: "Coaching, ladder games and puzzles." }
  ];

  /* ===== Build the full event list from the data above ===== */
  var BASE = [];
  TERMS.forEach(function (t) {
    BASE.push({ title: "Term " + t.n + " begins", start: t.start, end: t.start, type: "academic", time: "8:00 am", place: "", desc: "Welcome back! " + t.year + " school year, Term " + t.n + "." });
    BASE.push({ title: "Term " + t.n + " ends", start: t.end, end: t.end, type: "academic", time: "Early finish, 1:00 pm", place: "", desc: "Last day of Term " + t.n + ". Reports go home with students." });
  });
  BREAKS.forEach(function (b) {
    BASE.push({ title: b.title, start: b.start, end: b.end, type: "holiday", desc: "School is closed. Clubs resume with the new term or week." });
  });
  EVENTS.forEach(function (e) {
    BASE.push({ title: e.title, start: e.date, end: e.end || e.date, type: e.type, time: e.time, place: e.place, desc: e.desc });
  });
  BASE.sort(function (a, b) {
    return a.start < b.start ? -1 : a.start > b.start ? 1 : 0;
  });

  var inRange = function (key, a, b) {
    return a <= key && key <= b;
  };
  var inBreak = function (key) {
    return BREAKS.some(function (b) {
      return inRange(key, b.start, b.end);
    });
  };
  var inTerm = function (key) {
    return TERMS.some(function (t) {
      return inRange(key, t.start, t.end);
    });
  };

  /* ===== Calendar state ===== */
  var todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  var todayKey = toKey(todayDate);

  var view = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
  var selected = todayKey;
  var active = {};
  CATEGORIES.forEach(function (c) {
    active[c.id] = true;
  });

  var elGrid = $("#calGrid");
  var elTitle = $("#calTitle");
  var elDayTitle = $("#dayTitle");
  var elDayEvents = $("#dayEvents");
  var elUpcoming = $("#upcoming");
  var elFilters = $("#calFilters");

  // All events (incl. weekly club sessions) that happen on a given day
  function eventsOn(key) {
    var out = BASE.filter(function (e) {
      return inRange(key, e.start, e.end);
    });
    var dow = fromKey(key).getDay();
    if (inTerm(key) && !inBreak(key)) {
      CLUB_SESSIONS.forEach(function (c) {
        if (c.day === dow) {
          out.push({ title: c.title, start: key, end: key, type: "club", time: c.time, place: c.place, desc: c.desc, weekly: true });
        }
      });
    }
    return out
      .filter(function (e) {
        return active[e.type];
      })
      .sort(function (a, b) {
        return (a.weekly ? 1 : 0) - (b.weekly ? 1 : 0);
      });
  }

  function renderFilters() {
    elFilters.innerHTML = "";
    CATEGORIES.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "filter-chip t-" + c.id;
      b.setAttribute("aria-pressed", "true");
      b.textContent = c.label;
      b.addEventListener("click", function () {
        active[c.id] = !active[c.id];
        b.setAttribute("aria-pressed", String(active[c.id]));
        renderCalendar();
      });
      elFilters.appendChild(b);
    });
  }

  function renderCalendar() {
    var y = view.getFullYear();
    var m = view.getMonth();
    elTitle.textContent = fmt(view, { month: "long", year: "numeric" });

    var first = new Date(y, m, 1);
    var offset = (first.getDay() + 6) % 7; // week starts on Monday
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var cells = Math.ceil((offset + daysInMonth) / 7) * 7;

    elGrid.innerHTML = "";
    for (var i = 0; i < cells; i++) {
      var d = new Date(y, m, 1 - offset + i);
      var key = toKey(d);
      var dow = d.getDay();
      var list = eventsOn(key);

      var cell = document.createElement("button");
      cell.type = "button";
      cell.className = "day";
      if (d.getMonth() !== m) cell.classList.add("is-outside");
      if (dow === 0 || dow === 6) cell.classList.add("is-weekend");
      if (active.holiday && inBreak(key)) cell.classList.add("is-break");
      if (key === todayKey) cell.classList.add("is-today");
      if (key === selected) cell.classList.add("is-selected");
      cell.dataset.key = key;
      cell.setAttribute("aria-pressed", String(key === selected));
      cell.setAttribute(
        "aria-label",
        fmt(d, { weekday: "long", day: "numeric", month: "long" }) + (list.length ? ", " + list.length + " event" + (list.length > 1 ? "s" : "") : "")
      );

      var html = '<span class="day__num">' + d.getDate() + "</span>";

      // Multi-day breaks: show the label only on the first day and each Monday
      var visible = list.filter(function (e) {
        return e.type !== "holiday" || e.start === key || dow === 1 || e.start === e.end;
      });
      if (visible.length) {
        html += '<span class="chips">';
        visible.slice(0, 2).forEach(function (e) {
          html += '<span class="chip t-' + e.type + '" title="' + esc(e.title) + '">' + esc(e.title) + "</span>";
        });
        if (visible.length > 2) html += '<span class="chips__more">+' + (visible.length - 2) + " more</span>";
        html += "</span>";
      }
      cell.innerHTML = html;
      elGrid.appendChild(cell);
    }
  }

  function dateRangeText(e) {
    if (e.start === e.end) return "";
    var a = fromKey(e.start);
    var b = fromKey(e.end);
    return fmt(a, { day: "numeric", month: "short" }) + " – " + fmt(b, { day: "numeric", month: "short", year: "numeric" });
  }

  function renderDay() {
    var d = fromKey(selected);
    elDayTitle.textContent = fmt(d, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    var list = eventsOn(selected);
    if (!list.length) {
      var msg = "No events scheduled.";
      if (d.getDay() === 0 || d.getDay() === 6) msg = "It's the weekend – enjoy the break!";
      elDayEvents.innerHTML = '<li class="empty">' + msg + "</li>";
      return;
    }
    var label = {};
    CATEGORIES.forEach(function (c) {
      label[c.id] = c.label;
    });
    elDayEvents.innerHTML = list
      .map(function (e) {
        var meta = [];
        var range = dateRangeText(e);
        if (range) meta.push(range);
        if (e.time) meta.push("🕒 " + e.time);
        if (e.place) meta.push("📍 " + e.place);
        return (
          '<li class="event-item t-' + e.type + '">' +
          '<span class="badge">' + esc(label[e.type]) + "</span>" +
          "<strong>" + esc(e.title) + "</strong>" +
          (meta.length ? "<small>" + esc(meta.join("  ·  ")) + "</small>" : "") +
          (e.desc ? "<small>" + esc(e.desc) + "</small>" : "") +
          "</li>"
        );
      })
      .join("");
  }

  function renderUpcoming() {
    var next = BASE.filter(function (e) {
      return e.end >= todayKey;
    }).slice(0, 5);
    if (!next.length) {
      elUpcoming.innerHTML = '<li class="empty">No upcoming dates yet – check back soon.</li>';
      return;
    }
    elUpcoming.innerHTML = next
      .map(function (e, i) {
        var d = fromKey(e.start < todayKey ? todayKey : e.start);
        var sub = e.start === e.end ? fmt(fromKey(e.start), { weekday: "long" }) : dateRangeText(e);
        return (
          "<li>" +
          '<button type="button" class="t-' + e.type + '" data-i="' + i + '" data-date="' + (e.start < todayKey ? todayKey : e.start) + '">' +
          '<span class="upcoming__date t-' + e.type + '"><b>' + d.getDate() + "</b><i>" + fmt(d, { month: "short" }) + "</i></span>" +
          '<span class="upcoming__text"><strong>' + esc(e.title) + "</strong><small>" + esc(sub) + (e.time ? " · " + esc(e.time) : "") + "</small></span>" +
          "</button></li>"
        );
      })
      .join("");
  }

  function goTo(key) {
    var d = fromKey(key);
    selected = key;
    view = new Date(d.getFullYear(), d.getMonth(), 1);
    renderCalendar();
    renderDay();
  }

  elGrid.addEventListener("click", function (ev) {
    var cell = ev.target.closest(".day");
    if (!cell) return;
    var key = cell.dataset.key;
    var d = fromKey(key);
    selected = key;
    if (d.getMonth() !== view.getMonth()) {
      view = new Date(d.getFullYear(), d.getMonth(), 1);
    }
    renderCalendar();
    renderDay();
    if (window.matchMedia("(max-width: 1040px)").matches) {
      $(".cal-side").scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });

  $("#calPrev").addEventListener("click", function () {
    view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
    renderCalendar();
  });
  $("#calNext").addEventListener("click", function () {
    view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
    renderCalendar();
  });
  $("#calToday").addEventListener("click", function () {
    goTo(todayKey);
  });
  elUpcoming.addEventListener("click", function (ev) {
    var btn = ev.target.closest("button[data-date]");
    if (btn) goTo(btn.getAttribute("data-date"));
  });

  // Download all key dates as an .ics file (opens in Google/Apple/Outlook calendar)
  $("#downloadIcs").addEventListener("click", function () {
    var icsText = function (s) {
      return String(s || "").replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
    };
    var compact = function (k) {
      return k.replace(/-/g, "");
    };
    var stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    var lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Edana Montessori School//School Calendar//EN", "CALSCALE:GREGORIAN", "X-WR-CALNAME:Edana Montessori School Calendar"];
    BASE.forEach(function (e, i) {
      var endExclusive = fromKey(e.end);
      endExclusive.setDate(endExclusive.getDate() + 1);
      var details = [e.desc, e.time ? "Time: " + e.time : "", e.place ? "Place: " + e.place : ""].filter(Boolean).join(" | ");
      lines.push(
        "BEGIN:VEVENT",
        "UID:edana-" + i + "-" + compact(e.start) + "@edanamontessorischool",
        "DTSTAMP:" + stamp,
        "DTSTART;VALUE=DATE:" + compact(e.start),
        "DTEND;VALUE=DATE:" + compact(toKey(endExclusive)),
        "SUMMARY:" + icsText(e.title),
        "DESCRIPTION:" + icsText(details),
        "END:VEVENT"
      );
    });
    lines.push("END:VCALENDAR");
    var blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "edana-schools-calendar.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  });

  renderFilters();
  renderCalendar();
  renderDay();
  renderUpcoming();

  /* ---------------------------------------------------------
     4. Newsletters
     --------------------------------------------------------- */

  /* ===== DATA – add a new issue at the top of this list ===== */
  var NEWSLETTERS = [
    {
      id: "n8", issue: 8, term: "Term 1", date: "2026-10-23", g: ["#0a1f45", "#2358c4"],
      title: "Open Day, Mid-Term Break & All-Staff Meeting",
      summary: "Important notices: College & Primary Open Day, the mid-term break dates and a compulsory all-staff meeting.",
      sections: [
        { h: "College & Primary Open Day", p: "Our Open Day holds on Friday 30th October at 12 noon in the Primary Section. Edana Montessori School (Nursery/Primary) and Edana Model College are coming together at the Primary school for this event. Parents are warmly invited to meet teachers and see their children's work from 12 noon." },
        { h: "A note for our staff", p: "No teacher should attend to any parent before 12 noon on Open Day. Please check all pupils' and students' notes before the date, be polite when answering parents' questions, and handle issues concerning individual children with care." },
        { h: "Mid-term break", p: "The mid-term break runs from Monday 2nd to Friday 6th November, 2026. School reopens on Monday 9th November." },
        { h: "All-staff meeting", p: "There will be a general staff meeting on Monday 2nd November, 2026 at 11:00 am prompt at Edana Montessori School. Every member of staff — part-time and full-time, teaching and non-teaching — must attend as we discuss vital issues affecting both Nursery/Primary and the College. No permission is granted." }
      ],
      dates: [["Fri 30 Oct, 12:00 noon", "College & Primary Open Day (Primary Section)"], ["Mon 2 – Fri 6 Nov", "Mid-Term Break"], ["Mon 2 Nov, 11:00 am", "All-Staff Meeting (compulsory)"], ["Mon 9 Nov", "School reopens"]]
    },
    {
      id: "n7", issue: 7, term: "Term 1", date: "2026-10-09", g: ["#0e5f8a", "#12906a"],
      title: "Extension Classes for SS1 & SS2",
      summary: "From Monday 12th October, SS1 and SS2 students will have one-hour after-school extension classes on Mondays, Thursdays and Fridays.",
      sections: [
        { h: "Notice for extension classes", p: "Dear Parents/Guardians, please be informed that, with effect from Monday 12th October, SS1 and SS2 students will be having one-hour extension classes after school every Monday, Thursday and Friday, from 3:50 pm to 4:50 pm." },
        { h: "Why extension classes?", p: "These extension classes are intended to enhance students' academic performance and adequately prepare them for their external examinations." },
        { h: "What we ask of parents", p: "We kindly request that parents and guardians allow their children to stay for this additional one hour on the stated days to participate in these important lessons. Your cooperation and support are highly appreciated as we work together to ensure the academic success of our students. Thank you. — Management, Edana Model College." }
      ],
      dates: [["From Mon 12 Oct", "SS1 & SS2 extension classes begin"], ["Mondays, Thursdays & Fridays", "3:50 pm – 4:50 pm"]]
    },
    {
      id: "n6", issue: 6, term: "Term 2", date: "2026-03-27", g: ["#12906a", "#0e5f8a"],
      title: "Term 2 Round-Up & Easter Wishes",
      summary: "Chess tournament results, a month of reading and everything you need for the Easter break.",
      sections: [
        { h: "A message from the Head Teacher", p: "What a term! From World Book Day costumes to coding challenges, our students have shown curiosity and kindness every single day. Thank you to every parent who supported us. Please enjoy a restful Easter break with your families." },
        { h: "Chess Club shines at the inter-school tournament", p: "Our Chess Club hosted teams from neighbouring schools on 20 March. Edana players showed excellent sportsmanship and several beginners won their very first games. Huge thanks to our coaches and to the parents who helped with refreshments." },
        { h: "Reports and next term", p: "Term 2 reports go home today. Term 3 begins on Monday 20 April. Please make sure your child has the summer uniform and their club kit." }
      ],
      dates: [["Mon 30 Mar – Fri 17 Apr", "Easter Break"], ["Mon 20 Apr", "Term 3 begins"], ["Fri 15 May", "Annual Sports Day"]]
    },
    {
      id: "n5", issue: 5, term: "Term 2", date: "2026-03-06", g: ["#c2338a", "#7c4dcc"],
      title: "Coding Stars & a Month of Reading",
      summary: "Highlights from Coding Challenge Day, World Book Day and Music Club's new instruments.",
      sections: [
        { h: "Coding Challenge Day", p: "Teams from our ICT Club spent a morning solving puzzles and building mini-games. Every student left with a new skill and a lot of pride. The next challenge is the ICT Expo & Science Fair in June." },
        { h: "World Book Day", p: "Our corridors were full of wizards, explorers and superheroes. Thank you for helping your children create such imaginative costumes and for donating to our library book drive." },
        { h: "Music Club adds new instruments", p: "Thanks to the generosity of our parent community, the Music Club now has two new keyboards and a set of hand drums. Rehearsals are on Wednesdays from 3:30 pm." }
      ],
      dates: [["Fri 20 Mar", "Inter-School Chess Tournament"], ["Fri 27 Mar", "Term 2 ends (1:00 pm finish)"]]
    },
    {
      id: "n4", issue: 4, term: "Term 2", date: "2026-01-16", g: ["#2358c4", "#0e2a5a"],
      title: "A Fresh Start for Term 2",
      summary: "Welcome back! New timetables, club times and what to expect this term.",
      sections: [
        { h: "Welcome back", p: "We hope you had a wonderful Christmas break. Students have returned rested and ready to learn. Please check your child's updated timetable, which was sent home on the first day." },
        { h: "Clubs are back", p: "ICT Club (Tuesdays), Music Club (Wednesdays) and Chess Club (Thursdays) all run from 3:30 pm. New members are welcome at any time – just let the office know." },
        { h: "Parent–Teacher Conferences", p: "Conferences take place on Thursday 22 January from 2:00 to 6:00 pm. Booking slips are available from your child's class teacher." }
      ],
      dates: [["Thu 22 Jan", "Parent–Teacher Conferences"], ["Fri 6 Feb", "Coding Challenge Day"], ["Mon 16 – Fri 20 Feb", "Mid-Term Break"]]
    },
    {
      id: "n3", issue: 3, term: "Term 1", date: "2025-12-05", g: ["#d93f56", "#9b2338"],
      title: "Carols, Concerts & a Term to Remember",
      summary: "A look back at an exciting term and the Christmas Music Concert.",
      sections: [
        { h: "Christmas Carols & Music Concert", p: "Tonight our Music Club choir and band take the stage in the School Hall at 6:00 pm. Come early for the best seats – and bring your singing voices for the final carol!" },
        { h: "Term 1 in review", p: "This term our students welcomed new classmates, launched the Chess Club ladder, built their first websites in ICT and completed our reading challenge. We are very proud of their effort." },
        { h: "Christmas break", p: "Term 1 ends on Friday 12 December with a 1:00 pm finish. School reopens for Term 2 on Monday 12 January." }
      ],
      dates: [["Fri 5 Dec, 6:00 pm", "Christmas Carols & Music Concert"], ["Fri 12 Dec", "Term 1 ends"], ["Mon 12 Jan", "Term 2 begins"]]
    },
    {
      id: "n2", issue: 2, term: "Term 1", date: "2025-10-24", g: ["#c98a06", "#a8530a"],
      title: "Mid-Term Highlights",
      summary: "Settling in, club sign-ups and a look at our reading week.",
      sections: [
        { h: "Settling in beautifully", p: "Our newest students have made friends quickly and our older students are setting a wonderful example as buddies and mentors." },
        { h: "Club membership is growing", p: "More than 120 students now attend the ICT, Music or Chess Club. We are grateful to the staff and volunteers who make these clubs possible." },
        { h: "Mid-term break", p: "School closes today at 1:00 pm. Students are encouraged to read for 20 minutes a day over the break." }
      ],
      dates: [["Mon 27 – Fri 31 Oct", "Mid-Term Break"], ["Mon 3 Nov", "School reopens"]]
    },
    {
      id: "n1", issue: 1, term: "Term 1", date: "2025-09-12", g: ["#0e5f8a", "#12906a"],
      title: "Welcome Back to a New School Year",
      summary: "Meet our new teachers, discover what's new in the ICT lab and sign up for clubs.",
      sections: [
        { h: "A message from the Head Teacher", p: "Welcome to the new school year! It is a joy to see our students back, smiling and full of energy. This year we are focusing on curiosity, kindness and confidence." },
        { h: "What's new in the ICT lab", p: "We have refreshed our computer lab with new machines and learning software so every student can code, design and create." },
        { h: "Club sign-up is open", p: "Choose from ICT, Music or Chess Club. Sessions start next week and no experience is needed. Use the contact form on our website to register your child." }
      ],
      dates: [["Fri 19 Sep, 5:30 pm", "Parents' Orientation Evening"], ["Tue 16 Sep", "ICT Club starts"], ["Wed 17 Sep", "Music Club starts"], ["Thu 18 Sep", "Chess Club starts"]]
    }
  ];

  var elNlGrid = $("#nlGrid");
  var elTabs = $("#nlTabs");
  var nlFilter = "all";

  function renderNewsletters() {
    var list = NEWSLETTERS.filter(function (n) {
      return nlFilter === "all" || n.term === nlFilter;
    });
    elNlGrid.innerHTML = list
      .map(function (n, i) {
        var d = fromKey(n.date);
        return (
          '<button type="button" class="nl-card" data-id="' + n.id + '" style="--g1:' + n.g[0] + ";--g2:" + n.g[1] + ";animation-delay:" + i * 60 + 'ms">' +
          '<div class="nl-card__cover">' +
          '<div class="nl-card__issue"><small>Issue</small>' + pad(n.issue) + "</div>" +
          '<span class="nl-card__term">' + esc(n.term) + "</span>" +
          "</div>" +
          '<div class="nl-card__body">' +
          '<span class="nl-card__date">' + fmt(d, { day: "numeric", month: "long", year: "numeric" }) + "</span>" +
          "<h3>" + esc(n.title) + "</h3>" +
          "<p>" + esc(n.summary) + "</p>" +
          '<span class="nl-card__link">Read newsletter →</span>' +
          "</div></button>"
        );
      })
      .join("");
  }

  elTabs.addEventListener("click", function (ev) {
    var tab = ev.target.closest(".tab");
    if (!tab) return;
    nlFilter = tab.getAttribute("data-filter");
    $$(".tab", elTabs).forEach(function (t) {
      var on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
    });
    renderNewsletters();
  });

  /* ----- Newsletter reader (modal) ----- */
  var modal = $("#nlModal");
  var modalPanel = $(".modal__panel", modal);
  var nlContent = $("#nlContent");
  var btnOlder = $("#nlOlder");
  var btnNewer = $("#nlNewer");
  var currentIdx = -1;
  var lastFocus = null;

  function showNewsletter(idx) {
    var n = NEWSLETTERS[idx];
    if (!n) return;
    currentIdx = idx;
    var d = fromKey(n.date);
    nlContent.innerHTML =
      '<header class="nl-doc__head" style="--g1:' + n.g[0] + ";--g2:" + n.g[1] + '">' +
      '<p class="nl-doc__brand">Edana Montessori School · Newsletter · Issue ' + pad(n.issue) + "</p>" +
      '<h2 id="nlTitle">' + esc(n.title) + "</h2>" +
      '<p class="nl-doc__meta">' + fmt(d, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + " · " + esc(n.term) + "</p>" +
      "</header>" +
      '<div class="nl-doc__body">' +
      n.sections.map(function (s) {
        return "<section><h3>" + esc(s.h) + "</h3><p>" + esc(s.p) + "</p></section>";
      }).join("") +
      '<div class="nl-doc__dates"><h3>📅 Dates to remember</h3><ul>' +
      n.dates.map(function (x) {
        return "<li><b>" + esc(x[0]) + "</b> — " + esc(x[1]) + "</li>";
      }).join("") +
      "</ul></div>" +
      '<p class="nl-doc__sign">With warm wishes,<br />The Head Teacher &amp; staff of Edana Montessori School</p>' +
      "</div>";
    btnOlder.disabled = idx >= NEWSLETTERS.length - 1;
    btnNewer.disabled = idx <= 0;
    modalPanel.scrollTop = 0;
  }

  function openModal(id) {
    var idx = NEWSLETTERS.findIndex(function (n) {
      return n.id === id;
    });
    if (idx < 0) return;
    lastFocus = document.activeElement;
    showNewsletter(idx);
    modal.hidden = false;
    document.body.classList.add("modal-open");
    modalPanel.focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  elNlGrid.addEventListener("click", function (ev) {
    var card = ev.target.closest(".nl-card");
    if (card) openModal(card.getAttribute("data-id"));
  });
  modal.addEventListener("click", function (ev) {
    if (ev.target.closest("[data-close]")) closeModal();
  });
  btnOlder.addEventListener("click", function () {
    showNewsletter(currentIdx + 1);
  });
  btnNewer.addEventListener("click", function () {
    showNewsletter(currentIdx - 1);
  });
  $("#nlPrint").addEventListener("click", function () {
    window.print();
  });
  document.addEventListener("keydown", function (ev) {
    if (modal.hidden) return;
    if (ev.key === "Escape") closeModal();
    if (ev.key === "ArrowLeft" && !btnOlder.disabled) showNewsletter(currentIdx + 1);
    if (ev.key === "ArrowRight" && !btnNewer.disabled) showNewsletter(currentIdx - 1);
  });

  renderNewsletters();

  /* ---------------------------------------------------------
     4b. Photo gallery
     (photos live in index.html – copy a <button class="g-item"> to add one)
     --------------------------------------------------------- */
  var galTabs = $("#galTabs");
  var galGrid = $("#galGrid");
  var galItems = $$(".g-item", galGrid);
  var galCount = $("#galCount");
  var galFilter = "all";
  var galLabels = {};
  $$(".tab", galTabs).forEach(function (t) {
    galLabels[t.getAttribute("data-filter")] = t.textContent;
  });

  function visibleGallery() {
    return galItems.filter(function (el) {
      return !el.hidden;
    });
  }

  function applyGalleryFilter() {
    galItems.forEach(function (el) {
      el.hidden = !(galFilter === "all" || el.getAttribute("data-cat") === galFilter);
    });
    var n = visibleGallery().length;
    galCount.textContent =
      "Showing " + n + " photo" + (n === 1 ? "" : "s") + (galFilter === "all" ? "" : " in “" + galLabels[galFilter] + "”");
  }

  galTabs.addEventListener("click", function (ev) {
    var tab = ev.target.closest(".tab");
    if (!tab) return;
    galFilter = tab.getAttribute("data-filter");
    $$(".tab", galTabs).forEach(function (t) {
      var on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-pressed", String(on));
    });
    applyGalleryFilter();
  });

  /* ----- Photo viewer (lightbox) ----- */
  var lb = $("#lightbox");
  var lbImg = $("#lbImg");
  var lbTitle = $("#lbTitle");
  var lbMeta = $("#lbMeta");
  var lbDesc = $("#lbDesc");
  var lbCount = $("#lbCount");
  var lbList = [];
  var lbIdx = 0;
  var lbLastFocus = null;

  function showPhoto(i) {
    var n = lbList.length;
    if (!n) return;
    lbIdx = (i + n) % n;
    var el = lbList[lbIdx];
    var img = $("img", el);
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbTitle.textContent = el.getAttribute("data-title");
    lbMeta.textContent = el.getAttribute("data-date") + " · " + (galLabels[el.getAttribute("data-cat")] || "");
    lbDesc.textContent = el.getAttribute("data-desc");
    lbCount.textContent = lbIdx + 1 + " / " + n;
  }
  function openLightbox(el) {
    lbList = visibleGallery();
    lbLastFocus = el;
    showPhoto(lbList.indexOf(el));
    lb.hidden = false;
    document.body.classList.add("modal-open");
    $(".lightbox__close", lb).focus();
  }
  function closeLightbox() {
    lb.hidden = true;
    lbImg.removeAttribute("src");
    document.body.classList.remove("modal-open");
    if (lbLastFocus && lbLastFocus.focus) lbLastFocus.focus();
  }

  galGrid.addEventListener("click", function (ev) {
    var item = ev.target.closest(".g-item");
    if (item) openLightbox(item);
  });
  lb.addEventListener("click", function (ev) {
    if (ev.target.closest("[data-lb-close]")) closeLightbox();
  });
  $("#lbPrev").addEventListener("click", function () {
    showPhoto(lbIdx - 1);
  });
  $("#lbNext").addEventListener("click", function () {
    showPhoto(lbIdx + 1);
  });
  document.addEventListener("keydown", function (ev) {
    if (lb.hidden) return;
    if (ev.key === "Escape") closeLightbox();
    if (ev.key === "ArrowLeft") showPhoto(lbIdx - 1);
    if (ev.key === "ArrowRight") showPhoto(lbIdx + 1);
  });
  // Swipe left / right on touch screens
  var touchX = null;
  lb.addEventListener(
    "touchstart",
    function (ev) {
      touchX = ev.changedTouches[0].clientX;
    },
    { passive: true }
  );
  lb.addEventListener(
    "touchend",
    function (ev) {
      if (touchX === null) return;
      var dx = ev.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 50) showPhoto(lbIdx + (dx < 0 ? 1 : -1));
    },
    { passive: true }
  );

  applyGalleryFilter();

  /* ---------------------------------------------------------
     4c. School fees & payment bills
     Edana Montessori School (Reception, Nursery, Basic 1–6)
     Edana Model College     (JSS 1, 2 & 3)
     Figures taken from the official 2026/2027 new-intake bills.
     Edit PROGRAMMES to update any fee, uniform item, bank or option.
     --------------------------------------------------------- */

  /* ===== DATA ===== */
  var CURRENCY = "NGN";
  var SESSION = "2026/2027";

  var MONTESSORI = {
    name: "Edana Montessori School",
    place: "Baruwa, Ipaja, Lagos",
    address: "16 Olagbe Street, Baruwa, Ipaja, Lagos",
    phones: ["0816 223 0026", "0802 914 8634", "0813 697 1528"],
    email: "edanamontessorischool@gmail.com"
  };
  var COLLEGE = {
    name: "Edana Model College",
    place: "Baruwa, Ipaja, Lagos",
    address: "16 Olagbe Street, Baruwa, Ipaja, Lagos",
    phones: ["0816 223 0026", "0802 914 8634", "0813 697 1528"],
    email: "edanamontessorischool@gmail.com"
  };

  var MONT_BANKS = [
    { name: "Sterling Bank", holder: "Edana Montessori School", acct: "0095475599" },
    { name: "Access Bank", holder: "Edana Montessori School", acct: "0067183378" },
    { name: "First Bank", holder: "Edana Montessori School", acct: "2036355219" },
    { name: "Moniepoint", holder: "Edana Montessori Sch / Alozie Uchechi Ann", acct: "5556465667" }
  ];
  var COLLEGE_BANKS = [
    { name: "FCMB", holder: "Edana Montessori School", acct: "6513235019" },
    { name: "Moniepoint", holder: "Edana Montessori Sch / Alozie Uchechi Ann", acct: "5556465667" },
    { name: "First Bank", holder: "Edana Montessori School", acct: "2036355219" }
  ];

  // Labels for the Montessori uniform pack (sold as one flat-price pack)
  var MONT_UNIFORM = [
    { label: "2 pairs of uniform with 1 tie" },
    { label: "1 polo shirt (for Wednesdays)" },
    { label: "1 sports wear" },
    { label: "1 cardigan" }
  ];

  var MONT_OPTIONAL = [
    { label: "Music Club", amt: 12000, per: "term" },
    { label: "Chess Class", amt: 10000, per: "term" },
    { label: "Ballet", amt: 10000, per: "term" },
    { label: "Coding (ICT) Club", amt: 12000, per: "term" },
    { label: "Karate Class", amt: 10000, per: "term" },
    { label: "Karate uniform", amt: 18000, per: "one-time" }
  ];
  var JSS_OPTIONAL = [
    { label: "Music Club", amt: 12000, per: "term" },
    { label: "Chess Class", amt: 10000, per: "term" },
    { label: "Ballet", amt: 10000, per: "term" },
    { label: "ICT / Coding", amt: 12000, per: "term" },
    { label: "Karate Class", amt: 10000, per: "term" },
    { label: "Karate uniform", amt: 20000, per: "one-time" }
  ];
  var SSS_OPTIONAL = [
    { label: "Christmas Party", amt: 15000, per: "term" },
    { label: "Chess", amt: 8000, per: "term" },
    { label: "Music Club", amt: 10000, per: "term" },
    { label: "Ballet", amt: 8000, per: "term" }
  ];

  // Fee lines for the senior secondary 1st-term bill
  function sssFees() {
    return [
      { label: "Term's fee", amt: 75500, note: "1st term" },
      { label: "Science Practical Fee", amt: 25000, note: "Per term" },
      { label: "School Portal Services", amt: 5000, note: "Online portal access" },
      { label: "PROTECH / Edana Mathematics Competition", amt: 5000, note: "Per session" },
      { label: "Text books (English & Mathematics only)", amt: 14500, note: "1st term" }
    ];
  }
  var SSS_EXTRAS = [
    { label: "Science Lab Apron", note: "To be made by yourself" },
    { label: "Exercise books (60 leaves)", note: "\u20a6700 each" }
  ];

  // Build the four standard fee lines for a programme
  function feeRows(reg, term) {
    return [
      { label: "Registration form", amt: reg, note: "One-time, new intake" },
      { label: "Term's fee", amt: term, note: "Tuition, payable each term" },
      { label: "ICT / Edu Portal access", amt: 5000, note: "Learning platform & computer lab" },
      { label: "Development levy", amt: 20000, note: "Facilities & improvements" }
    ];
  }

  var PROGRAMMES = [
    {
      id: "reception", code: "REC", name: "Reception Classes", short: "Reception",
      school: MONTESSORI, group: "Edana Montessori School", banks: MONT_BANKS,
      fees: feeRows(5000, 49500), uniformItems: MONT_UNIFORM, uniformFlat: 55000, optional: MONT_OPTIONAL
    },
    {
      id: "nursery", code: "NUR", name: "Nursery Class", short: "Nursery",
      school: MONTESSORI, group: "Edana Montessori School", banks: MONT_BANKS,
      fees: feeRows(5000, 54500), uniformItems: MONT_UNIFORM, uniformFlat: 55000, optional: MONT_OPTIONAL
    },
    {
      id: "basic", code: "BAS", name: "Basic Classes (Grade 1 – 6)", short: "Basic (1 – 6)",
      school: MONTESSORI, group: "Edana Montessori School", banks: MONT_BANKS,
      fees: feeRows(5000, 59500), uniformItems: MONT_UNIFORM, uniformFlat: 55000, optional: MONT_OPTIONAL
    },
    {
      id: "jss", code: "JSS", name: "JSS 1 – 3", short: "JSS 1 – 3",
      school: COLLEGE, group: "Edana Model College (Secondary)", banks: COLLEGE_BANKS,
      fees: feeRows(7000, 67500),
      uniformItems: [
        { label: "2 pairs of uniform with 1 tie", amt: 40000 },
        { label: "1 polo shirt for Wednesdays", amt: 7000 },
        { label: "1 sports wear", amt: 15000 },
        { label: "1 cardigan", amt: 15000 }
      ],
      extras: [
        { label: "Exercise books", note: "Purchased at school" },
        { label: "Textbooks", note: "Purchased at school" },
        { label: "Social activities / Excursion", note: "Payable per term" },
        { label: "Transport", note: "Optional" }
      ],
      optional: JSS_OPTIONAL
    },
    {
      id: "sss1", code: "SSS1", name: "SSS 1", short: "SSS 1", kind: "term",
      school: COLLEGE, group: "Edana Model College (Senior Secondary)", banks: COLLEGE_BANKS,
      fees: sssFees(), uniformItems: [], extras: SSS_EXTRAS, optional: SSS_OPTIONAL
    },
    {
      id: "sss2", code: "SSS2", name: "SSS 2", short: "SSS 2", kind: "term",
      school: COLLEGE, group: "Edana Model College (Senior Secondary)", banks: COLLEGE_BANKS,
      fees: sssFees(), uniformItems: [], extras: SSS_EXTRAS, optional: SSS_OPTIONAL
    }
  ];

  /* ===== Helpers ===== */
  var money = function (n) {
    return "\u20a6" + Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 });
  };
  var progById = function (id) {
    return PROGRAMMES.filter(function (p) {
      return p.id === id;
    })[0];
  };
  var montProgs = PROGRAMMES.filter(function (p) {
    return p.school === MONTESSORI;
  });
  var feesTotal = function (p) {
    return p.fees.reduce(function (s, r) {
      return s + r.amt;
    }, 0);
  };
  var hasUniform = function (p) {
    return typeof p.uniformFlat === "number" || (p.uniformItems && p.uniformItems.length > 0);
  };
  var uniformTotal = function (p) {
    if (typeof p.uniformFlat === "number") return p.uniformFlat;
    return (p.uniformItems || []).reduce(function (s, u) {
      return s + (u.amt || 0);
    }, 0);
  };
  var grandTotal = function (p) {
    return feesTotal(p) + uniformTotal(p);
  };
  var totalLabel = function (p) {
    return p.kind === "term" ? "Total (1st term)" : "Total fees";
  };
  // The tuition / term's fee line for a programme (paid every term)
  var termFeeOf = function (p) {
    var row = p.fees.filter(function (r) {
      return /term's fee/i.test(r.label);
    })[0];
    return row ? row.amt : 0;
  };
  var uniformLabels = function (p) {
    return p.uniformItems
      .map(function (u) {
        return u.label;
      })
      .join(", ");
  };

  /* ===== Bill picker / calculator ===== */
  var feeSelect = $("#feeProg");
  (function buildProgSelect() {
    var html = "";
    var cur = "";
    PROGRAMMES.forEach(function (p) {
      if (p.group !== cur) {
        if (cur) html += "</optgroup>";
        html += '<optgroup label="' + esc(p.group) + '">';
        cur = p.group;
      }
      html += '<option value="' + p.id + '">' + esc(p.name) + "</option>";
    });
    feeSelect.innerHTML = html + "</optgroup>";
    feeSelect.value = "reception";
  })();

  function renderPicker() {
    var p = progById(feeSelect.value);
    var uni = hasUniform(p);
    $("#feeProgName").textContent = p.name + " · " + p.school.name;
    $("#feePill").textContent = p.kind === "term" ? "1st term 2026/2027" : "New intake 2026/2027";
    var rows = p.fees.map(function (r) {
      return (
        "<li><div><strong>" + esc(r.label) + "</strong><small>" + esc(r.note) + "</small></div>" +
        '<span class="amt">' + money(r.amt) + "</span></li>"
      );
    });
    if (uni) {
      rows.push(
        '<li><div><strong>Uniform &amp; items</strong><small>One-time: ' + esc(uniformLabels(p)) + "</small></div>" +
        '<span class="amt">' + money(uniformTotal(p)) + "</span></li>"
      );
    }
    $("#feeLines").innerHTML = rows.join("");
    $("#feeGrandLabel").textContent = p.kind === "term" ? "Total (1st term)" : "Grand total (new intake)";
    $("#feeGrand").textContent = money(grandTotal(p));

    $("#calcFeesLabel").textContent = p.kind === "term" ? "1st-term charges" : "Termly fees";
    $("#calcFees").textContent = money(feesTotal(p));
    $("#calcUniformRow").style.display = uni ? "" : "none";
    $("#calcUniform").textContent = money(uniformTotal(p));
    $("#calcGrand").textContent = money(grandTotal(p));
  }
  feeSelect.addEventListener("change", renderPicker);

  /* ===== 2nd & 3rd term fees (term's fee only, all classes) ===== */
  function renderTermFees() {
    if (!$("#termFeesBody")) return;
    $("#termFeesBody").innerHTML = PROGRAMMES.map(function (p, i) {
      var t = termFeeOf(p);
      return (
        "<tr><td class=\"col-sn\">" + (i + 1) + "</td>" +
        '<th scope="row">' + esc(p.name) + "</th>" +
        "<td>" + money(t) + "</td>" +
        "<td>" + money(t) + "</td></tr>"
      );
    }).join("");
  }

  /* ===== Montessori full bill table (3 columns) ===== */
  function renderBillTable() {
    var cell = function (v, cls) {
      return '<td class="' + (cls || "") + '">' + money(v) + "</td>";
    };
    var html = "";
    var sn = 0;
    montProgs[0].fees.forEach(function (r, i) {
      sn++;
      html +=
        '<tr><td class="col-sn">' + sn + '</td><th scope="row">' + esc(r.label) + "</th>" +
        montProgs.map(function (p) {
          return cell(p.fees[i].amt);
        }).join("") + "</tr>";
    });
    sn++;
    html +=
      '<tr class="row-total"><td class="col-sn">' + sn + '</td><th scope="row">Total fees</th>' +
      montProgs.map(function (p) {
        return cell(feesTotal(p), "total");
      }).join("") + "</tr>";
    sn++;
    html +=
      '<tr><td class="col-sn">' + sn + '</td><th scope="row">Uniform &amp; items <small class="row-note">' + esc(uniformLabels(montProgs[0])) + " (one-time)</small></th>" +
      montProgs.map(function (p) {
        return cell(uniformTotal(p));
      }).join("") + "</tr>";
    sn++;
    html +=
      '<tr class="row-grand"><td class="col-sn">' + sn + '</td><th scope="row">Grand total (new intake)</th>' +
      montProgs.map(function (p) {
        return cell(grandTotal(p), "total");
      }).join("") + "</tr>";
    $("#billTableBody").innerHTML = html;
  }

  /* ===== Edana Model College — JSS 1–3 itemised table ===== */
  function renderJssTable() {
    var p = progById("jss");
    var sn = 0;
    var h = "";
    var row = function (label, amtHtml, cls, sub) {
      sn += sub ? 0 : 1;
      h +=
        '<tr class="' + (cls || "") + '">' +
        '<td class="col-sn">' + (sub ? "" : sn) + "</td>" +
        '<th scope="row" class="' + (sub ? "row-sub" : "") + '">' + label + "</th>" +
        '<td class="amt">' + amtHtml + "</td></tr>";
    };
    // 1–4 fees
    p.fees.forEach(function (r) {
      row(esc(r.label), money(r.amt));
    });
    // 5 total fees
    row("TOTAL", money(feesTotal(p)), "row-total");
    // 6 uniforms (header + itemised sub-rows + total)
    row("Uniforms", "", "row-head");
    p.uniformItems.forEach(function (u) {
      row(esc(u.label), money(u.amt), "", true);
    });
    row("Total uniforms", money(uniformTotal(p)), "row-subtotal", true);
    // 7 grand total
    row("TOTAL", money(grandTotal(p)), "row-grand");
    // 8–11 extras (indicated, no fixed price)
    p.extras.forEach(function (e) {
      row(esc(e.label), '<span class="amt--note">' + esc(e.note) + "</span>");
    });
    // 12 others (optional)
    row("Others <span class=\"row-note\">(payable optional / term)</span>", "", "row-head");
    p.optional.forEach(function (o) {
      row(esc(o.label) + (o.per === "one-time" ? " (one-time)" : ""), money(o.amt), "", true);
    });
    $("#jssBillBody").innerHTML = h;

    // college bank accounts under the table
    if ($("#jssBanks")) {
      $("#jssBanks").innerHTML = COLLEGE_BANKS.map(function (b) {
        return "<li><span>" + esc(b.name) + " — " + esc(b.holder) + "</span><b>" + esc(b.acct) + "</b></li>";
      }).join("");
    }
  }

  /* ===== Edana Model College — SSS 1 & 2 itemised table ===== */
  function renderSssTable() {
    var p = progById("sss1"); // SSS 1 & 2 share the same 1st-term bill
    if (!p || !$("#sssBillBody")) return;
    var sn = 0;
    var h = "";
    var row = function (label, amtHtml, cls, sub) {
      sn += sub ? 0 : 1;
      h +=
        '<tr class="' + (cls || "") + '">' +
        '<td class="col-sn">' + (sub ? "" : sn) + "</td>" +
        '<th scope="row" class="' + (sub ? "row-sub" : "") + '">' + label + "</th>" +
        '<td class="amt">' + amtHtml + "</td></tr>";
    };
    // fees
    p.fees.forEach(function (r) {
      row(esc(r.label), money(r.amt));
    });
    // total (1st term)
    row("TOTAL (1st term)", money(feesTotal(p)), "row-grand");
    // extras — indicated, no fixed price
    p.extras.forEach(function (e) {
      row(esc(e.label), '<span class="amt--note">' + esc(e.note) + "</span>");
    });
    // others (optional)
    row("Others <span class=\"row-note\">(optional / term)</span>", "", "row-head");
    p.optional.forEach(function (o) {
      row(esc(o.label), money(o.amt), "", true);
    });
    $("#sssBillBody").innerHTML = h;

    if ($("#sssBanks")) {
      $("#sssBanks").innerHTML = COLLEGE_BANKS.map(function (b) {
        return "<li><span>" + esc(b.name) + " — " + esc(b.holder) + "</span><b>" + esc(b.acct) + "</b></li>";
      }).join("");
    }
  }

  /* ===== Optional activities + payment info (primary section) ===== */
  function renderOptional() {
    $("#optionalBody").innerHTML = MONT_OPTIONAL.map(function (o) {
      return (
        '<tr><th scope="row">' + esc(o.label) + "</th>" +
        "<td>" + money(o.amt) + "</td>" +
        "<td>" + (o.per === "term" ? "Per term" : "One-time") + "</td></tr>"
      );
    }).join("");
  }
  function renderBanks() {
    $("#bankList").innerHTML = MONT_BANKS.map(function (b) {
      return "<li><span>" + esc(b.name) + "</span><b>" + esc(b.acct) + "</b></li>";
    }).join("");
  }

  /* ===== Itemised bill (modal) ===== */
  var billModal = $("#billModal");
  var billPanel = $(".modal__panel", billModal);
  var billContent = $("#billContent");
  var billApply = $("#billApply");
  var billLastFocus = null;

  function billHtml(p) {
    var rows = "";
    var group = function (title) {
      rows += '<tr class="grp"><th colspan="2">' + esc(title) + "</th></tr>";
    };
    var line = function (item, note, amtHtml, cls) {
      rows +=
        '<tr class="' + (cls || "") + '"><td><strong>' + item + "</strong>" + (note ? "<small>" + esc(note) + "</small>" : "") + "</td>" +
        '<td class="amt">' + amtHtml + "</td></tr>";
    };
    var meta = function (k, v) {
      return "<div><dt>" + esc(k) + "</dt><dd>" + esc(v) + "</dd></div>";
    };

    group(p.kind === "term" ? "1st-term fees" : "Termly fees");
    p.fees.forEach(function (r) {
      line(esc(r.label), r.note, money(r.amt));
    });

    if (hasUniform(p)) {
      group("Uniform & items (one-time, new intake)");
      if (p.uniformItems[0] && typeof p.uniformItems[0].amt === "number") {
        p.uniformItems.forEach(function (u) {
          line(esc(u.label), "", money(u.amt));
        });
        line("Total uniforms", "", money(uniformTotal(p)), "sub");
      } else {
        line("Uniform &amp; item pack", uniformLabels(p), money(uniformTotal(p)));
      }
    }

    if (p.extras && p.extras.length) {
      group("Also on the bill");
      p.extras.forEach(function (e) {
        line(esc(e.label), "", '<span class="amt--note">' + esc(e.note) + "</span>");
      });
    }

    if (p.optional && p.optional.length) {
      group("Optional activities (payable per term)");
      p.optional.forEach(function (o) {
        line(esc(o.label) + (o.per === "one-time" ? " (one-time)" : ""), "", money(o.amt));
      });
    }

    var code = "EDN-" + SESSION.replace("/", "") + "-" + p.code;
    var today = fmt(todayDate, { day: "numeric", month: "long", year: "numeric" });

    return (
      '<header class="nl-doc__head" style="--g1:#0a1f45;--g2:#2358c4">' +
      '<p class="nl-doc__brand">' + esc(p.school.name) + " · " + esc(p.school.place) + "</p>" +
      '<h2 id="billTitle">School fees bill — ' + esc(p.name) + "</h2>" +
      '<p class="nl-doc__meta">' + (p.kind === "term" ? "1st term" : "New intake") + " · " + esc(SESSION) + " session</p>" +
      "</header>" +
      '<div class="nl-doc__body">' +
      '<dl class="bill-meta">' +
      meta("Bill no.", code) + meta("Date issued", today) +
      meta("Class", p.name) + meta("School", p.school.name) +
      "</dl>" +
      '<table class="bill-table"><thead class="sr-only"><tr><th>Description</th><th>Amount</th></tr></thead><tbody>' + rows + "</tbody></table>" +
      '<div class="bill-total"><span>' + totalLabel(p) + "</span><strong>" + money(feesTotal(p)) + "</strong></div>" +
      (hasUniform(p)
        ? '<div class="bill-total" style="margin-top:10px"><span>Grand total (incl. uniform &amp; items)</span><strong>' + money(grandTotal(p)) + "</strong></div>"
        : "") +
      '<div class="nl-doc__dates"><h3>🏦 Pay by bank transfer</h3><ul class="sched">' +
      p.banks.map(function (b) {
        return "<li><span><b>" + esc(b.name) + "</b> — " + esc(b.holder) + "</span><b>" + esc(b.acct) + "</b></li>";
      }).join("") +
      "</ul></div>" +
      '<div class="nl-doc__dates"><h3>ℹ️ Please note</h3><ul>' +
      "<li>Use your child's full name as the payment reference, then send proof of payment to the school.</li>" +
      "<li>Text books, exercise books and stationery are purchased from the school.</li>" +
      "<li>Clubs and activities (Music, Chess, Ballet, Coding, Karate) are optional and billed per term.</li>" +
      "</ul></div>" +
      '<p class="nl-doc__sign">Thank you for choosing ' + esc(p.school.name) + ".<br />" +
      esc(p.school.address) + " · " + esc(p.school.phones[0]) + " · " + esc(p.school.email) + "</p>" +
      "</div>"
    );
  }

  function openBill(id) {
    var p = progById(id);
    if (!p) return;
    billLastFocus = document.activeElement;
    billContent.innerHTML = billHtml(p);
    billModal.hidden = false;
    document.body.classList.add("modal-open");
    billPanel.scrollTop = 0;
    billPanel.focus();
  }
  function closeBill() {
    billModal.hidden = true;
    document.body.classList.remove("modal-open");
    if (billLastFocus && billLastFocus.focus) billLastFocus.focus();
  }

  $("#viewProgBill").addEventListener("click", function () {
    openBill(feeSelect.value);
  });
  if ($("#viewJssBill")) {
    $("#viewJssBill").addEventListener("click", function () {
      openBill("jss");
    });
  }
  if ($("#viewSssBill")) {
    $("#viewSssBill").addEventListener("click", function () {
      openBill("sss1");
    });
  }
  billModal.addEventListener("click", function (ev) {
    if (ev.target.closest("[data-close]")) closeBill();
  });
  billApply.addEventListener("click", function () {
    $("#cInterest").value = "Admissions";
  });
  $("#billPrint").addEventListener("click", function () {
    window.print();
  });
  document.addEventListener("keydown", function (ev) {
    if (!billModal.hidden && ev.key === "Escape") closeBill();
  });

  /* ===== Pay fees online (Paystack) =====
     SETUP: paste the school's Paystack PUBLIC key below to go live.
       1. Create a free account at https://paystack.com (money goes to the
          school's own settlement bank account).
       2. Dashboard → Settings → API Keys & Webhooks → copy the PUBLIC key.
       3. Paste it as PAYSTACK_PUBLIC_KEY (it starts with "pk_live_...").
     Until a key is added, the button shows the bank-transfer details instead.
     (A public key is safe to expose; never put a SECRET key on the website.) */
  var PAYSTACK_PUBLIC_KEY = ""; // e.g. "pk_live_xxxxxxxxxxxxxxxxxxxxxxxx"

  var payModal = $("#payModal");
  var payPanel = $(".modal__panel", payModal);
  var payForm = $("#payForm");
  var payAmount = $("#payAmount");
  var payMsg = $("#payMsg");
  var payNowText = $("#payNowText");
  var payLastFocus = null;
  var payProg = null;

  function updatePayBtn() {
    var v = parseInt(payAmount.value, 10);
    payNowText.textContent = "Pay " + money(isNaN(v) ? 0 : v) + " now";
  }

  function openPay(id) {
    var p = progById(id);
    if (!p) return;
    payProg = p;
    payLastFocus = document.activeElement;
    $("#payTitle").textContent = "Pay fees — " + p.name;
    $("#paySummary").textContent =
      p.school.name + " · " + (p.kind === "term" ? "1st term" : "new intake") + " " + SESSION +
      " · " + totalLabel(p) + " " + money(feesTotal(p)) +
      (hasUniform(p) ? " (grand total " + money(grandTotal(p)) + ")" : "");
    payAmount.value = grandTotal(p);
    updatePayBtn();
    payMsg.textContent = "";
    payMsg.className = "form-msg";
    payModal.hidden = false;
    document.body.classList.add("modal-open");
    payPanel.scrollTop = 0;
    payPanel.focus();
  }
  function closePay() {
    payModal.hidden = true;
    document.body.classList.remove("modal-open");
    if (payLastFocus && payLastFocus.focus) payLastFocus.focus();
  }

  $("#payProgBill").addEventListener("click", function () {
    // No key yet → guide the parent to pay by bank transfer instead
    if (!PAYSTACK_PUBLIC_KEY) {
      openBill(feeSelect.value);
      setTimeout(function () {
        var note = $("#billContent .nl-doc__dates");
        if (note) note.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 60);
      return;
    }
    openPay(feeSelect.value);
  });
  payModal.addEventListener("click", function (ev) {
    if (ev.target.closest("[data-pay-close]")) closePay();
  });
  document.addEventListener("keydown", function (ev) {
    if (!payModal.hidden && ev.key === "Escape") closePay();
  });
  payAmount.addEventListener("input", updatePayBtn);

  payForm.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var name = $("#payStudent").value.trim();
    var email = $("#payEmail").value.trim();
    var phone = $("#payPhone").value.trim();
    var amount = parseInt(payAmount.value, 10);

    if (!name) {
      payMsg.className = "form-msg err";
      payMsg.textContent = "Please enter the student's name.";
      $("#payStudent").focus();
      return;
    }
    if (!emailOk(email)) {
      payMsg.className = "form-msg err";
      payMsg.textContent = "Please enter a valid email for your receipt.";
      $("#payEmail").focus();
      return;
    }
    if (isNaN(amount) || amount < 100) {
      payMsg.className = "form-msg err";
      payMsg.textContent = "Please enter a valid amount.";
      payAmount.focus();
      return;
    }
    if (typeof PaystackPop === "undefined" || !PAYSTACK_PUBLIC_KEY) {
      payMsg.className = "form-msg err";
      payMsg.textContent = "Online payment is not set up yet. Please pay by bank transfer — see the bill.";
      return;
    }

    payMsg.className = "form-msg";
    payMsg.textContent = "Opening secure payment…";

    var handler = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: amount * 100, // Paystack works in kobo
      currency: "NGN",
      metadata: {
        custom_fields: [
          { display_name: "Student", variable_name: "student", value: name },
          { display_name: "Class", variable_name: "class", value: payProg ? payProg.name : "" },
          { display_name: "School", variable_name: "school", value: payProg ? payProg.school.name : "" },
          { display_name: "Phone", variable_name: "phone", value: phone }
        ]
      },
      callback: function (response) {
        payMsg.className = "form-msg ok";
        payMsg.textContent = "✅ Payment successful! Reference: " + response.reference + ". A receipt has been emailed to you.";
        payForm.reset();
        updatePayBtn();
      },
      onClose: function () {
        payMsg.className = "form-msg";
        payMsg.textContent = "Payment window closed. You can try again any time.";
      }
    });
    handler.openIframe();
  });

  renderPicker();
  renderBillTable();
  renderJssTable();
  renderSssTable();
  renderTermFees();
  renderOptional();
  renderBanks();

  /* ---------------------------------------------------------
     5. Forms (front-end demo – no data leaves the browser)
     --------------------------------------------------------- */
  var emailOk = function (v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  };

  // Newsletter subscription
  var subForm = $("#subscribeForm");
  var subEmail = $("#subEmail");
  var subMsg = $("#subMsg");
  subForm.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var email = subEmail.value.trim();
    if (!emailOk(email)) {
      subMsg.className = "form-msg err";
      subMsg.textContent = "Please enter a valid email address.";
      subEmail.focus();
      return;
    }
    try {
      var saved = JSON.parse(localStorage.getItem("edana_subscribers") || "[]");
      if (saved.indexOf(email) === -1) saved.push(email);
      localStorage.setItem("edana_subscribers", JSON.stringify(saved));
    } catch (e) {
      /* storage unavailable – ignore */
    }
    subMsg.className = "form-msg ok";
    subMsg.textContent = "Thank you! " + email + " has been added to our newsletter list.";
    subForm.reset();
  });

  // Contact form
  var contactForm = $("#contactForm");
  var contactMsg = $("#contactMsg");
  contactForm.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var name = $("#cName");
    var email = $("#cEmail");
    var message = $("#cMessage");
    var bad = [];
    [name, email, message].forEach(function (f) {
      f.classList.remove("invalid");
    });
    if (!name.value.trim()) bad.push(name);
    if (!emailOk(email.value.trim())) bad.push(email);
    if (!message.value.trim()) bad.push(message);
    if (bad.length) {
      bad.forEach(function (f) {
        f.classList.add("invalid");
      });
      contactMsg.className = "form-msg err";
      contactMsg.textContent = "Please fill in your name, a valid email and a message.";
      bad[0].focus();
      return;
    }
    contactMsg.className = "form-msg ok";
    contactMsg.textContent = "Thank you, " + name.value.trim().split(" ")[0] + "! Your message has been received – we'll reply within one working day.";
    contactForm.reset();
  });
})();
