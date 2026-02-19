const list = document.getElementById("profiles");
const createBtn = document.getElementById("create");

async function loadProfiles() {
  list.innerHTML = "";

  const { profiles = {} } = await browser.storage.local.get("profiles");

  Object.values(profiles).forEach(profile => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="profile-info">
        <span class="profile-name">${profile.name}</span>
        <span class="profile-meta">
          ${profile.tabs.length} tabs •
          ${profile.windowId ? "Active" : "Inactive"}
        </span>
      </div>
      <button>Open</button>
    `;

    li.querySelector("button").onclick = () => {
      browser.runtime.sendMessage({
        type: "OPEN_PROFILE",
        profileId: profile.id
      });
    };

    list.appendChild(li);
  });
}

createBtn.onclick = async () => {
  const name = prompt("Profile name?");
  if (!name) return;

  await browser.runtime.sendMessage({
    type: "SAVE_PROFILE",
    name
  });

  loadProfiles();
};


document.getElementById("export").addEventListener("click", async () => {
  const data = await browser.runtime.sendMessage({
    type: "EXPORT_DATA"
  });

  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "window-profiles.json";
  a.click();

  URL.revokeObjectURL(url);
});

document.getElementById("import").addEventListener("click", async () => {
  const fileInput = document.getElementById("importFile");
  const file = fileInput.files[0];
  if (!file) return;

  const text = await file.text();
  const data = JSON.parse(text);

  await browser.runtime.sendMessage({
    type: "IMPORT_DATA",
    data
  });

  alert("Import successful!");
  location.reload();
});

loadProfiles();
