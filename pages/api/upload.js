// pages/api/upload.js

import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const config = {
  api: {
    bodyParser: false, // 关闭Next.js默认的bodyParser，以使用multer
  },
};

const handler = async (req, res) => {
  if (req.method === 'POST') {
    upload.single('audio')(req, res, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: '文件上传错误' });
      }

      try {
        const apiKey = req.body.apiKey;
        const audioBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        // 将音频文件转换为base64编码
        const base64Audio = audioBuffer.toString('base64');

        // 初始化GoogleGenerativeAI
        const genAI = new GoogleGenerativeAI(apiKey);

        // 选择Gemini模型
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
        });

        // 构建提示词，让Gemini生成lrc格式的歌词
        const prompt = [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio,
            },
          },
          { text: '请根据音频生成lrc格式的歌词，包含准确的时间戳。' },
        ];

        // 调用Gemini API
        const result = await model.generateContent(prompt);

        // 获取生成的lrc内容
        const lrcContent = await result.response.text();

        // 将lrc内容发送回客户端
        res.status(200).json({ lrc: lrcContent });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: '服务器错误' });
      }
    });
  } else {
    res.status(405).json({ error: '不支持的请求方法' });
  }
};

export default handler;
