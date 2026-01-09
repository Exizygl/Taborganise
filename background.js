browser.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === "SAVE_PROFILE") {
    const win = await browser.windows.getCurrent({ populate: true });

    const tabs = win.tabs.map(t => ({
      url: t.url,
      title: t.title
    }));

    const { profiles = {} } = await browser.storage.local.get("profiles");

    const id = crypto.randomUUID();

    profiles[id] = {
      id,
      name: msg.name,
      tabs,
      updatedAt: Date.now()
    };

    await browser.storage.local.set({ profiles });
  }

  if (msg.type === "OPEN_PROFILE") {
    const { profiles } = await browser.storage.local.get("profiles");
    const profile = profiles[msg.profileId];

    browser.windows.create({
      url: profile.tabs.map(t => t.url)
    });
  }
});
