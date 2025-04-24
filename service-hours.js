// 1) Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 2) Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDjSRPgwoeNdSnRleq85mS_mqmV9Tdrkzs",
  authDomain: "tiger-tutors.firebaseapp.com",
  projectId: "tiger-tutors",
  storageBucket: "tiger-tutors.firebasestorage.app",
  messagingSenderId: "343214157028",
  appId: "1:343214157028:web:9bf5d0453068e95ddf90f1",
  measurementId: "G-3ZMT5ERRFR"
};

// 3) Initialize Firebase
const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

// 4) Simple teacher code map
const teacherMap = {
  "ABC123": "Mr. Thompson",
  "XYZ789": "Ms. Jenkins",
  "MNO456": "Dr. Ray"
};

// 5) DOM references
const form       = document.getElementById("serviceHoursForm");
const msgEl      = document.getElementById("formMessage");
const listEl     = document.getElementById("hoursList");
const dateInput  = document.getElementById("dateInput");
const hoursInput = document.getElementById("hoursInput");
const descInput  = document.getElementById("descInput");
const codeInput  = document.getElementById("codeInput");

let currentUser = null;

// 6) Watch auth; only once we know the user do we enable the form & fetch entries
onAuthStateChanged(auth, user => {
  console.log(localStorage);
  currentUser = localStorage.getItem("loggedInTutor");
  if (currentUser) {
    form.querySelector("button[type=submit]").disabled = false;
    fetchAndDisplay();
  } else {
    form.querySelector("button[type=submit]").disabled = true;
    msgEl.textContent = "⚠️ Please log in first.";
    msgEl.style.color = "red";
    listEl.innerHTML = "";
  }
});

// 7) Form submission handler
form.addEventListener("submit", async e => {
  e.preventDefault();
  msgEl.textContent = "";

  if (!currentUser) {
    msgEl.textContent = "⚠️ You must be logged in.";
    msgEl.style.color = "red";
    return;
  }

  // Gather values
  const date         = dateInput.value;
  const hours        = parseFloat(hoursInput.value);
  const description  = descInput.value.trim();
  const teacher_code = codeInput.value.trim();
  const verified     = teacher_code && teacherMap.hasOwnProperty(teacher_code);

  // Build the entry
  const entry = { date, hours, description, teacher_code, verified, timestamp: new Date() };

  try {
    await addDoc(
      collection(db, "users", currentUser.uid, "service_hours"),
      entry
    );
    msgEl.textContent = "✅ Logged successfully";
    msgEl.style.color = "green";
    form.reset();
    fetchAndDisplay();
  } catch (err) {
    console.error("Firestore write error:", err);
    msgEl.textContent = "⚠️ Failed to log";
    msgEl.style.color = "red";
  }
});

// 8) Fetch + render all past entries
async function fetchAndDisplay() {
  if (!currentUser) return;

  const colRef = collection(db, "users", currentUser.uid, "service_hours");
  const q      = query(colRef, orderBy("timestamp", "desc"));
  const snap   = await getDocs(q);

  listEl.innerHTML = "";
  snap.forEach(doc => {
    const d = doc.data();
    const li = document.createElement("li");
    li.textContent = `${d.date} — ${d.hours} hr${d.hours !== 1 ? "s" : ""} ` +
      `[${d.verified ? "Verified" : "Unverified"}]` +
      (d.description ? ` • ${d.description}` : "");
    listEl.appendChild(li);
  });
}
