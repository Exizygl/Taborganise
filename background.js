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
