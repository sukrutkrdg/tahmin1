import { useGetLeaderboard, useGetUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useGetLeaderboard();
  

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Liderlik Tablosu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Liderlik Tablosu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Henüz liderlik tablosunda kimse yok</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentUserPrincipal = identity?.getPrincipal().toString();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Liderlik Tablosu
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map(([principal, points], index) => {
            const isCurrentUser = principal.toString() === currentUserPrincipal;
            const rank = index + 1;
            
            return (
              <LeaderboardEntry
                key={principal.toString()}
                principal={principal.toString()}
                points={Number(points)}
                rank={rank}
                isCurrentUser={isCurrentUser}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function LeaderboardEntry({ 
  principal, 
  points, 
  rank, 
  isCurrentUser 
}: { 
  principal: string; 
  points: number; 
  rank: number; 
  isCurrentUser: boolean;
}) {
  const { data: profile } = useGetUserProfile(principal);

  const getRankIcon = () => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-semibold text-muted-foreground w-5 text-center">{rank}</span>;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
        isCurrentUser
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:bg-accent/5'
      }`}
    >
      <div className="flex items-center justify-center w-8">
        {getRankIcon()}
      </div>

      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {profile?.name ? getInitials(profile.name) : '?'}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">
          {profile?.name || 'Yükleniyor...'}
          {isCurrentUser && <span className="ml-2 text-xs text-primary">(Siz)</span>}
        </p>
        <p className="text-sm text-muted-foreground">
          {points.toLocaleString('tr-TR')} puan
        </p>
      </div>
    </div>
  );
}
