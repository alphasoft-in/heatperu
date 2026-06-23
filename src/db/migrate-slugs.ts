import { db } from "./index.ts";
import { projects, tutorials } from "./schema.ts";
import { eq } from "drizzle-orm";

function createSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with dash
    .replace(/(^-|-$)+/g, ""); // remove leading/trailing dashes
}

async function run() {
  console.log("Migrating projects...");
  const allProjects = await db.query.projects.findMany();
  for (const project of allProjects) {
    const slug = createSlug(project.title);
    await db.update(projects).set({ slug }).where(eq(projects.id, project.id));
    console.log(`Updated project ${project.id} -> ${slug}`);
  }

  console.log("Migrating tutorials...");
  const allTutorials = await db.query.tutorials.findMany();
  for (const tutorial of allTutorials) {
    const slug = createSlug(tutorial.title);
    await db.update(tutorials).set({ slug }).where(eq(tutorials.id, tutorial.id));
    console.log(`Updated tutorial ${tutorial.id} -> ${slug}`);
  }

  console.log("Done.");
}

run().catch(console.error);
