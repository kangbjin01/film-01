/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // projects 컬렉션 API Rules 열기
  const projects = app.findCollectionByNameOrId("projects");
  if (projects) {
    projects.listRule = "";
    projects.viewRule = "";
    projects.createRule = "";
    projects.updateRule = "";
    projects.deleteRule = "";
    app.save(projects);
  }

  // schedules 컬렉션 API Rules 열기
  const schedules = app.findCollectionByNameOrId("schedules");
  if (schedules) {
    schedules.listRule = "";
    schedules.viewRule = "";
    schedules.createRule = "";
    schedules.updateRule = "";
    schedules.deleteRule = "";
    app.save(schedules);
  }

  // scenes 컬렉션 API Rules 열기
  const scenes = app.findCollectionByNameOrId("scenes");
  if (scenes) {
    scenes.listRule = "";
    scenes.viewRule = "";
    scenes.createRule = "";
    scenes.updateRule = "";
    scenes.deleteRule = "";
    app.save(scenes);
  }

  // timeline 컬렉션 API Rules 열기
  const timeline = app.findCollectionByNameOrId("timeline");
  if (timeline) {
    timeline.listRule = "";
    timeline.viewRule = "";
    timeline.createRule = "";
    timeline.updateRule = "";
    timeline.deleteRule = "";
    app.save(timeline);
  }

  // staff 컬렉션 API Rules 열기
  const staff = app.findCollectionByNameOrId("staff");
  if (staff) {
    staff.listRule = "";
    staff.viewRule = "";
    staff.createRule = "";
    staff.updateRule = "";
    staff.deleteRule = "";
    app.save(staff);
  }

  // casts 컬렉션 API Rules 열기
  const casts = app.findCollectionByNameOrId("casts");
  if (casts) {
    casts.listRule = "";
    casts.viewRule = "";
    casts.createRule = "";
    casts.updateRule = "";
    casts.deleteRule = "";
    app.save(casts);
  }
}, (app) => {
  // Rollback - 다시 잠금
  const collections = ["projects", "schedules", "scenes", "timeline", "staff", "casts"];
  collections.forEach(name => {
    const col = app.findCollectionByNameOrId(name);
    if (col) {
      col.listRule = null;
      col.viewRule = null;
      col.createRule = null;
      col.updateRule = null;
      col.deleteRule = null;
      app.save(col);
    }
  });
});

