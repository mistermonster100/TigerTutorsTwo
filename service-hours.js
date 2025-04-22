// 1) Firebase SDK imports & init
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 🔹 Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDjSRPgwoeNdSnRleq85mS_mqmV9Tdrkzs",
  authDomain: "tiger-tutors.firebaseapp.com",
  projectId: "tiger-tutors",
  storageBucket: "tiger-tutors.firebasestorage.app",
  messagingSenderId: "343214157028",
  appId: "1:343214157028:web:9bf5d0453068e95ddf90f1",
  measurementId: "G-3ZMT5ERRFR"
};

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

// 2) Teacher‑code map for verification
const teacherMap = {
  "ABC123": "Mr. Thompson",
  "XYZ789": "Ms. Jenkins",
  "MNO456": "Dr. Ray"
};

// 3) On load: ensure user is logged in, wire up form
window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("serviceHoursForm");
  const messageEl = document.getElementById("form-message");

  // Redirect if not logged in
  onAuthStateChanged(auth, user => {
    if (!user) {
      messageEl.textContent = "Please log in first.";
      messageEl.style.color = "red";
      form.querySelector("button[type=submit]").disabled = true;
    }
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    messageEl.textContent = "";

    const user = auth.currentUser;
    if (!user) {
      messageEl.textContent = "User not authenticated.";
      messageEl.style.color = "red";
      return;
    }

    // Gather form values
    const date         = form.date.value;
    const hours        = parseFloat(form.hours.value);
    const description  = form.description.value.trim();
    const teacher_code = form.teacher_code.value.trim();

    // Verify code
    const verified = teacher_code && teacherMap.hasOwnProperty(teacher_code);

    const entry = {
      date,
      hours,
      description,
      teacher_code,
      verified,
      timestamp: new Date()
    };

    try {
      await addDoc(
        collection(db, "users", user.uid, "service_hours"),
        entry
      );
      messageEl.textContent = "✅ Hours logged successfully!";
      messageEl.style.color = "green";
      form.reset();
    } catch (err) {
      console.error("Error logging hours:", err);
      messageEl.textContent = "⚠️ Failed to log hours.";
      messageEl.style.color = "red";
    }
  });
});
