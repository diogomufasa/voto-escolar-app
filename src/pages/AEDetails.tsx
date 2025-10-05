import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Users, 
  Play, 
  Trophy,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";

type AE = Tables<"AEs">;
type OsOnze = Tables<"os_onze">;

interface OrgaoGroup {
  orgao: string;
  membros: OsOnze[];
}

export default function AEDetails() {
  const { id } = useParams<{ id: string }>();
  const [ae, setAe] = useState<AE | null>(null);
  const [osOnze, setOsOnze] = useState<OrgaoGroup[]>([]);
  const [presidente, setPresidente] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAEDetails();
    }
  }, [id]);

  const fetchAEDetails = async () => {
    try {
      const { data: aeData, error: aeError } = await supabase
        .from("AEs")
        .select("*")
        .eq("id", parseInt(id!))
        .single();

      if (aeError) throw aeError;
      setAe(aeData);

      const { data: osOnzeData, error: osOnzeError } = await supabase
        .from("os_onze")
        .select("*")
        .eq("ae_id", parseInt(id!))
        .order("orgao", { ascending: true })
        .order("cargo", { ascending: true });

      if (osOnzeError) throw osOnzeError;

      // Find presidente from os_onze
      const presidenteMembro = osOnzeData.find(
        m => m.cargo.toLowerCase() === 'presidente' && m.orgao === 'DIREÇÃO'
      );
      setPresidente(presidenteMembro?.nome || null);

      const grouped = osOnzeData.reduce((acc, membro) => {
        const existing = acc.find(g => g.orgao === membro.orgao);
        if (existing) {
          existing.membros.push(membro);
        } else {
          acc.push({ orgao: membro.orgao, membros: [membro] });
        }
        return acc;
      }, [] as OrgaoGroup[]);

      setOsOnze(grouped);
    } catch (error) {
      console.error("Error fetching AE details:", error);
      toast.error("Erro ao carregar detalhes da lista");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!ae) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Lista não encontrada</h2>
          <Link to="/feed">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à página inicial
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-12">
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à página inicial
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {ae.logo_url && (
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-background shadow-elegant flex-shrink-0">
                <img 
                  src={ae.logo_url} 
                  alt={`Logo ${ae.nome}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {ae.nome}
                </h1>
                {presidente && (
                  <p className="text-lg text-muted-foreground flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    <span className="font-medium">Presidente:</span> {presidente}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  <Users className="h-4 w-4 mr-2" />
                  {ae.num_colaboradores || 0} colaboradores
                </Badge>
              </div>

              {ae.video_url && (
                <Button size="lg" className="w-full md:w-auto" asChild>
                  <a href={ae.video_url} target="_blank" rel="noopener noreferrer">
                    <Play className="h-5 w-5 mr-2" />
                    Ver Vídeo Promocional
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Proposals */}
            {ae.propostas && ae.propostas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Propostas Principais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {ae.propostas.map((proposta, index) => (
                      <li key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="text-foreground">{proposta}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizational Structure */}
            {osOnze.map((grupo) => (
              <Card key={grupo.orgao}>
                <CardHeader>
                  <CardTitle className="text-lg">{grupo.orgao}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {grupo.membros.map((membro) => (
                      <div key={membro.id} className="space-y-1">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={membro.foto_url || undefined} alt={membro.nome} />
                            <AvatarFallback>{membro.nome.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-primary">{membro.cargo}</p>
                            <p className="text-sm text-foreground">{membro.nome}</p>
                          </div>
                        </div>
                        {membro.id !== grupo.membros[grupo.membros.length - 1].id && (
                          <Separator className="mt-3" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Legacy Os 11 (if no structured data exists) */}
            {osOnze.length === 0 && (ae as any).os_onze && (ae as any).os_onze.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Os 11</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(ae as any).os_onze.map((membro: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {membro}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
