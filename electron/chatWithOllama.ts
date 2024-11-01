import { BrowserWindow } from "electron";
import { ipcMain } from "electron";
import ollama from 'ollama'

let defaultModel = "qwen2.5"

export async function chatWithOllama(win: BrowserWindow, prompt: string, model: string | undefined = defaultModel): Promise<void> {
  try {
    const response = await ollama.chat({
        model: model,
        messages: [{role: "user", content: prompt}],
        stream: true
    })

    for await (const part of response) {
      // 发送每个部分的响应
      if (part.message?.content) {
        win?.webContents.send('ollama-stream', part.message.content)
      }
    }
    // 发送完成信号
    win?.webContents.send('ollama-done')
  } catch (error) {
    console.error('Ollama API 调用失败:', error);
    throw error;
  }
}

export async function getOllamaModels(): Promise<any[]> {
  try {
    const response = await ollama.list()
    return response.models
  } catch (error) {
    console.error('获取模型列表失败:', error)
    throw error
  }
}

export async function pullOllamaModel(win: BrowserWindow, modelName: string): Promise<void> {
  try {
    const pull = await ollama.pull({
      model: modelName,
      stream: true
    })

    for await (const part of pull) {
      if(part.status.indexOf('pulling') < 0){
        console.log('pull model part', part)
      }
      // 发送详细的进度信息
      win.webContents.send('model-pull-progress', {
        status: part.status,
        completed: part.completed || 0,
        total: part.total || 0,
        digest: part.digest
      })
    }
  } catch (error) {
    console.error('拉取模型失败:', error)
    throw error
  }
}

export async function deleteOllamaModel(modelName: string): Promise<void> {
  try {
    await ollama.delete({
      model: modelName
    })
  } catch (error) {
    console.error('删除模型失败:', error)
    throw error
  }
}

export function setDefaultModel(modelName: string): void {
  defaultModel = modelName
}

export function getDefaultModel(): string {
  return defaultModel
}

export function setupOllamaChatHandle(win: BrowserWindow) {
  // 保存主窗口引用
  ipcMain.handle('chat-with-ai', async (event, prompt: string, model?: string) => {
    try {
      await chatWithOllama(win, prompt, model)
      return true
    } catch (error) {
      console.error('Chat error:', error)
      throw error
    }
  })

  ipcMain.handle('get-ollama-models', async () => {
    return await getOllamaModels()
  })

  ipcMain.handle('pull-ollama-model', async (_, modelName: string) => {
    return await pullOllamaModel(win, modelName)
  })

  ipcMain.handle('delete-ollama-model', async (_, modelName: string) => {
    return await deleteOllamaModel(modelName)
  })

  ipcMain.handle('set-default-model', async (_, modelName: string) => {
    setDefaultModel(modelName)
  })

  ipcMain.handle('get-default-model', async () => {
    return getDefaultModel()
  })
}

