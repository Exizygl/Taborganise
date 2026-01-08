const list = document.getElementById("profiles");
const saveBtn = document.getElementById("save");


async function loadProfiles() {
  const { profiles } = await browser.storage.local.get("profiles");
  list.innerHTML = "";

  if (!profiles) return;

  Object.values(profiles).forEach(profile => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div>
        <div class="profile-name">${profile.name}</div>
        <div class="profile-meta">${profile.tabs.length} tabs</div>
      </div>
      <button data-id="${profile.id}">Open</button>
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

saveBtn.onclick = async () => {
  const name = prompt("Profile name?");
  if (!name) return;

  browser.runtime.sendMessage({
    type: "SAVE_PROFILE",
    name
  });
};

loadProfiles();
