import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { AECard } from "@/components/AECard";
import { AEComparisonTable } from "@/components/AEComparisonTable";
import { Loader2, Trophy, Users, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AE = Tables<"AEs">;
type AEWithVotes = AE & { vote_count: number; user_has_voted: boolean };

export default function Feed() {
  const [aes, setAes] = useState<AEWithVotes[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchAEs();
  }, [user]);

  const fetchAEs = async () => {
    try {
      const { data: aesData, error: aesError } = await supabase
        .from("AEs")
        .select("*")
        .order("created_at", { ascending: false });

      if (aesError) throw aesError;

      // Fetch vote counts and user votes
      const anonymousVotesKey = "votoescolar_anonymous_votes";
      const anonymousVotes = JSON.parse(localStorage.getItem(anonymousVotesKey) || "[]");

      const aesWithVotes = await Promise.all(
        (aesData || []).map(async (ae) => {
          // Get vote count
          const { count } = await supabase
            .from("ae_votes")
            .select("*", { count: "exact", head: true })
            .eq("ae_id", ae.id);

          // Check if current user has voted
          let userHasVoted = false;
          if (user) {
            // Authenticated user
            const { data: userVote } = await supabase
              .from("ae_votes")
              .select("id")
              .eq("ae_id", ae.id)
              .eq("user_id", user.id)
              .maybeSingle();
            userHasVoted = !!userVote;
          } else {
            // Anonymous user - check localStorage
            userHasVoted = anonymousVotes.some((v: any) => v.ae_id === ae.id);
          }

          return {
            ...ae,
            vote_count: count || 0,
            user_has_voted: userHasVoted,
          };
        })
      );

      setAes(aesWithVotes);
    } catch (error) {
      console.error("Error fetching AEs:", error);
      toast.error("Erro ao carregar as listas candidatas");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (aeId: number, hasVoted: boolean) => {
    try {
      if (user) {
        // Authenticated user voting
        if (hasVoted) {
          const { error } = await supabase
            .from("ae_votes")
            .delete()
            .eq("ae_id", aeId)
            .eq("user_id", user.id);

          if (error) throw error;
          toast.success("Like removido");
        } else {
          const { error } = await supabase
            .from("ae_votes")
            .insert({ ae_id: aeId, user_id: user.id });

          if (error) throw error;
          toast.success("Like adicionado!");
        }
      } else {
        // Anonymous user voting with localStorage
        const anonymousVotesKey = "votoescolar_anonymous_votes";
        const existingVotes = JSON.parse(localStorage.getItem(anonymousVotesKey) || "[]");
        
        if (hasVoted) {
          // Remove anonymous vote
          const voteToRemove = existingVotes.find((v: any) => v.ae_id === aeId);
          if (voteToRemove) {
            const { error } = await supabase
              .from("ae_votes")
              .delete()
              .eq("id", voteToRemove.id);

            if (error) throw error;
            
            const updatedVotes = existingVotes.filter((v: any) => v.ae_id !== aeId);
            localStorage.setItem(anonymousVotesKey, JSON.stringify(updatedVotes));
            toast.success("Like removido");
          }
        } else {
          // Add anonymous vote
          const { data, error } = await supabase
            .from("ae_votes")
            .insert({ ae_id: aeId, user_id: null })
            .select()
            .single();

          if (error) throw error;
          
          const updatedVotes = [...existingVotes, { ae_id: aeId, id: data.id }];
          localStorage.setItem(anonymousVotesKey, JSON.stringify(updatedVotes));
          toast.success("Like adicionado!");
        }
      }

      fetchAEs();
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Erro ao dar like");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>A carregar as listas candidatas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <img 
            src="/marista-logo.webp" 
            alt="Colégio Marista de Carcavelos" 
            className="h-24 sm:h-32 w-auto"
          />
        </div>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
            Eleições AEs 2025/26
          </h1>
          <div className="p-3 rounded-full bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Conhece as listas candidatas à Associação de Estudantes do Colégio Marista de Carcavelos para o ano letivo 2025/26.
        </p>
      </div>

      {/* AEs Content */}
      <div className="space-y-6">
        {aes.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              Nenhuma lista criada
            </h3>
            <p className="text-muted-foreground">
              As listas candidatas aparecerão aqui quando forem criadas.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="cards" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="cards" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Listas
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Comparação
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="comparison" className="space-y-6">
              <AEComparisonTable aes={aes} onVote={handleVote} />
            </TabsContent>
            
            <TabsContent value="cards" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {aes.map((ae) => (
                  <AECard 
                    key={ae.id} 
                    ae={ae} 
                    voteCount={ae.vote_count}
                    hasVoted={ae.user_has_voted}
                    onVote={handleVote}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Stats Footer */}
      {aes.length > 0 && (
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{aes.length} lista{aes.length !== 1 ? 's' : ''} candidata{aes.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        {/* <span> Desenvolvido por Diogo Moreira</span> */}
      </div>
    </div>
  );
}