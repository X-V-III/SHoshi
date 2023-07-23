$(document).ready(function () {
  let mode = "CONCISE";

  // Fest banner;
  const threeStarChance = 0.06; // 6% for any 3 star
  const mikaChance = 0.007; // 0.7% for Mika
  const shoshiChance = 0.003; // 0.3% for Shoshi
  const wakamoChance = 0.003; // 0.3% for Wakamo

  let pullsTotal = 0;
  let pyroxeneSpent = 0;
  let totalMikas = 0;
  let totalShoshi = 0;
  let totalWakamo = 0;
  let totalOtherThreeStars = 0;

  let inProcess = false;
  let last10Pull = undefined;

  function updateInfo() {
    $("#totalWakamo").html("Wakamo: " + totalWakamo);
    $("#totalMikas").html("Mika: " + totalMikas);
    $("#totalShoshi").html("SHoshi: " + totalShoshi);

    $("#totalOther").html("Others: " + totalOtherThreeStars);
    $("#infoPulls").html("Pulls: " + pullsTotal);
    $("#infoPyro").html("Pyroxene spent: " + pyroxeneSpent);
  }

  function switchDisplayMode() {
    $("#pullsContainerConcise").toggleClass("hidden");
    $("#pullsContainerFancy").toggleClass("hidden");
    $("#button-switch-modes").html(
      mode === "CONCISE" ? "FANCY (Q)" : "CONCISE (Q)"
    );
    if (mode === "CONCISE") show10Pull(last10Pull, false);
    mode = mode === "CONCISE" ? "FANCY" : "CONCISE";
  }

  function addListItem(pullData) {
    const node = document.createElement("li");

    const { pulls, pullRange, threeStar, hoshi, mika, wakamo } = pullData;

    node.addEventListener("mouseenter", function () {
      $("#details").html("");
      $("#details").append($(`<li>Pull range: ${pullRange}</li>`));
      $("#details").append($(`<li>Pulls: ${pulls.join(" ")}</li>`));
      $("#details").append($(`<li>Three stars: ${threeStar}</li>`));
      $("#details").append($(`<li>SHoshino drops: ${hoshi}</li>`));
      $("#details").append($(`<li>Mika drops: ${mika}</li>`));
    });

    node.addEventListener("mouseout", function () {
      $("#details").html("");
    });

    if (hoshi && !mika && !wakamo) {
      node.classList.add("hoshiSuccess");
    } else if (!hoshi && mika && !wakamo) {
      node.classList.add("mikaSuccess");
    } else if (!hoshi && !mika && wakamo) {
      node.classList.add("wakamoSuccess");
    } else if ((hoshi && mika) || (hoshi && wakamo) || (mika && wakamo)) {
      node.classList.add("bothSuccess");
    }
    node.innerHTML = "\t\t" + pulls.join(" ");
    document.getElementById("pulls").prepend(node);

    // TODO rewrite with css animations
    // Triggering reflow to restart the transition
    void node.offsetWidth;

    node.style.transform = "scale(1)";
    node.style.opacity = "1";
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function show10Pull(pullData, useAnimation = true) {
    $("#fancy-pulls").html("");
    if (!pullData) return;
    for (let i = 0; i < pullData["pulls"].length; i++) {
      let card = $("<div class='card'></div>");
      switch (pullData["pulls"][i]) {
        case "★":
          card.addClass("normal");
          card.html("★★★");
          break;
        case "H":
          card.addClass("shoshi");
          card.html("SHoshi");
          break;
        case "M":
          card.addClass("mika");
          card.html("Mika");
          break;
        case "W":
          card.addClass("wakamo");
          card.html("Wakamo");
          break;
        default:
          card.html(":(");
      }
      $("#fancy-pulls").append(card);
      if (useAnimation) {
        await delay(120);
      }
    }
  }

  async function handleTenPull() {
    if (inProcess) return;

    inProcess = true;

    let threeStar = 0;
    let hoshi = 0;
    let mika = 0;
    let wakamo = 0;

    pullsTotal += 10;
    pyroxeneSpent += 1200;

    let pullData = {
      pulls: [],
    };

    for (let i = 0; i < 10; i++) {
      const randomValue = Math.random();
      if (randomValue < threeStarChance) {
        if (randomValue < mikaChance) {
          mika += 1;
          totalMikas += 1;
          pullData["pulls"].push("M");
        } else if (randomValue < mikaChance + shoshiChance) {
          hoshi += 1;
          totalShoshi += 1;
          pullData["pulls"].push("H");
        } else if (randomValue < mikaChance + shoshiChance + wakamoChance) {
          wakamo += 1;
          totalWakamo += 1;
          pullData["pulls"].push("W");
        } else {
          threeStar += 1;
          totalOtherThreeStars += 1;
          pullData["pulls"].push("★");
        }
      } else {
        pullData["pulls"].push("•");
      }
    }

    pullData = {
      ...pullData,
      pullRange: pullsTotal - 10 + "-" + pullsTotal,
      threeStar: threeStar,
      hoshi: hoshi,
      mika: mika,
      wakamo: wakamo,
    };

    addListItem(pullData);
    last10Pull = pullData;

    if (mode === "FANCY") {
      await show10Pull(pullData);
    }

    updateInfo();

    inProcess = false;
  }

  function handleReset() {
    $("#pulls").html("");
    $("#details").html("");
    $("#fancy-pulls").html("");

    pullsTotal = 0;
    pyroxeneSpent = 0;
    totalMikas = 0;
    totalShoshi = 0;
    totalWakamo = 0;
    totalOtherThreeStars = 0;

    last10Pull = undefined;

    updateInfo();
  }

  const button = document.getElementById("pull10x");
  const reset = document.getElementById("reset");

  document.addEventListener(
    "keypress",
    function (e) {
      if (e.key === "w" || e.key === "W") {
        handleTenPull();
      }
      if (e.key === "s" || e.key === "S") {
        handleReset();
      }
      if (e.key === "a" || e.key === "A") {
        for (let i = 0; i < 20; i++) handleTenPull();
      }
      if (e.key === "d" || e.key === "D") {
        for (let i = 0; i < 10; i++) handleTenPull();
      }
      if (e.key === "q" || e.key === "Q") {
        switchDisplayMode();
      }
    },
    false
  );

  button.addEventListener("click", handleTenPull);
  reset.addEventListener("click", handleReset);
  $("#button-switch-modes").on("click", switchDisplayMode);
  updateInfo(pullsTotal, pyroxeneSpent, totalMikas, totalShoshi);
});
