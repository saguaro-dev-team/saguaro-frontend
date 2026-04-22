'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, FileText, Image as ImageIcon, Link as LinkIcon, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { getAllPosts, createPost, updatePost, deletePost } from '@/app/actions/blog'

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    titulo: '',
    slug: '',
    resumen: '',
    contenido: '',
    imagen_url: '',
    autor: ''
  })

  const loadPosts = () => {
    setLoading(true)
    getAllPosts().then(data => {
      setPosts(data)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const handleAdd = () => {
    setEditingPost(null)
    setFormData({
      titulo: '',
      slug: '',
      resumen: '',
      contenido: '',
      imagen_url: '',
      autor: 'Equipo Saguaro'
    })
    setModalOpen(true)
  }

  const handleEdit = (post: any) => {
    setEditingPost(post)
    setFormData({
      titulo: post.titulo,
      slug: post.slug,
      resumen: post.resumen || '',
      contenido: post.contenido,
      imagen_url: post.imagen_url || '',
      autor: post.autor || ''
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    let res
    if (editingPost) {
      res = await updatePost(editingPost.id_post, formData)
    } else {
      res = await createPost(formData)
    }

    if (res.success) {
      setModalOpen(false)
      loadPosts()
    } else {
      alert("Error: " + res.error)
    }
    setIsSaving(false)
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta publicación?")) {
      await deletePost(id)
      loadPosts()
    }
  }

  const generateSlug = (title: string) => {
    const slug = title.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setFormData(prev => ({ ...prev, slug }))
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Blog</h1>
          <p className="text-muted-foreground">Crea y edita artículos para tu comunidad</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" /> Nuevo Artículo
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">Cargando...</TableCell></TableRow>
              ) : posts.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No hay artículos</TableCell></TableRow>
              ) : (
                posts.map(post => (
                  <TableRow key={post.id_post}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-12 rounded bg-muted overflow-hidden">
                          <img src={post.imagen_url || '/blog-placeholder.jpg'} className="h-full w-full object-cover" />
                        </div>
                        <span className="font-medium line-clamp-1">{post.titulo}</span>
                      </div>
                    </TableCell>
                    <TableCell>{post.autor}</TableCell>
                    <TableCell>{new Date(post.fecha_publicacion).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(post)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(post.id_post)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{editingPost ? 'Editar Artículo' : 'Nuevo Artículo'}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título</label>
                <Input 
                  value={formData.titulo} 
                  onChange={e => setFormData({...formData, titulo: e.target.value})} 
                  onBlur={() => !formData.slug && generateSlug(formData.titulo)}
                  placeholder="Ej: Beneficios del Barefoot" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1"><LinkIcon className="h-3 w-3" /> Slug (URL)</label>
                <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="beneficios-barefoot" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1"><User className="h-3 w-3" /> Autor</label>
                <Input value={formData.autor} onChange={e => setFormData({...formData, autor: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1"><ImageIcon className="h-3 w-3" /> URL Imagen</label>
                <Input value={formData.imagen_url} onChange={e => setFormData({...formData, imagen_url: e.target.value})} placeholder="https://..." />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Resumen Corto</label>
              <Textarea 
                value={formData.resumen} 
                onChange={e => setFormData({...formData, resumen: e.target.value})} 
                placeholder="Una breve descripción para la lista de artículos..." 
                className="h-20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1"><FileText className="h-3 w-3" /> Contenido</label>
              <Textarea 
                value={formData.contenido} 
                onChange={e => setFormData({...formData, contenido: e.target.value})} 
                placeholder="Escribe aquí tu artículo..." 
                className="min-h-[300px]"
              />
            </div>
          </div>
          <DialogFooter className="p-6 pt-0">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Publicar Artículo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
