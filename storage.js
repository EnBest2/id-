// LocalStorage adatkezelő modul

const Storage = {
  // Felhasználó e-mail címének beállítása
  saveUserEmail: function(email) {
    localStorage.setItem("userEmail", email);
  },

  // Felhasználó e-mail címének lekérdezése
  getUserEmail: function() {
    return localStorage.getItem("userEmail");
  },

  // Tananyagok lekérése (tömbként)
  getMaterials: function() {
    const data = localStorage.getItem("materials");
    return data ? JSON.parse(data) : [];
  },

  // Tananyagok mentése
  saveMaterials: function(materials) {
    localStorage.setItem("materials", JSON.stringify(materials));
  },

  // Új tananyag hozzáadása
  addMaterial: function(material) {
    const materials = this.getMaterials();
    materials.push(material);
    this.saveMaterials(materials);
  },

  // Exportálás esetén a felhasználó e-mail címét és a tananyagokat is egy objektumba tesszük
  getAllData: function() {
    return {
      userEmail: this.getUserEmail(),
      materials: this.getMaterials()
    };
  }
};
