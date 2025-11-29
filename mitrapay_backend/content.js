function scrapeIfOnViewUser() {
// content.js
function extractUsersFromTable() {
  const rows = document.querySelectorAll("table tbody tr");
  const users = [];
console.log(rows)

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    const statusButton = cells[5].querySelector("button");
    const editLink = row.querySelector('a[href*="#/editUser/"]');
    const userIdMatch = editLink?.href.match(/editUser\/([a-z0-9]+)/i);
    const userId = userIdMatch ? userIdMatch[1] : null;

    users.push({
      name: cells[0]?.innerText.trim(),
      username: cells[1]?.innerText.trim(),
      email: cells[2]?.innerText.trim(),
      phone: cells[3]?.innerText.trim(),
      credit: cells[4]?.innerText.trim(),
      status: statusButton?.innerText.trim(),
      userId,
    });
  });
console.log(users)
  // Send to background script or directly to API
  // chrome.runtime.sendMessage({ type: "USER_DATA", payload: users });
   if (users.length) {
    console.log("[EXT] Extracted transactions:", users);

    fetch('/api/auth/save-transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users }),
    })
      .then(res => console.log("[EXT] Sent to server. Status:", res.status))
      .catch(err => console.error("[EXT] Failed to send to server:", err.message));
  }
}

extractUsersFromTable();


 
}

// Run on initial load
scrapeIfOnViewUser();

// Re-run on hash change (for React SPA with hash routing)
window.addEventListener("hashchange", () => {
  console.log("[EXT] Hash changed:", window.location.hash);
  scrapeIfOnViewUser();
});
