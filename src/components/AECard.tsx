import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Play, Edit, ArrowRight, Trophy, Trash2, Heart } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type AE = Tables<"AEs">;

interface AECardProps {
  ae: AE;
  showAdminActions?: boolean;
  onEdit?: (ae: AE) => void;
  onDelete?: (ae: AE) => void;
  voteCount?: number;
  hasVoted?: boolean;
  onVote?: (aeId: number, hasVoted: boolean) => void;
}

export function AECard({ ae, showAdminActions = false, onEdit, onDelete, voteCount = 0, hasVoted = false, onVote }: AECardProps) {
  return (
    <Card className="group hover:shadow-elegant hover:scale-[1.02] transition-all duration-300 bg-gradient-card border border-border/50 overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <CardHeader className="pb-3 relative">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            {ae.logo_url && (
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                <img 
                  src={ae.logo_url} 
                  alt={`Logo ${ae.nome}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="space-y-2 flex-1">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all">
                {ae.nome}
              </h3>
            </div>
          </div>
          {showAdminActions && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  onEdit?.(ae);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  onDelete?.(ae);
                }}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5 relative">
        {/* Vote Button */}
        {onVote && (
          <Button
            variant={hasVoted ? "default" : "outline"}
            size="sm"
            className={`w-full group/vote ${hasVoted ? 'bg-primary hover:bg-primary/90' : 'border-primary/20 hover:border-primary/40'}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onVote(ae.id, hasVoted);
            }}
          >
            <Heart className={`h-4 w-4 mr-2 ${hasVoted ? 'fill-current' : ''} group-hover/vote:scale-110 transition-transform`} />
            Like ({voteCount})
          </Button>
        )}

        {/* Stats - Enhanced */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1.5">
            <Users className="h-4 w-4" />
            <span className="font-semibold">{ae.num_colaboradores || 0}</span> colaboradores
          </Badge>
        </div>

        {/* Proposals - Preview */}
        {ae.propostas && ae.propostas.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              Principais Propostas
            </h4>
            <ul className="space-y-2">
              {ae.propostas.slice(0, 2).map((proposta, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-3 p-2 rounded-md bg-muted/30">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                    {index + 1}
                  </span>
                  <span className="line-clamp-2">{proposta}</span>
                </li>
              ))}
              {ae.propostas.length > 3 && (
                <li className="text-xs text-primary font-medium pl-8">
                  +{ae.propostas.length - 3} mais propostas
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Video Button - Enhanced */}
        {ae.video_url && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full group/video border-primary/20 hover:border-primary/40 hover:gradient-to-r hover:from-primary/10 hover:to-primary/5"
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <a href={ae.video_url} target="_blank" rel="noopener noreferrer">
              <Play className="h-4 w-4 mr-2 group-hover/video:scale-110 transition-transform" />
              Vídeo Promocional
            </a>
          </Button>
        )}

        {/* View Details Button */}
        <Link to={`/ae/${ae.id}`} onClick={(e) => e.stopPropagation()}>
          <Button 
            className="w-full group/btn bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            size="sm"
          >
            Ver tudo
            <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}