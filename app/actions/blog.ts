'use server'

import { revalidatePath } from 'next/cache'
import fs from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'lib', 'blog-data.json')

function readData() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return []
    }
    const fileContent = fs.readFileSync(dataFilePath, 'utf8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error("Error reading blog data:", error)
    return []
  }
}

function saveData(data: any[]) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error("Error saving blog data:", error)
    return false
  }
}

export async function getAllPosts() {
  const posts = readData()
  return posts.filter((p: any) => p.is_active)
}

export async function getPostBySlug(slug: string) {
  const posts = readData()
  return posts.find((p: any) => p.slug === slug) || null
}

export async function createPost(data: any) {
  try {
    const posts = readData()
    const newId = posts.length > 0 ? Math.max(...posts.map((p: any) => p.id_post)) + 1 : 1
    
    const newPost = {
      id_post: newId,
      titulo: data.titulo,
      slug: data.slug,
      contenido: data.contenido,
      resumen: data.resumen,
      imagen_url: data.imagen_url || '/blog-placeholder.jpg',
      autor: data.autor || 'Equipo Saguaro',
      fecha_publicacion: new Date().toISOString(),
      is_active: true
    }
    
    posts.push(newPost)
    saveData(posts)
    
    revalidatePath('/blog')
    revalidatePath('/admin/blog')
    return { success: true, id: newId }
  } catch (error: any) {
    console.error("Error creating post:", error)
    return { success: false, error: error.message }
  }
}

export async function updatePost(id: number, data: any) {
  try {
    const posts = readData()
    const index = posts.findIndex((p: any) => p.id_post === id)
    
    if (index === -1) throw new Error("Post no encontrado")
    
    posts[index] = {
      ...posts[index],
      titulo: data.titulo,
      slug: data.slug,
      contenido: data.contenido,
      resumen: data.resumen,
      imagen_url: data.imagen_url,
      autor: data.autor,
      is_active: data.is_active !== undefined ? data.is_active : true
    }
    
    saveData(posts)
    
    revalidatePath('/blog')
    revalidatePath(`/blog/${data.slug}`)
    revalidatePath('/admin/blog')
    return { success: true }
  } catch (error: any) {
    console.error("Error updating post:", error)
    return { success: false, error: error.message }
  }
}

export async function deletePost(id: number) {
  try {
    const posts = readData()
    const index = posts.findIndex((p: any) => p.id_post === id)
    
    if (index !== -1) {
      posts[index].is_active = false
      saveData(posts)
    }
    
    revalidatePath('/blog')
    revalidatePath('/admin/blog')
    return { success: true }
  } catch (error) {
    console.error("Error deleting post:", error)
    return { success: false }
  }
}
