// Az alkalmazás fő logikája

document.addEventListener("DOMContentLoaded", () => {
  // Ellenőrizzük, hogy meg van-e adva az e-mail cím
  if (!Storage.getUserEmail()) {
    document.getElementById("emailModal").classList.remove("hidden");
  } else {
    renderMaterials();
    renderStats();
  }

  // E-mail mentése gomb
  document.getElementById("saveEmailBtn").addEventListener("click", () => {
    const email = document.getElementById("userEmail").value.trim();
    if (email) {
      Storage.saveUserEmail(email);
      document.getElementById("emailModal").classList.add("hidden");
      renderMaterials();
      renderStats();
    } else {
      alert("Kérjük, adj meg egy érvényes e-mail címet!");
    }
  });

  // Gyors hozzáadás form submit
  document.getElementById("quickAddForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("quickTitle").value.trim();
    if (title) {
      // Alapértelmezett értékek
      const newMaterial = {
        id: Date.now(),
        title: title,
        category: "Általános",
        note: "",
        startDate: new Date().toISOString().split("T")[0],
        repetitions: generateRepetitions(new Date())
      };
      Storage.addMaterial(newMaterial);
      document.getElementById("quickTitle").value = "";
      renderMaterials();
      renderStats();
    }
  });

  // Teljes hozzáadás form submit
  document.getElementById("fullAddForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value.trim();
    const category = document.getElementById("category").value.trim() || "Általános";
    const note = document.getElementById("note").value.trim();
    const startDate = document.getElementById("startDate").value || new Date().toISOString().split("T")[0];
    if (title) {
      const newMaterial = {
        id: Date.now(),
        title: title,
        category: category,
        note: note,
        startDate: startDate,
        repetitions: generateRepetitions(new Date(startDate))
      };
      Storage.addMaterial(newMaterial);
      e.target.reset();
      renderMaterials();
      renderStats();
    } else {
      alert("A tananyag címe kötelező!");
    }
  });

  // Exportálás gomb
  document.getElementById("exportBtn").addEventListener("click", () => {
    const data = Storage.getAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "materials.json";
    link.click();
    URL.revokeObjectURL(url);
  });

  // Dark/Light mód váltás
  document.getElementById("toggleMode").addEventListener("click", () => {
    document.getElementById("body").classList.toggle("dark");
  });
});

// Generáljuk az ismétlési dátumokat az adott kezdő dátum alapján (1, 3, 7, 14, 30 nap)
function generateRepetitions(startDate) {
  const intervals = [1, 3, 7, 14, 30];
  return intervals.map(days => {
    const due = new Date(startDate);
    due.setDate(due.getDate() + days);
    return {
      dueDate: due.toISOString().split("T")[0],
      completed: false
    };
  });
}

// Lekérdezzük és rendereljük a tananyagokat a három kategóriába
function renderMaterials() {
  const materials = Storage.getMaterials();
  const today = new Date().toISOString().split("T")[0];
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrow = tomorrowObj.toISOString().split("T")[0];

  // Ürítjük a listákat
  document.getElementById("todayList").innerHTML = "";
  document.getElementById("tomorrowList").innerHTML = "";
  document.getElementById("overdueList").innerHTML = "";

  materials.forEach(material => {
    material.repetitions.forEach((rep, repIndex) => {
      if (!rep.completed) {
        let listId = "";
        if (rep.dueDate === today) listId = "todayList";
        else if (rep.dueDate === tomorrow) listId = "tomorrowList";
        else if (rep.dueDate < today) listId = "overdueList";

        if (listId) {
          const li = document.createElement("li");
          li.className = "p-2 border-b flex justify-between items-center";
          li.innerHTML = `<span>${material.title} (${rep.dueDate})</span>
            <button class="bg-green-500 text-white px-2 py-1 rounded" title="Jelöld késznek" data-material="${material.id}" data-rep="${repIndex}">Kész</button>`;
          document.getElementById(listId).appendChild(li);
        }
      }
    });
  });
}

// Megjelölés késznek kattintásra
document.addEventListener("click", (e) => {
  if (e.target && e.target.tagName === "BUTTON" && e.target.hasAttribute("data-material")) {
    const materialId = parseInt(e.target.getAttribute("data-material"));
    const repIndex = parseInt(e.target.getAttribute("data-rep"));
    const materials = Storage.getMaterials();
    const material = materials.find(m => m.id === materialId);
    if (material) {
      material.repetitions[repIndex].completed = true;
      Storage.saveMaterials(materials);
      // Zöld pipa animáció beillesztése a gomb helyén
      const check = document.createElement("span");
      check.className = "checkmark";
      e.target.parentNode.replaceChild(check, e.target);
      renderStats();
    }
  }
});

// Számszerű statisztikák frissítése
function renderStats() {
  const materials = Storage.getMaterials();
  let total = 0, done = 0;
  materials.forEach(mat => {
    mat.repetitions.forEach(rep => {
      total++;
      if (rep.completed) done++;
    });
  });
  document.getElementById("stats").innerText = `Összes ismétlés: ${total}, Kész: ${done}`;
}
