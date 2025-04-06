export interface Video {
    id: number
    videoTitle: string
    upId: number
    videoUrl: string
    status: number
    coverUrl: string
    likes: number
    favorites: number
    createBy: string | null
    createTime: string
    updateBy: string | null
    updateTime: string | null
    isDeleted: number | null
    duration: number | null
    description: string | null
  }
  
 export interface Uploader {
    avatar?: string
    nickName?: string
  }
  
  // 添加UP主信息接口
interface UploaderInfo {
    id: number
    userName: string
    status: number
    avatar: string
    nickName: string
    email: string | null
    phone: string | null
    password: string
    sex: number
    introduce: string
  }