import { validateCopperGraph } from "../src/data/validate-graph.ts";

const issues = validateCopperGraph();
if (issues.length) {
  console.error(issues.map((issue) => `${issue.path}: ${issue.message}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("Copper knowledge graph is valid: no duplicate IDs/slugs or broken references.");
}
