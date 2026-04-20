"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  CalendarDays, 
  Download, 
  RefreshCw,
  ChevronDown,
  User,
  Settings,
  LogOut
} from "lucide-react"

interface DashboardHeaderProps {
  lastUpdate: string
}

export function DashboardHeader({ lastUpdate }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            S
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Saguaro Barefoot Chile
            </h1>
            <p className="text-sm text-muted-foreground">
              Dashboard de Business Intelligence
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-md">
          <RefreshCw className="h-3 w-3" />
          <span>Actualizado: {lastUpdate}</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Últimos 12 meses
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Período</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Últimos 7 días</DropdownMenuItem>
            <DropdownMenuItem>Últimos 30 días</DropdownMenuItem>
            <DropdownMenuItem>Últimos 3 meses</DropdownMenuItem>
            <DropdownMenuItem>Últimos 12 meses</DropdownMenuItem>
            <DropdownMenuItem>Este año</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Formato</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Exportar PDF</DropdownMenuItem>
            <DropdownMenuItem>Exportar Excel</DropdownMenuItem>
            <DropdownMenuItem>Exportar CSV</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Administrador</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
