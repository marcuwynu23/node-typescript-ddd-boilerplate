import express, {Request, Response} from "express";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.json({message: "Hello from Express + TypeScript + esbuild!"});
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({status: "ok", timestamp: new Date().toISOString()});
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export {app};
