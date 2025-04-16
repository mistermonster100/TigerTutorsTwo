
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
    import { getFirestore, collection, getDocs, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 🔹 Subject-to-Class Level Map (Replace this with your actual mapping)
const CLASS_LEVELS = {
    "Math": ["Algebra 1", "Geometry", "Algebra 2", "Precalculus", "Calculus AB", "Calculus BC", "Calculus 3"],
    "English": ["English 9", "English 10", "English 11", "English 12", "Speech"],
    "Social Studies": ["World History", "AP World History", "US History", "AP US History", "European History", "AP Microeconomics", "AP Macroeconomics"],
    "Physics": ["Physics 1", "Physics 2", "Physics C"],
    "Chemistry": ["Honors Chemistry", "AP Chemistry"],
    "Computer Science": ["CS Principles", "CS 1", "CS A"],
    "Biology": ["Honors Biology", "AP Biology"]
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 🔹 Find Tutors Function
async function findTutors() {
    const subject = document.getElementById("subject").value;
    const subcategory = document.getElementById("subcategory").value;
    const resultsDiv = document.getElementById("results");

    resultsDiv.innerHTML = ""; // Clear previous results

    if (!subject || !subcategory) {
        resultsDiv.innerHTML = "<p>⚠️ Please select both a subject and a class.</p>";
        return;
    }

    try {
        const tutorsRef = collection(db, "users");
        const querySnapshot = await getDocs(tutorsRef);

        let availableTutors = [];

        querySnapshot.forEach((doc) => {
            const tutor = doc.data();

            // Ensure the subject exists in the tutor's competency map
            if (tutor.competency && tutor.competency[subject]) {
                const classIndex = CLASS_LEVELS[subject].indexOf(subcategory);

                // Check if the tutor has the required level set to `true`
                if (classIndex !== -1 && tutor.competency[subject][classIndex]) {
                    availableTutors.push(tutor);
                }
            }
        });

        // Display Results
        if (availableTutors.length === 0) {
            resultsDiv.innerHTML = `<p>No tutors found for ${subcategory}.</p>`;
        } else {
            resultsDiv.innerHTML = availableTutors.map(tutor => `
                <div class="tutor">
                    <strong>${tutor.name}</strong><br>
                    <strong>Qualified Classes:</strong> ${CLASS_LEVELS[subject].filter((_, i) => tutor.competency[subject][i]).join(", ")}<br>
                    Email: <a href="mailto:${tutor.email}">${tutor.email}</a><br>
                    Phone: ${tutor.phone || "N/A"}
                </div>
            `).join("");
        }
    } catch (error) {
        resultsDiv.innerHTML = `<p>❌ Error fetching tutors: ${error.message}</p>`;
    }
}

// 🔹 Attach function to button
document.getElementById("findTutorsBtn")?.addEventListener("click", findTutors);

    function displayTutorClasses(tutor, subject, subjectIndex) {
        const tutorProficiency = parseInt(tutor.competency[subjectIndex]); // Tutor's proficiency level
        const subjectObj = subjectJson.find(item => item.id === subject);
        const classesQualified = subjectObj ? subjectObj.classes.slice(0, tutorProficiency) : [];// All classes up to their level

        return `
            <div class="tutor">
                <strong>${tutor.name}</strong><br>
                <strong>Qualified Classes:</strong> ${classesQualified.join(", ")}<br>
                Email: <a href="mailto:${tutor.email}">${tutor.email}</a><br>
                Phone: ${tutor.phone || "N/A"}
            </div>
        `;
    }

    function convertArrayToObject(array) {
        let result = {};
        array.forEach(item => {
            result[item.id] = item.classes;
        });
        return result;
    }

    function updateSubcategories() {
                //console.log("updateSubcategories is working");
                let subjectObject = convertArrayToObject(subjectJson);

                const subject = document.getElementById("subject").value;
                const subcategorySelect = document.getElementById("subcategory");
                subcategorySelect.innerHTML = '';

                if (subject && subjectObject[subject]) {
                    subcategorySelect.style.display = "block";
                    subjectObject[subject].forEach(sub => {
                        let option = document.createElement("option");
                        option.value = sub;
                        option.textContent = sub;
                        subcategorySelect.appendChild(option);
                    });
                } else {
                    subcategorySelect.style.display = "none";
                }
    }

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

    Object.assign(window, {updateSubcategories, findTutors});
    export {fetchFirestoreData};