// 1) Firebase SDK imports & init
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

// 🔹 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDjSRPgwoeNdSnRleq85mS_mqmV9Tdrkzs",
  authDomain: "tiger-tutors.firebaseapp.com",
  projectId: "tiger-tutors",
  storageBucket: "tiger-tutors.firebasestorage.app",
  messagingSenderId: "343214157028",
  appId: "1:343214157028:web:9bf5d0453068e95ddf90f1",
  measurementId: "G-3ZMT5ERRFR"
};

// Initialize
const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

// 2) Teacher‑code map for verification
const teacherMap = {
  "ABC123": "Mr. Thompson",
  "XYZ789": "Ms. Jenkins",
  "MNO456": "Dr. Ray"
};

// 3) References to DOM
const form        = document.getElementById("serviceHoursForm");
const msgEl       = document.getElementById("form-message");
const hoursListEl = document.getElementById("hoursList");

let currentUser = null;

// 4) Watch auth state, then fetch existing entries
onAuthStateChanged(auth, user => {
  currentUser = user;
  if (user) {
    fetchAndRenderEntries();
    form.querySelector("button[type=submit]").disabled = false;
  } else {
    msgEl.textContent = "Please log in first.";
    msgEl.style.color = "red";
    form.querySelector("button[type=submit]").disabled = true;
    hoursListEl.innerHTML = "";
  }
});

// 5) Form submission: only reset after successful write
form.addEventListener("submit", async e => {
  e.preventDefault();
  msgEl.textContent = "";

  if (!currentUser) {
    msgEl.textContent = "User not authenticated.";
    msgEl.style.color = "red";
    return;
  }

  const date         = form.date.value;
  const hours        = parseFloat(form.hours.value);
  const description  = form.description.value.trim();
  const teacher_code = form.teacher_code.value.trim();
  const verified     = teacher_code && teacherMap.hasOwnProperty(teacher_code);

  const entry = {
    date,
    hours,
    description,
    teacher_code,
    verified,
    timestamp: new Date()
  };

  try {
    const docRef = await addDoc(
      collection(db, "users", currentUser.uid, "service_hours"),
      entry
    );
    console.log("New service_hours doc ID:", docRef.id);
    msgEl.textContent = "✅ Hours logged successfully!";
    msgEl.style.color = "green";

    form.reset();               // <— only here, after success
    fetchAndRenderEntries();    // <— refresh the list
  } catch (err) {
    console.error("Error writing service hours:", err);
    msgEl.textContent = "⚠️ Failed to log hours.";
    msgEl.style.color = "red";
  }
});

// 6) Fetch & display all your past entries
async function fetchAndRenderEntries() {
  if (!currentUser) return;

  const colRef = collection(db, "users", currentUser.uid, "service_hours");
  const q      = query(colRef, orderBy("timestamp", "desc"));
  const snap   = await getDocs(q);

  hoursListEl.innerHTML = "";
  snap.forEach(doc => {
    const data = doc.data();
    const li = document.createElement("li");
    li.textContent = `${data.date} — ${data.hours} hrs 
      [${data.verified ? "Verified" : "Unverified"}] 
      ${data.description ? "– " + data.description : ""}`;
    hoursListEl.appendChild(li);
  });
}
