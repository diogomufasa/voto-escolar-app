import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { AECard } from "@/components/AECard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AEForm } from "@/components/AEForm";
import { CreateUserDialog } from "@/components/CreateUserDialog";
import { Plus, Shield, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type AE = Tables<"AEs">;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const [aes, setAes] = useState<AE[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAE, setEditingAE] = useState<AE | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingAE, setDeletingAE] = useState<AE | null>(null);

  // Redirect if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    if (user !== null) {
      fetchAEs();
    }
  }, [user, isAdmin]);

  const fetchAEs = async () => {
    try {
      let query = supabase
        .from("AEs")
        .select("*");

      // If not admin, only show user's own AE
      if (!isAdmin && user) {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setAes(data || []);
    } catch (error) {
      console.error("Error fetching AEs:", error);
      toast.error("Erro ao carregar as listas");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ae: AE) => {
    setEditingAE(ae);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingAE(null);
    fetchAEs();
    toast.success("Lista salva com sucesso!");
  };

  const handleNewAE = () => {
    setEditingAE(null);
    setIsFormOpen(true);
  };

  const handleDelete = (ae: AE) => {
    setDeletingAE(ae);
  };

  const confirmDelete = async () => {
    if (!deletingAE) return;

    try {
      const { error } = await supabase
        .from("AEs")
        .delete()
        .eq("id", deletingAE.id);

      if (error) throw error;

      toast.success("Lista apagada com sucesso!");
      fetchAEs();
    } catch (error) {
      console.error("Error deleting AE:", error);
      toast.error("Erro ao apagar a lista");
    } finally {
      setDeletingAE(null);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isAdmin ? "Dashboard" : "Minha Lista"}
            </h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Gere as listas candidatas à AE" : "Gere a sua lista candidata à AE"}
            </p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isAdmin && <CreateUserDialog />}
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewAE} className="bg-gradient-to-r from-primary to-primary-hover">
              <Plus className="h-4 w-4 mr-2" />
              Nova Lista
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="dialog-description">
            <DialogHeader>
              <DialogTitle>
                {editingAE ? "Editar Lista" : "Nova Lista Candidata"}
              </DialogTitle>
              <div id="dialog-description" className="sr-only">
                {editingAE ? "Formulário para editar os dados da lista candidata" : "Formulário para criar uma nova lista candidata à Associação de Estudantes"}
              </div>
            </DialogHeader>
            <AEForm 
              ae={editingAE} 
              onSuccess={handleFormSuccess}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
          <Button
            onClick={() => {
              signOut();
              navigate("/");
            }}
            variant="outline"
            size="sm"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
          </Dialog>
        </div>
      </div>

      {/* AEs Management */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground mt-4">A carregar</p>
          </div>
        ) : aes.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed border-muted">
            <Shield className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              Nenhuma lista criada
            </h3>
            <p className="text-muted-foreground mb-4">
              Começa a criar a tua lista candidata!
            </p>
            <Button onClick={handleNewAE} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Criar Lista
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {aes.map((ae) => (
              <AECard 
                key={ae.id} 
                ae={ae} 
                showAdminActions={true}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingAE} onOpenChange={() => setDeletingAE(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja apagar a lista "{deletingAE?.nome}"? Esta ação é irreversível e todos os dados relacionados serão permanentemente removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}