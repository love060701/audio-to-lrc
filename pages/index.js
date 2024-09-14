// pages/index.js

import { useState } from 'react';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [lrcContent, setLrcContent] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!apiKey || !audioFile) {
      alert('请填写API Key并选择音频文件');
      return;
    }

    const formData = new FormData();
    formData.append('apiKey', apiKey);
    formData.append('audio', audioFile);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      setLrcContent(data.lrc);

      const blob = new Blob([data.lrc], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } else {
      const errorData = await response.json();
      alert(`生成lrc文件失败：${errorData.error}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>音频转lrc歌词</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Gemini API Key：
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
            style={{ width: '400px' }}
          />
        </label>
        <br /><br />

        <label>
          选择音频文件（mp3、wav、aac、flac）：
          <input
            type="file"
            accept=".mp3,.wav,.aac,.flac"
            onChange={(e) => setAudioFile(e.target.files[0])}
            required
          />
        </label>
        <br /><br />

        <button type="submit">上传并生成lrc文件</button>
      </form>

      {downloadUrl && (
        <div style={{ marginTop: '20px' }}>
          <h2>lrc文件已生成</h2>
          <a href={downloadUrl} download="lyrics.lrc">点击下载lrc文件</a>
        </div>
      )}
    </div>
  );
}
