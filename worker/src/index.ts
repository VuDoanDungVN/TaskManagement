import { Hono } from "hono"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import type { AppEnv } from "./types"
import users from "./routes/users"
import projects from "./routes/projects"
import tasks from "./routes/tasks"
import uploads from "./routes/uploads"
import files from "./routes/files"

const app = new Hono<AppEnv>()

app.use("*", async (c, next) => {
  return cors({
    origin: (origin) => {
      const allowed = c.env.ALLOWED_ORIGIN.split(",").map((s) => s.trim())
      if (!origin) return allowed[0] ?? "*"
      return allowed.includes(origin) ? origin : null
    },
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
  })(c, next)
})

app.get("/health", (c) =>
  c.json({
    ok: true,
    name: "task-management-api",
    version: "0.1.0",
    time: new Date().toISOString(),
  }),
)

app.route("/users", users)
app.route("/projects", projects)
app.route("/tasks", tasks)
app.route("/uploads", uploads)
app.route("/files", files)

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse()
  }
  console.error("Unhandled error:", err)
  return c.json(
    { error: "Internal Server Error", message: err.message },
    500,
  )
})

app.notFound((c) => c.json({ error: "Not Found", path: c.req.path }, 404))

export default app
