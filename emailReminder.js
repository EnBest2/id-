/**
 * Konfiguráld a környezeti változókat vagy cseréld ki a következő értékeket a saját SMTP beállításaidnak megfelelően.
 */
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Az exportált adatfájl elérési útja (a frontenden a "materials.json" file)
const DATA_FILE = path.join(__dirname, 'materials.json');

// Olvassuk be az exportált adatokat
function getData() {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } else {
    console.error("Nincs 'materials.json' fájl az exportált adatokkal.");
    return null;
  }
}

// Ellenőrizzük, hogy mely tananyagok ismétlése esedékes ma
function getTodaysRepetitions(data) {
  const today = new Date().toISOString().split("T")[0];
  const dueMaterials = [];

  data.materials.forEach(mat => {
    mat.repetitions.forEach(rep => {
      if (!rep.completed && rep.dueDate === today) {
        dueMaterials.push(mat.title + " (" + rep.dueDate + ")");
      }
    });
  });
  return dueMaterials;
}

// Küldünk e-mailt Nodemailer-rel
async function sendReminder(email, dueMaterials) {
  // SMTP konfiguráció (például Gmail, Mailtrap, stb.)
  let transporter = nodemailer.createTransport({
    host: "smtp.example.com", // cseréld ki a megfelelő SMTP szerverre
    port: 587,
    secure: false,
    auth: {
      user: "your_smtp_user",
      pass: "your_smtp_password"
    }
  });

  let mailOptions = {
    from: '"Ismétlési Ütemező" <noreply@ismetlodes.hu>',
    to: email,
    subject: "Ismétlés esedékes ma!",
    text: generateEmailText(dueMaterials)
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("E-mail elküldve: %s", info.messageId);
  } catch (err) {
    console.error("Hiba az e-mail küldésekor:", err);
  }
}

// E-mail szöveg összeállítása
function generateEmailText(dueMaterials) {
  let text = "Ma ismételd át a következő anyagokat:\n\n";
  dueMaterials.forEach(item => {
    text += "- " + item + "\n";
  });
  text += "\nÜdvözlettel:\nIsmétlési Ütemező app";
  return text;
}

// Fő futási logika
function main() {
  const data = getData();
  if (!data) return;

  const dueMaterials = getTodaysRepetitions(data);
  if (dueMaterials.length === 0) {
    console.log("Ma nincs esedékes ismétlés.");
    return;
  }

  // Küldés a tárolt e-mail címre (az exportált adatokból)
  if (data.userEmail) {
    sendReminder(data.userEmail, dueMaterials);
  } else {
    console.error("Nincs felhasználói e-mail cím az exportált adatokban.");
  }
}

main();
