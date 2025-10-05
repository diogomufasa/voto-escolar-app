import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Users, Trophy, Play, ArrowRight } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type AE = Tables<"AEs">;

interface AEWithVotes extends AE {
  vote_count: number;
  user_has_voted: boolean;
}

interface AEComparisonTableProps {
  aes: AEWithVotes[];
  onVote?: (aeId: number, hasVoted: boolean) => void;
}

export function AEComparisonTable({ aes, onVote }: AEComparisonTableProps) {
  if (aes.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-full inline-block align-middle">
        <div className="overflow-hidden border border-border rounded-lg">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Lista
                </th>
                {aes.map((ae) => (
                  <th key={ae.id} scope="col" className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-3">
                      {ae.logo_url && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 shadow-md">
                          <img 
                            src={ae.logo_url} 
                            alt={`Logo ${ae.nome}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        {ae.nome}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {/* Likes Row */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" />
                    Likes
                  </div>
                </td>
                {aes.map((ae) => (
                  <td key={ae.id} className="px-6 py-4 text-center">
                    {onVote ? (
                      <Button
                        variant={ae.user_has_voted ? "default" : "outline"}
                        size="sm"
                        className={`group/like ${ae.user_has_voted ? 'bg-primary hover:bg-primary/90' : 'border-primary/20 hover:border-primary/40'}`}
                        onClick={() => onVote(ae.id, ae.user_has_voted)}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${ae.user_has_voted ? 'fill-current' : ''} group-hover/like:scale-110 transition-transform`} />
                        {ae.vote_count}
                      </Button>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Heart className="h-4 w-4" />
                        <span className="font-semibold">{ae.vote_count}</span>
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Collaborators Row */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Colaboradores
                  </div>
                </td>
                {aes.map((ae) => (
                  <td key={ae.id} className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold">{ae.num_colaboradores || 0}</span>
                  </td>
                ))}
              </tr>

              {/* Proposals Row */}
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-foreground align-top">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    Principais Propostas
                  </div>
                </td>
                {aes.map((ae) => (
                  <td key={ae.id} className="px-6 py-4 align-top">
                    {ae.propostas && ae.propostas.length > 0 ? (
                      <ul className="space-y-2 text-left">
                        {ae.propostas.slice(0, 3).map((proposta, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                              {index + 1}
                            </span>
                            <span className="line-clamp-2">{proposta}</span>
                          </li>
                        ))}
                        {ae.propostas.length > 3 && (
                          <li className="text-xs text-primary font-medium pl-7">
                            +{ae.propostas.length - 3} mais
                          </li>
                        )}
                      </ul>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Video Row */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-primary" />
                    Vídeo
                  </div>
                </td>
                {aes.map((ae) => (
                  <td key={ae.id} className="px-6 py-4 text-center">
                    {ae.video_url ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/20 hover:border-primary/40"
                        asChild
                      >
                        <a href={ae.video_url} target="_blank" rel="noopener noreferrer">
                          <Play className="h-4 w-4" />
                        </a>
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Details Row */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  Detalhes
                </td>
                {aes.map((ae) => (
                  <td key={ae.id} className="px-6 py-4 text-center">
                    <Link to={`/ae/${ae.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="group/btn border-primary/20 hover:border-primary/40"
                      >
                        Ver mais
                        <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
