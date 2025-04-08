import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Repo {
  id: number;
  name: string;
  html_url: string;
}

interface CommitData {
  date: string;
  count: number;
}

const GitHubUserAnalyzer = () => {
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [commitData, setCommitData] = useState<CommitData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.github.com/users/${username}/repos`);
      const data = await res.json();
      setRepos(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchCommits = async () => {
    try {
      const res = await fetch(
        `https://api.github.com/users/${username}/events/public`
      );
      const events = await res.json();
      const commitsPerDay: { [key: string]: number } = {};

      events.forEach((event: any) => {
        if (event.type === "PushEvent") {
          const date = new Date(event.created_at).toISOString().split("T")[0];
          commitsPerDay[date] =
            (commitsPerDay[date] || 0) + event.payload.commits.length;
        }
      });

      const formattedData = Object.entries(commitsPerDay).map(
        ([date, count]) => ({ date, count })
      );
      setCommitData(formattedData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyze = async () => {
    await fetchRepos();
    await fetchCommits();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">GitHub User Profile Analyzer</h1>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Enter GitHub username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Button onClick={handleAnalyze} disabled={loading}>
          {loading ? "Loading..." : "Analyze"}
        </Button>
      </div>

      {repos.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-2">Repositories</h2>
            <ul className="list-disc pl-5">
              {repos.map((repo) => (
                <li key={repo.id}>
                  <a
                    href={repo.html_url}
                    className="text-blue-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {repo.name}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {commitData.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-4">Daily Commits</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={commitData}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GitHubUserAnalyzer;
