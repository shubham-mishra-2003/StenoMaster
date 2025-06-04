
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Score, Assignment } from "@/types";
import { TrendingUp, Target, Clock, Trophy } from "lucide-react";

interface StudentProgressProps {
  scores: Score[];
  assignments: Assignment[];
}

const StudentProgress = ({ scores, assignments }: StudentProgressProps) => {
  const getAssignmentTitle = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    return assignment?.title || 'Unknown Assignment';
  };

  const calculateImprovement = () => {
    if (scores.length < 2) return 0;
    const sortedScores = [...scores].sort((a, b) => 
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );
    const firstFive = sortedScores.slice(0, 5);
    const lastFive = sortedScores.slice(-5);
    
    const firstAvg = firstFive.reduce((sum, s) => sum + s.accuracy, 0) / firstFive.length;
    const lastAvg = lastFive.reduce((sum, s) => sum + s.accuracy, 0) / lastFive.length;
    
    return Math.round(lastAvg - firstAvg);
  };

  const getBestScore = () => {
    if (scores.length === 0) return null;
    return scores.reduce((best, current) => 
      current.accuracy > best.accuracy ? current : best
    );
  };

  const improvement = calculateImprovement();
  const bestScore = getBestScore();

  if (scores.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No progress data yet</h3>
          <p className="text-muted-foreground text-center">
            Complete some assignments to see your progress here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Your Progress</h2>
        <p className="text-muted-foreground">Track your stenography improvement</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Completed</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scores.length}</div>
            <p className="text-xs text-muted-foreground">
              Assignment{scores.length !== 1 ? 's' : ''} finished
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestScore?.accuracy || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Personal best score
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {improvement > 0 ? '+' : ''}{improvement}%
            </div>
            <p className="text-xs text-muted-foreground">
              From first to recent scores
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scores
              .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
              .slice(0, 10)
              .map((score) => (
                <div key={score.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{getAssignmentTitle(score.assignmentId)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(score.completedAt).toLocaleDateString()} at{' '}
                      {new Date(score.completedAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex space-x-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold flex items-center">
                          <Target className="h-3 w-3 mr-1" />
                          {score.accuracy}%
                        </div>
                        <div className="text-muted-foreground text-xs">Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {score.wpm}
                        </div>
                        <div className="text-muted-foreground text-xs">WPM</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProgress;
