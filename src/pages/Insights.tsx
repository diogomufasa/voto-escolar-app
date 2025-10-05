import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ListChecks, 
  Shield, 
  LogOut,
  Activity,
  PieChart,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface InsightsData {
  totalAEs: number;
  totalMembers: number;
  totalUsers: number;
  orgaoDistribution: { name: string; value: number }[];
  recentActivity: { date: string; count: number }[];
  aesByUser: { name: string; count: number }[];
}

const COLORS = ['hsl(217 88% 55%)', 'hsl(270 70% 60%)', 'hsl(142 71% 45%)'];

export default function Insights() {
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const [data, setData] = useState<InsightsData>({
    totalAEs: 0,
    totalMembers: 0,
    totalUsers: 0,
    orgaoDistribution: [],
    recentActivity: [],
    aesByUser: [],
  });
  const [loading, setLoading] = useState(true);

  // Hooks must be called before any conditional returns
  useEffect(() => {
    if (user && isAdmin) {
      fetchInsights();
    }
  }, [user, isAdmin]);

  const fetchInsights = async () => {
    try {
      setLoading(true);

      // Fetch total AEs
      const { count: aesCount } = await supabase
        .from("AEs")
        .select("*", { count: "exact", head: true });

      // Fetch all AEs with user emails
      const { data: aesData } = await supabase
        .from("AEs")
        .select("id, nome, created_at, user_id");

      // Fetch total members from os_onze
      const { data: membersData } = await supabase
        .from("os_onze")
        .select("orgao");

      // Fetch user roles count
      const { count: usersCount } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true });

      // Calculate órgão distribution
      const orgaoMap = new Map<string, number>();
      membersData?.forEach((member) => {
        const current = orgaoMap.get(member.orgao) || 0;
        orgaoMap.set(member.orgao, current + 1);
      });

      const orgaoDistribution = Array.from(orgaoMap.entries()).map(([name, value]) => ({
        name,
        value,
      }));

      // Calculate recent activity (AEs created in last 7 days)
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      
      const activityMap = new Map<string, number>();
      aesData?.forEach((ae) => {
        const date = new Date(ae.created_at);
        if (date >= last7Days) {
          const dateKey = date.toLocaleDateString('pt-PT', { month: 'short', day: 'numeric' });
          activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + 1);
        }
      });

      const recentActivity = Array.from(activityMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Calculate AEs by user
      const userMap = new Map<string, number>();
      aesData?.forEach((ae) => {
        const userId = ae.user_id || 'Sem utilizador';
        userMap.set(userId, (userMap.get(userId) || 0) + 1);
      });

      const aesByUser = Array.from(userMap.entries())
        .map(([name, count]) => ({ name: name.substring(0, 8) + '...', count }))
        .slice(0, 5);

      setData({
        totalAEs: aesCount || 0,
        totalMembers: membersData?.length || 0,
        totalUsers: usersCount || 0,
        orgaoDistribution,
        recentActivity,
        aesByUser,
      });
    } catch (error) {
      console.error("Error fetching insights:", error);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not authenticated or not admin
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Acesso não permitido</h1>
          <p className="text-muted-foreground mb-4">
            Apenas administradores podem aceder aos insights.
          </p>
          <Button onClick={() => signOut()} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">A carregar insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary-hover shadow-lg">
            <BarChart3 className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              Insights
            </h1>
            <p className="text-muted-foreground">Análises detalhadas das candidaturas à AE</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Listas
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <ListChecks className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{data.totalAEs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Listas candidatas registadas
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Membros
            </CardTitle>
            <div className="p-2 rounded-lg bg-success/10">
              <Users className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{data.totalMembers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Membros em todos os órgãos
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Utilizadores
            </CardTitle>
            <div className="p-2 rounded-lg bg-warning/10">
              <Activity className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Utilizadores registados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Órgão Distribution */}
        <Card className="border-0 shadow-lg animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              <CardTitle>Distribuição por Órgão</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={data.orgaoDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.orgaoDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Atividade Recente (7 dias)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.recentActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(217 88% 55%)" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(217 88% 55%)', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AEs by User */}
      <Card className="border-0 shadow-lg animate-slide-up" style={{ animationDelay: '0.6s' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Listas por Utilizador (Top 5)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.aesByUser}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar 
                dataKey="count" 
                fill="hsl(217 88% 55%)" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
