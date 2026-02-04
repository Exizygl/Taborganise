let linkedWindows = {};
browser.browserAction.onClicked.addListener(() => {
  browser.runtime.openOptionsPage();
});

browser.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === "SAVE_PROFILE") {
  const win = await browser.windows.getCurrent({ populate: true });
  const windowId = win.id;

  const tabs = win.tabs
    .filter(t => t.url && t.url.startsWith("http"))
    .map(t => ({
      tabId: t.id,
      url: t.url,
      title: t.title
    }));

  const { profiles = {} } = await browser.storage.local.get("profiles");
  const id = crypto.randomUUID();

  profiles[id] = {
    id,
    name: msg.name,
    windowId,
    tabs,
    updatedAt: Date.now()
  };

  linkedWindows[windowId] = id;

  await browser.storage.local.set({ profiles });
}


if (msg.type === "OPEN_PROFILE") {
  const { profiles } = await browser.storage.local.get("profiles");
  const profile = profiles[msg.profileId];

  const urls = profile.tabs
    .map(t => t.url)
    .filter(url => url && url.startsWith("http"));

  const win = await browser.windows.create({ url: urls });

  linkedWindows[win.id] = profile.id;

  
  profile.windowId = win.id;
  await browser.storage.local.set({ profiles });
}
});

browser.tabs.onCreated.addListener(async (tab) => {
  const profileId = linkedWindows[tab.windowId];
  if (!profileId) return;

  const { profiles = {} } = await browser.storage.local.get("profiles");
  const profile = profiles[profileId];
  if (!profile) return;

  profile.tabs.push({
    tabId: tab.id,
    url: tab.url,
    title: tab.title
  });

  profile.updatedAt = Date.now();
  await browser.storage.local.set({ profiles });
});

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const profileId = linkedWindows[tab.windowId];
  if (!profileId) return;

  if (
    !changeInfo.url &&
    !changeInfo.title &&
    changeInfo.status !== "complete"
  ) return;

  const { profiles = {} } = await browser.storage.local.get("profiles");
  const profile = profiles[profileId];
  if (!profile) return;

  const entry = profile.tabs.find(t => t.tabId === tabId);
  if (!entry) return;

  entry.url = tab.url;
  entry.title = tab.title;

  profile.updatedAt = Date.now();
  await browser.storage.local.set({ profiles });

  console.log("🔄 Tab synced", tabId, tab.url);
});

if (msg.type === "EXPORT_DATA") {
  const data = await browser.storage.local.get([
    "profiles",
    "favoriteProfileId"
  ]);

  return {
    version: 1,
    exportedAt: Date.now(),
    profiles: data.profiles || {},
    favoriteProfileId: data.favoriteProfileId || null
  };
}
