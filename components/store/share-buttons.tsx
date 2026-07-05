'use client'

import { useState } from 'react'
import { Facebook, Twitter, Link as LinkIcon, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareButtonsProps {
  slug: string
  titulo: string
}

export function ShareButtons({ slug, titulo }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  // Obtener la URL del post de forma segura en el cliente
  const getPostUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/blog/${slug}`
    }
    return ''
  }

  const postUrl = getPostUrl()

  const shareOnFacebook = () => {
    if (!postUrl) return
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
      '_blank',
      'width=600,height=400'
    )
  }

  const shareOnTwitter = () => {
    if (!postUrl) return
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(titulo)}`,
      '_blank',
      'width=600,height=400'
    )
  }

  const copyToClipboard = async () => {
    if (!postUrl) return
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err)
    }
  }

  return (
    <div className="flex items-center justify-between py-6 border-y border-border/60">
      <h4 className="font-bold text-sm text-foreground">Compartir artículo</h4>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full hover:bg-[#1877F2]/10 hover:text-[#1877F2] hover:border-[#1877F2]/30 transition-colors"
          onClick={shareOnFacebook}
          title="Compartir en Facebook"
        >
          <Facebook className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full hover:bg-black/10 hover:text-black dark:hover:bg-white/10 dark:hover:text-white transition-colors"
          onClick={shareOnTwitter}
          title="Compartir en X (Twitter)"
        >
          <Twitter className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full relative hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
          onClick={copyToClipboard}
          title="Copiar enlace al portapapeles"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-500 animate-in fade-in zoom-in duration-300" />
          ) : (
            <LinkIcon className="h-4 w-4" />
          )}
          {copied && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap animate-bounce">
              ¡Copiado!
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
