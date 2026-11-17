async function loadSharedGlobal(modulePath, globalName) {
  const moduleNamespace = await import(modulePath);
  const resolved =
    moduleNamespace && Object.prototype.hasOwnProperty.call(moduleNamespace, "default")
      ? moduleNamespace.default
      : globalThis[globalName];
  if (typeof resolved !== "undefined") {
    globalThis[globalName] = resolved;
  }
  return globalThis[globalName];
}

async function bootstrapClient() {
  await loadSharedGlobal("./shared/protocol.js", "Open2dProtocol");
  await loadSharedGlobal("./shared/protocol-codecs.js", "Open2dProtocolCodecs");
  await loadSharedGlobal("./shared/ability-id-hash.js", "Open2dAbilityIdHash");
  await loadSharedGlobal("./shared/ability-visuals.js", "Open2dAbilityVisualRegistry");
  await loadSharedGlobal("./shared/vector-utils.js", "Open2dVectorUtils");
  await loadSharedGlobal("./shared/number-utils.js", "Open2dNumberUtils");
  await loadSharedGlobal("./shared/object-utils.js", "Open2dObjectUtils");
  await loadSharedGlobal("./shared/ability-stats.js", "Open2dAbilityStats");
  await loadSharedGlobal("./shared/summon-layout.js", "Open2dSummonLayout");
  await loadSharedGlobal("./shared/town-layout.js", "Open2dTownLayout");
  await loadSharedGlobal("./shared/item-value.js", "Open2dItemValue");
  await loadSharedGlobal("./shared/ability-normalization.js", "Open2dAbilityNormalization");
  await loadSharedGlobal("./shared/humanoid-style.js", "Open2dHumanoidStyle");
  await loadSharedGlobal("./shared/mob-render-style.js", "Open2dMobRenderStyle");

  const clientModuleLoaders = [
    () => import("./client/canvas-coordinates.js"),
    () => import("./client/config-bootstrap.js"),
    () => import("./client/network-packets.js"),
    () => import("./client/network-session.js"),
    () => import("./client/render-state.js"),
    () => import("./client/world-view-models.js"),
    () => import("./client/audio-spatial.js"),
    () => import("./client/ui-panels.js"),
    () => import("./client/ui-presentation.js"),
    () => import("./client/ui-quests.js"),
    () => import("./client/quest-runtime.js"),
    () => import("./client/player-controls.js"),
    () => import("./client/ability-runtime.js"),
    () => import("./client/ui-actions.js"),
    () => import("./client/vfx-runtime.js"),
    () => import("./client/particle-system.js"),
    () => import("./client/render-humanoids.js"),
    () => import("./client/render-mobs.js"),
    () => import("./client/render-players.js"),
    () => import("./client/render-projectiles.js"),
    () => import("./client/canvas-background-cache.js"),
    () => import("./client/canvas-world-renderer.js"),
    () => import("./client/pixi-particle-system.js"),
    () => import("./client/pixi-world-renderer.js"),
    () => import("./client/renderer-bootstrap.js"),
    () => import("./client/render-loop.js"),
    () => import("./client/input-bootstrap.js"),
    () => import("./client/automation-tools.js"),
    () => import("./client/app-bootstrap.js"),
    () => import("./client.js")
  ];

  for (const loadModule of clientModuleLoaders) {
    await loadModule();
  }
}

bootstrapClient().catch((error) => {
  console.error("[client-entry] Failed to bootstrap client:", error);
});
