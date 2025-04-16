    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
    import { getFirestore, collection, getDocs, setDoc, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    let jsonData = await fetchFirestoreData("users");
    let subjectJson = await fetchFirestoreData("subjects");
    console.log(jsonData);
    console.log(subjectJson);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 🔹 Subject-to-Class Level Map
const CLASS_LEVELS = {
    "Math": ["Algebra 1", "Geometry", "Algebra 2", "Precalculus", "Calculus AB", "Calculus BC", "Calculus 3"],
    "English": ["English 9", "English 10", "English 11", "English 12", "Speech"],
    "Social Studies": ["World History", "AP World History", "US History", "AP US History", "European History", "AP Microeconomics", "AP Macroeconomics", "Gov", "AP/ACP Gov"],
    "Physics": ["Physics 1", "Physics 2", "Physics C"],
    "Chemistry": ["Honors Chemistry", "AP Chemistry"],
    "Computer Science": ["CS Principles", "CS 1", "CS A"],
    "Biology": ["Honors Biology", "AP Biology"]
};

const VALID_CODES = {
    "M-A1": { subject: "Math", className: "Algebra 1", level: 0 },
    "M-GE": { subject: "Math", className: "Geometry", level: 1 },
    "M-A2": { subject: "Math", className: "Algebra 2", level: 2 },
    "M-PC": { subject: "Math", className: "Precalculus", level: 3 },
    "M-CAB": { subject: "Math", className: "Calculus AB", level: 4 },
    "M-CBC": { subject: "Math", className: "Calculus BC", level: 5 },
    "M-C3": { subject: "Math", className: "Calculus 3", level: 6 },

    "E-9": { subject: "English", className: "English 9", level: 0 },
    "E-10": { subject: "English", className: "English 10", level: 1 },
    "E-11": { subject: "English", className: "English 11", level: 2 },
    "E-12": { subject: "English", className: "English 12", level: 3 },
    "E-SP": { subject: "English", className: "Speech", level: 4 },

    "S-WH": { subject: "Social Studies", className: "World History", level: 0 },
    "S-APH": { subject: "Social Studies", className: "AP World History", level: 1 },
    "S-UH": { subject: "Social Studies", className: "US History", level: 2 },
    "S-APU": { subject: "Social Studies", className: "AP US History", level: 3 },
    "S-EH": { subject: "Social Studies", className: "European History", level: 4 },
    "S-APM": { subject: "Social Studies", className: "AP Microeconomics", level: 5 },
    "S-APMA": { subject: "Social Studies", className: "AP Macroeconomics", level: 6 },
    "S-G": { subject: "Social Studies", className: "Government", level: 7 },
    "S-APG": { subject: "Social Studies", className: "AP/ACP Government", level: 8 },

    "P-1": { subject: "Physics", className: "Physics 1", level: 0 },
    "P-2": { subject: "Physics", className: "Physics 2", level: 1 },
    "P-C": { subject: "Physics", className: "Physics C", level: 2 },

    "C-HC": { subject: "Chemistry", className: "Honors Chemistry", level: 0 },
    "C-AP": { subject: "Chemistry", className: "AP Chemistry", level: 1 },

    "CS-P": { subject: "Computer Science", className: "CS Principles", level: 0 },
    "CS-1": { subject: "Computer Science", className: "CS 1", level: 1 },
    "CS-A": { subject: "Computer Science", className: "CS A", level: 2 },

    "B-H": { subject: "Biology", className: "Honors Biology", level: 0 },
    "B-AP": { subject: "Biology", className: "AP Biology", level: 1 }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

updateName();

// 🔹 Function: Modify Visibility Based on Subject Selection
async function modifyVisibility() {
    const subject = document.getElementById("subject").value;
    const subcategoryContainer = document.getElementById("subcategory-container");
    const email = localStorage.getItem("loggedInTutor");

    subcategoryContainer.innerHTML = ""; // Clear previous content

    if (!subject || !email) {
        subcategoryContainer.innerHTML = "<p>⚠️ Please select a subject.</p>";
        return;
    }

    try {
        const tutorRef = doc(db, "users", email);
        const tutorSnap = await getDoc(tutorRef);

        if (!tutorSnap.exists()) {
            throw new Error("⚠️ Tutor account not found!");
        }

        const tutor = tutorSnap.data();
        let competency = tutor.competency[subject] || [];

        // Ensure competency array matches class list length
        const classList = CLASS_LEVELS[subject] || [];
        if (classList.length === 0) {
            subcategoryContainer.innerHTML = "<p>⚠️ No subcategories available.</p>";
            return;
        }

        /*while (competency.length < classList.length) {
            competency.push(false); // Ensure all classes have a visibility state
        }*/

        console.log("✅ Competency Data:", competency); // Debugging Log

        // Create checkboxes based on competency array
        competency.forEach((isChecked, index) => {
    const classList = CLASS_LEVELS[subject] || []; // Get subject class names
    const className = classList[index] || `Class ${index + 1}`; // Fallback name if missing

    const div = document.createElement("div");
    div.classList.add("checkbox-container"); // Add CSS class for styling

    const label = document.createElement("label");
    label.htmlFor = `class-${index}`;
    label.textContent = className; // Correctly assigns class name from CLASS_LEVELS

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `class-${index}`;
    checkbox.checked = isChecked; // Correctly assigns true/false
    checkbox.dataset.index = index;
    checkbox.classList.add("checkbox-input"); // Add CSS class for styling

    div.appendChild(label);  // ✅ Label (Class Name) First
    div.appendChild(checkbox); // ✅ Checkbox Second
    subcategoryContainer.appendChild(div);
});

        // Add Save Changes Button
        const saveButton = document.createElement("button");
        saveButton.textContent = "Save Changes";
        saveButton.onclick = () => saveVisibility(subject);
        subcategoryContainer.appendChild(saveButton);

    } catch (error) {
        console.error("❌ Error in modifyVisibility:", error);
        subcategoryContainer.innerHTML = `<p>❌ Error: ${error.message}</p>`;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 🔹 Function: Save Updated Visibility
async function saveVisibility(subject) {
    const email = localStorage.getItem("loggedInTutor");
    if (!email) {
        alert("⚠️ You must be logged in!");
        return;
    }

    const tutorRef = doc(db, "users", email);
    const tutorSnap = await getDoc(tutorRef);
    if (!tutorSnap.exists()) {
        alert("⚠️ Tutor account not found!");
        return;
    }

    const newVisibility = [];
    const checkboxes = document.querySelectorAll("#subcategory-container input[type='checkbox']");

    checkboxes.forEach((checkbox) => {
        const index = parseInt(checkbox.dataset.index);
        newVisibility[index] = checkbox.checked;
    });

    try {
        await updateDoc(tutorRef, { [`competency.${subject}`]: newVisibility });
        alert("✅ Visibility updated successfully!");
    } catch (error) {
        alert(`❌ Error updating visibility: ${error.message}`);
    }
}

function updateTutor() {
    const email = document.getElementById("account-email").innerText;
    const teacherCode = document.getElementById("teacher-code").value;

    if (!teacherCode) {
        alert("Please enter a teacher code.");
        return;
    }

    addSkill(email, teacherCode);

    // 🔹 Call a function to update tutor data in Firestore
    console.log(`Updating tutor ${email} with code: ${teacherCode}`);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 🔹 Attach Event Listener to Subject Dropdown
document.getElementById("subject")?.addEventListener("change", modifyVisibility);

// 🔹 Logout Function (Now works!)
function logout() {
    localStorage.removeItem("loggedInTutor");
    window.location.href = "manage_account.html";
}
window.logout = logout;  // Make it globally available
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
    const subjectDropdown = document.getElementById("subject");
    if (subjectDropdown) {
        subjectDropdown.addEventListener("change", modifyVisibility);
    } else {
        console.error("❌ Subject dropdown not found!");
    }
});

async function fetchFirestoreData(collectionName) {
        let dataArray = []; // Temporary array for fetched data

        try {
            const querySnapshot = await getDocs(collection(db, collectionName));
            querySnapshot.forEach((doc) => {
                dataArray.push({
                    id: doc.id, // Store Firestore document ID
                    ...doc.data() // Spread operator to include all fields
                });
            });

            //console.log(dataArray[1]); // This will log the array of data
            return dataArray; // Return the array for further use
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
}

async function addSkill(email, code) {
    console.log("Trying to update" + email + "With" + code );


    try {
        const { subject, className, level } = VALID_CODES[code];
        const tutorRef = doc(db, "users", email);
        const tutorSnap = await getDoc(tutorRef);

        if (!tutorSnap.exists()) {
            throw new Error("⚠️ Tutor account not found!");
        }

        if (!VALID_CODES[code]) {
            throw new Error("⚠️ Invalid teacher code!");
        }

        const tutor = tutorSnap.data();

        if (!tutor.competency) tutor.competency = {};
        if (!tutor.competency[subject]) tutor.competency[subject] = [];


        while (tutor.competency[subject].length < level) {
              tutor.competency[subject].push(false);  // Default competency is false
        }
        tutor.competency[subject][level] = true;


        await updateDoc(tutorRef, { competency: tutor.competency});
        alert(`✅ Skill added: Class ${level + 1} in ${subject}!`);
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
    }


}

async function updateName(){
    console.log(localStorage);
        const accountName = document.getElementById("account-name");
        const accountEmail = document.getElementById("account-email");
        const subjectDropdown = document.getElementById("subject");

        const loggedInTutor = localStorage.getItem("loggedInTutor");

        if (!loggedInTutor) {
            window.location.href = "index.html"; // Redirect if not logged in
            return;
        }

        try {
            const tutorRef = doc(db, "users", loggedInTutor);
            const tutorSnap = await getDoc(tutorRef);

            if (!tutorSnap.exists()) {
                throw new Error("Tutor data not found.");
            }

            const tutor = tutorSnap.data();

            accountName.innerText = tutor.name;
            accountEmail.innerText = loggedInTutor;

        } catch (error) {
            document.getElementById("account-message").innerText = `❌ ${error.message}`;
        }

        // Attach event listener for subject dropdown AFTER checking elements exist
        if (subjectDropdown) {
            subjectDropdown.addEventListener("change", modifyVisibility);
        } else {
            console.error("❌ Subject dropdown not found!");
        }

}



Object.assign(window, {logout, updateTutor});