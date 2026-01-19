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

loadProfiles();
