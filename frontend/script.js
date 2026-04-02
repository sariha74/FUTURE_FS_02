const API = "http://localhost:5000/api/leads";


// ================= LOGIN FUNCTION =================
function login() {
  const username = document.getElementById("username")?.value;
  const password = document.getElementById("password")?.value;

  if (username === "admin" && password === "246810") {
    // store login state
    localStorage.setItem("isLoggedIn", "true");

    // redirect to dashboard
    window.location.href = "dashboard.html";
  } else {
    document.getElementById("error").innerText = "Invalid credentials";
  }
}


// ================= PROTECT DASHBOARD =================
function checkAuth() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (!isLoggedIn) {
    window.location.href = "index.html";
  }
}


// ================= FETCH LEADS =================
async function fetchLeads() {
  const table = document.getElementById("leadTable");
  if (!table) return;

  table.innerHTML = "";

  const res = await fetch(API, {
    headers: {
      "Authorization": localStorage.getItem("token")
    }
  });

  const data = await res.json();

  console.log("Fetched:", data); // debug

  // 👉 UPDATE TABLE
data.forEach(lead => {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${lead.name}</td>
    <td>${lead.email}</td>

    <td>
      <select onchange="updateStatus('${lead._id}', this.value)">
        <option value="New" ${lead.status === "New" ? "selected" : ""}>New</option>
        <option value="Contacted" ${lead.status === "Contacted" ? "selected" : ""}>Contacted</option>
        <option value="Converted" ${lead.status === "Converted" ? "selected" : ""}>Converted</option>
      </select>
    </td>

    <td>
      <input 
        value="${lead.notes || ""}" 
        placeholder="Add note..."
        onchange="updateNotes('${lead._id}', this.value)"
      >
    </td>

    <td>
      <button onclick="deleteLead('${lead._id}')">Delete</button>
    </td>
  `;

  table.appendChild(row);
});

  // 👉 UPDATE STATS (IMPORTANT)
  document.getElementById("totalLeads").innerText = data.length;

  const contacted = data.filter(l => (l.status || "New") === "Contacted").length;
  const converted = data.filter(l => (l.status || "New") === "Converted").length;

  document.getElementById("contactedLeads").innerText = contacted;
  document.getElementById("convertedLeads").innerText = converted;
}

// ================= ADD LEAD =================
async function addLead() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const source = document.getElementById("source").value.trim();

  if (!name || !email) {
    alert("Name and Email are required!");
    return;
  }

  try {
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, source })
    });

    // clear inputs
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("source").value = "";

    // refresh table
    fetchLeads();

  } catch (err) {
    console.error("Error adding lead:", err);
  }
}

// ================= UPDATE STATUS =================
async function updateStatus(id, status) {
  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": localStorage.getItem("token")
    },
    body: JSON.stringify({ status })
  });

  fetchLeads(); // 🔥 refresh table + stats
}


// ================= UPDATE NOTES =================
async function updateNotes(id, notes) {
  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": localStorage.getItem("token")
    },
    body: JSON.stringify({ notes })
  });
}

// ================= DELETE LEAD =================
async function deleteLead(id) {
  await fetch(`${API}/${id}`, { method: "DELETE" });
  fetchLeads();
}


// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "index.html";
}


// ================= AUTO RUN =================
window.onload = () => {

  // If dashboard page → protect + load leads
  if (document.getElementById("leadTable")) {
    checkAuth();
    fetchLeads();
  }

};