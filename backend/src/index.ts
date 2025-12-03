import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3500;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.get('/',(req,res)=>{
  res.json({message: '테스트 api 서버'});
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || '뭔가 잘못됐어!!!'});
});

app.listen(PORT, () => {
  console.log('서버 실행 중 http://localhost:' + PORT);
});

export default app;