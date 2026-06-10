import * as React from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
import { Search, Plus, FileText, Settings, User, CreditCard } from "lucide-react";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-popover border border-border rounded-xl shadow-2xl p-0 overflow-hidden z-[9999]"
    >
      <div className="flex items-center border-b border-border px-3" cmdk-input-wrapper="">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <Command.Input
          placeholder="Escribe un comando o busca..."
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
        <Command.Empty className="py-6 text-center text-sm">No se encontraron resultados.</Command.Empty>

        <Command.Group heading="Acciones Rápidas" className="mb-2">
          <Command.Item
            onSelect={() => runCommand(() => navigate("/admin/proposals/new"))}
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Nueva Propuesta</span>
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => navigate("/admin/clients/new"))}
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <User className="mr-2 h-4 w-4" />
            <span>Nuevo Cliente</span>
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Navegación" className="mb-2">
          <Command.Item
            onSelect={() => runCommand(() => navigate("/admin/proposals"))}
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Propuestas</span>
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => navigate("/admin/clients"))}
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <User className="mr-2 h-4 w-4" />
            <span>Clientes</span>
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => navigate("/admin/finance"))}
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Finanzas</span>
          </Command.Item>
          <Command.Item
            onSelect={() => runCommand(() => navigate("/admin/config"))}
            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
          </Command.Item>
        </Command.Group>
      </Command.List>
      <div className="border-t border-border px-4 py-2 text-[10px] text-muted-foreground flex justify-between">
        <span>Comandos globales</span>
        <div className="flex gap-1">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>
    </Command.Dialog>
  );
}
