/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
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
  // Rollback
  const collections = ["staff", "casts"];
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





