'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getAllPosts() {
  try {
    const posts = await prisma.blog_posts.findMany({
      where: { is_active: true },
      orderBy: { fecha_publicacion: 'desc' }
    })
    return posts
  } catch (error) {
    console.error("Error fetching posts:", error)
    return []
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const post = await prisma.blog_posts.findUnique({
      where: { slug }
    })
    return post
  } catch (error) {
    console.error("Error fetching post:", error)
    return null
  }
}

export async function createPost(data: any) {
  try {
    const post = await prisma.blog_posts.create({
      data: {
        titulo: data.titulo,
        slug: data.slug,
        contenido: data.contenido,
        resumen: data.resumen,
        imagen_url: data.imagen_url || '/blog-placeholder.jpg',
        autor: data.autor || 'Equipo Saguaro',
        is_active: true
      }
    })
    revalidatePath('/blog')
    revalidatePath('/admin/blog')
    return { success: true, id: post.id_post }
  } catch (error: any) {
    console.error("Error creating post:", error)
    return { success: false, error: error.message }
  }
}

export async function updatePost(id: number, data: any) {
  try {
    await prisma.blog_posts.update({
      where: { id_post: id },
      data: {
        titulo: data.titulo,
        slug: data.slug,
        contenido: data.contenido,
        resumen: data.resumen,
        imagen_url: data.imagen_url,
        autor: data.autor,
        is_active: data.is_active
      }
    })
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
    await prisma.blog_posts.update({
      where: { id_post: id },
      data: { is_active: false }
    })
    revalidatePath('/blog')
    revalidatePath('/admin/blog')
    return { success: true }
  } catch (error) {
    console.error("Error deleting post:", error)
    return { success: false }
  }
}
