import { ipcMain } from 'electron'
import simpleGit, { SimpleGit } from 'simple-git'
import { GitInfo } from '../src/types/electron'

// 创建 Git 实例
const createGit = (path: string): SimpleGit => {
  return simpleGit({
    baseDir: path,
    binary: 'git',
    maxConcurrentProcesses: 1,
  })
}

// 获取 Git 信息
export const getGitInfo = async (path: string): Promise<GitInfo> => {
  const git = createGit(path)

  try {
    // 获取当前分支
    const currentBranch = (await git.branch()).current

    // 获取所有分支
    const branchSummary = await git.branch()
    const branches = branchSummary.all

    // 获取状态
    const status = await git.status()
    const modified = status.modified
    const untracked = status.not_added
    const staged = status.staged

    // 获取最近的提交记录
    const logs = await git.log({ maxCount: 10 })
    const commits = logs.all.map(commit => ({
      hash: commit.hash,
      message: commit.message,
      author: commit.author_name,
      date: commit.date
    }))

    return {
      currentBranch,
      branches,
      status: {
        modified,
        untracked,
        staged
      },
      commits
    }
  } catch (error) {
    console.error('Error getting git info:', error)
    throw error
  }
}

// 提交代码
export const gitCommit = async (path: string, message: string): Promise<void> => {
  const git = createGit(path)
  try {
    // 添加所有更改
    await git.add('.')
    // 提交更改
    await git.commit(message)
  } catch (error) {
    console.error('Error committing changes:', error)
    throw error
  }
}

// 切换分支
export const gitCheckout = async (path: string, branch: string): Promise<void> => {
  const git = createGit(path)
  try {
    await git.checkout(branch)
  } catch (error) {
    console.error('Error checking out branch:', error)
    throw error
  }
}

// 拉取代码
export const gitPull = async (path: string): Promise<void> => {
  const git = createGit(path)
  try {
    await git.pull()
  } catch (error) {
    console.error('Error pulling changes:', error)
    throw error
  }
}

// 推送代码
export const gitPush = async (path: string): Promise<void> => {
  const git = createGit(path)
  try {
    const currentBranch = (await git.branch()).current
    await git.push('origin', currentBranch)
  } catch (error) {
    console.error('Error pushing changes:', error)
    throw error
  }
}

// 注册 IPC 处理程序
export const registerGitHandlers = () => {
  ipcMain.handle('getGitInfo', async (_, path: string) => {
    return await getGitInfo(path)
  })

  ipcMain.handle('gitCommit', async (_, path: string, message: string) => {
    await gitCommit(path, message)
  })

  ipcMain.handle('gitCheckout', async (_, path: string, branch: string) => {
    await gitCheckout(path, branch)
  })

  ipcMain.handle('gitPull', async (_, path: string) => {
    await gitPull(path)
  })

  ipcMain.handle('gitPush', async (_, path: string) => {
    await gitPush(path)
  })
} 