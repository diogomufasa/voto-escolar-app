import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { X, Plus, Save, Loader2, Users } from "lucide-react";
import { toast } from "sonner";

type AE = Tables<"AEs">;
type OsOnze = Tables<"os_onze">;

interface AEFormProps {
  ae?: AE | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Membro {
  id?: number;
  nome: string;
  cargo: string;
  orgao: string;
  foto_url?: string | null;
}

const ORGAOS = ['DIREÇÃO', 'MESA DE ASSEMBLEIA GERAL', 'CONSELHO FISCAL'] as const;

export function AEForm({ ae, onSuccess, onCancel }: AEFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    num_colaboradores: 0,
    video_url: "",
    logo_url: "",
    propostas: [] as string[],
  });

  const [membros, setMembros] = useState<Membro[]>([]);
  const [newMembro, setNewMembro] = useState<Membro>({
    nome: "",
    cargo: "",
    orgao: "DIREÇÃO",
    foto_url: null,
  });
  const [uploadingMemberPhoto, setUploadingMemberPhoto] = useState(false);
  const [newProposta, setNewProposta] = useState("");

  useEffect(() => {
    if (ae) {
      setFormData({
        nome: ae.nome || "",
        num_colaboradores: ae.num_colaboradores || 0,
        video_url: ae.video_url || "",
        logo_url: ae.logo_url || "",
        propostas: ae.propostas || [],
      });
      fetchMembros();
    }
  }, [ae]);

  const fetchMembros = async () => {
    if (!ae) return;
    
    try {
      const { data, error } = await supabase
        .from("os_onze")
        .select("*")
        .eq("ae_id", ae.id)
        .order("orgao")
        .order("cargo");

      if (error) throw error;
      setMembros(data || []);
    } catch (error) {
      console.error("Error fetching membros:", error);
      toast.error("Erro ao carregar membros");
    }
  };

  const addMembro = () => {
    if (!newMembro.nome.trim() || !newMembro.cargo.trim()) {
      toast.error("Preencha nome e cargo do membro");
      return;
    }

    setMembros(prev => [...prev, { ...newMembro }]);
    setNewMembro({ nome: "", cargo: "", orgao: "DIREÇÃO", foto_url: null });
  };

  const removeMembro = (index: number) => {
    setMembros(prev => prev.filter((_, i) => i !== index));
  };

  const addProposta = () => {
    const value = newProposta.trim();
    if (value) {
      setFormData(prev => ({
        ...prev,
        propostas: [...prev.propostas, value]
      }));
      setNewProposta("");
    }
  };

  const removeProposta = (index: number) => {
    setFormData(prev => ({
      ...prev,
      propostas: prev.propostas.filter((_, i) => i !== index)
    }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, logo_url: data.publicUrl }));
      toast.success('Logo enviado com sucesso!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Erro ao enviar logo');
    } finally {
      setUploading(false);
    }
  };

  const handleMemberPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploadingMemberPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('member-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('member-photos')
        .getPublicUrl(fileName);

      setNewMembro(prev => ({ ...prev, foto_url: data.publicUrl }));
      toast.success('Foto enviada com sucesso!');
    } catch (error) {
      console.error('Error uploading member photo:', error);
      toast.error('Erro ao enviar foto');
    } finally {
      setUploadingMemberPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar autenticado");
        return;
      }

      const aeData = {
        nome: formData.nome,
        num_colaboradores: formData.num_colaboradores,
        video_url: formData.video_url || null,
        logo_url: formData.logo_url || null,
        propostas: formData.propostas.length > 0 ? formData.propostas : null,
        user_id: user.id,
      };

      let aeId: number;

      if (ae) {
        // Update existing AE
        const { error } = await supabase
          .from("AEs")
          .update(aeData)
          .eq("id", ae.id);
        if (error) throw error;
        aeId = ae.id;

        // Delete existing membros and re-insert
        const { error: deleteError } = await supabase
          .from("os_onze")
          .delete()
          .eq("ae_id", ae.id);
        if (deleteError) throw deleteError;
      } else {
        // Insert new AE
        const { data: newAe, error } = await supabase
          .from("AEs")
          .insert(aeData)
          .select()
          .single();
        if (error) throw error;
        aeId = newAe.id;
      }

      // Insert membros
      if (membros.length > 0) {
        const membrosData = membros.map(m => ({
          ae_id: aeId,
          nome: m.nome,
          cargo: m.cargo,
          orgao: m.orgao,
          foto_url: m.foto_url || null,
        }));

        const { error: membrosError } = await supabase
          .from("os_onze")
          .insert(membrosData);
        if (membrosError) throw membrosError;
      }

      toast.success(ae ? "Lista atualizada com sucesso!" : "Lista criada com sucesso!");
      onSuccess();
    } catch (error: any) {
      console.error("Error saving AE:", error);
      if (error.message?.includes("user_has_ae")) {
        toast.error("Você já possui uma lista. Edite a existente ou delete-a primeiro.");
      } else {
        toast.error("Erro ao salvar lista");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome da Lista *</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
          placeholder="Ex: Lista Inovação"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="num_colaboradores">Número de Colaboradores</Label>
          <Input
            id="num_colaboradores"
            type="number"
            min="0"
            value={formData.num_colaboradores}
            onChange={(e) => setFormData(prev => ({ ...prev, num_colaboradores: parseInt(e.target.value) || 0 }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="video_url">URL do Vídeo Promocional</Label>
          <Input
            id="video_url"
            value={formData.video_url}
            onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
      </div>

      {/* Logo Upload */}
      <div className="space-y-2">
        <Label htmlFor="logo">Logo da Lista</Label>
        <div className="flex items-center gap-4">
          <Input
            id="logo"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            disabled={uploading}
            className="flex-1"
          />
          {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
        {formData.logo_url && (
          <div className="mt-2">
            <img 
              src={formData.logo_url} 
              alt="Logo preview" 
              className="w-16 h-16 object-cover rounded-lg border"
            />
          </div>
        )}
      </div>

      {/* Membros por Órgão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membros da Lista
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Member Form */}
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="md:col-span-2">
                <Input
                  value={newMembro.nome}
                  onChange={(e) => setNewMembro(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Nome do membro"
                />
              </div>
              <Input
                value={newMembro.cargo}
                onChange={(e) => setNewMembro(prev => ({ ...prev, cargo: e.target.value }))}
                placeholder="Cargo"
              />
              <div className="flex gap-2">
                <Select
                  value={newMembro.orgao}
                  onValueChange={(value) => setNewMembro(prev => ({ ...prev, orgao: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORGAOS.map(orgao => (
                      <SelectItem key={orgao} value={orgao}>
                        {orgao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addMembro} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Member Photo Upload */}
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept="image/*"
                onChange={handleMemberPhotoUpload}
                disabled={uploadingMemberPhoto}
                className="flex-1"
              />
              {uploadingMemberPhoto && <Loader2 className="h-4 w-4 animate-spin" />}
              {newMembro.foto_url && (
                <img 
                  src={newMembro.foto_url} 
                  alt="Preview" 
                  className="w-10 h-10 object-cover rounded-full border"
                />
              )}
            </div>
          </div>

          {/* Members List by Orgao */}
          {ORGAOS.map(orgao => {
            const orgaoMembros = membros.filter(m => m.orgao === orgao);
            if (orgaoMembros.length === 0) return null;

            return (
              <div key={orgao} className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">{orgao}</h4>
                <div className="space-y-2">
                  {orgaoMembros.map((membro, index) => {
                    const globalIndex = membros.findIndex(m => 
                      m.nome === membro.nome && m.cargo === membro.cargo && m.orgao === membro.orgao
                    );
                    return (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex items-center gap-3 flex-1">
                          {membro.foto_url && (
                            <img 
                              src={membro.foto_url} 
                              alt={membro.nome}
                              className="w-8 h-8 object-cover rounded-full border"
                            />
                          )}
                          <div>
                            <p className="font-medium text-sm">{membro.nome}</p>
                            <p className="text-xs text-muted-foreground">{membro.cargo}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMembro(globalIndex)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {membros.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum membro adicionado ainda
            </p>
          )}
        </CardContent>
      </Card>

      {/* Propostas */}
      <div className="space-y-3">
        <Label>Propostas Principais</Label>
        <div className="flex gap-2">
          <Input
            value={newProposta}
            onChange={(e) => setNewProposta(e.target.value)}
            placeholder="Descrição da proposta"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProposta())}
          />
          <Button type="button" onClick={addProposta} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {formData.propostas.map((proposta, index) => (
            <div key={index} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
              <span className="text-sm flex-1">{proposta}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeProposta(index)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {ae ? "Atualizar" : "Criar"} Lista
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}