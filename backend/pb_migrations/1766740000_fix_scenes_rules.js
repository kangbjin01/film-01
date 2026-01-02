/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // scenes 컬렉션 API Rules 다시 열기
  const scenes = app.findCollectionByNameOrId("scenes");
  if (scenes) {
    scenes.listRule = "";
    scenes.viewRule = "";
    scenes.createRule = "";
    scenes.updateRule = "";
    scenes.deleteRule = "";
    app.save(scenes);
  }
}, (app) => {
  // Rollback
  const scenes = app.findCollectionByNameOrId("scenes");
  if (scenes) {
    scenes.listRule = null;
    scenes.viewRule = null;
    scenes.createRule = null;
    scenes.updateRule = null;
    scenes.deleteRule = null;
    app.save(scenes);
  }
});





