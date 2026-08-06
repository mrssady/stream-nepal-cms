#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const [, , type, name] = process.argv;

if (!type || !name) {
  console.log("\nUsage:");
  console.log("pnpm gen module sponsors");
  process.exit(1);
}

const root = path.join(__dirname, "../frontend/src");

const pascal = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log("📁", dir);
  }
}

function ensureFile(file, content) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, content);
    console.log("📄", file);
  } else {
    console.log("⏭", file);
  }
}

if (type === "module") {
  ensureDir(path.join(root, "app", name));
  ensureDir(path.join(root, "components", name));

  ensureFile(
    path.join(root, "app", name, "page.tsx"),
`export default function ${pascal(name)}Page() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">${pascal(name)}</h1>
    </div>
  );
}
`
  );

  ensureFile(
    path.join(root, "components", name, `${pascal(name)}Table.tsx`),
`export default function ${pascal(name)}Table() {
  return <div>${pascal(name)} Table</div>;
}
`
  );

  ensureFile(
    path.join(root, "components", name, `${pascal(name)}Form.tsx`),
`export default function ${pascal(name)}Form() {
  return <div>${pascal(name)} Form</div>;
}
`
  );

  ensureFile(
    path.join(root, "services", `${name}.ts`),
`export {};
`
  );

  ensureFile(
    path.join(root, "hooks", `use${pascal(name)}.ts`),
`export {};
`
  );

  ensureFile(
    path.join(root, "types", `${name}.ts`),
`export interface ${pascal(name)} {}
`
  );

  console.log("\n✅ Module generated successfully.");
}