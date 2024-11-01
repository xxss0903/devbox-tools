import { BrowserWindow } from "electron";

import { ipcMain } from "electron";
import ollama, { ChatResponse } from 'ollama'

export async function chatWithOllama(prompt: string, model: string = "qwen2.5"): Promise<ChatResponse> {
  try {
    const response = await ollama.chat({
        model: model,
        messages: [{role: "user", content: prompt}],
        stream: false
    })
    return response
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
  ipcMain.handle('chat-with-ai', async (_, prompt: string, model?: string) => {
    return await chatWithOllama(prompt, model)
  })

  ipcMain.handle('get-ollama-models', async () => {
    return await getOllamaModels()
  })
}

