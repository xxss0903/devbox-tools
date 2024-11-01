import { BrowserWindow } from "electron";
import { ipcMain } from "electron";
import ollama from 'ollama'

export async function chatWithOllama(prompt: string, model: string = "qwen2.5"): Promise<void> {
  try {
    const response = await ollama.chat({
        model: model,
        messages: [{role: "user", content: prompt}],
        stream: true
    })

    for await (const part of response) {
      // 发送每个部分的响应
      if (part.message?.content) {
        ipcMain.emit('ollama-stream', part.message.content)
      }
    }
    // 发送完成信号
    ipcMain.emit('ollama-done')
  } catch (error) {
    console.error('Ollama API 调用失败:', error);
    throw error;
  }
}

export async function getOllamaModels(): Promise<string[]> {
  try {
    const models = await ollama.list()
    return models.models.map(model => model.name)
  } catch (error) {
    console.error('获取模型列表失败:', error)
    throw error
  }
}

export function setupOllamaChatHandle(win: BrowserWindow) {
  // 修改为处理流式响应
  ipcMain.handle('chat-with-ai', async (event, prompt: string, model?: string) => {
    try {
      await chatWithOllama(prompt, model)
      return true
    } catch (error) {
      console.error('Chat error:', error)
      throw error
    }
  })

  // 添加流式响应的事件监听器
  ipcMain.on('ollama-stream', (event: any) => {
    win.webContents.send('ollama-stream', event)
  })

  ipcMain.on('ollama-done', () => {
    win.webContents.send('ollama-done')
  })

  ipcMain.handle('get-ollama-models', async () => {
    return await getOllamaModels()
  })
}

