// frontend/src/components/shared/Charts.jsx
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#00B4A6','#0A1628','#3B82F6','#8B5CF6','#EC4899','#F59E0B','#10B981','#6B7280'];

// Daily volume: navy total, teal resolved
export function VolumeLineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} interval={4} />
        <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="total"    stroke="#0A1628" strokeWidth={2} dot={false} name="Total" />
        <Line type="monotone" dataKey="resolved" stroke="#00B4A6" strokeWidth={2} dot={false} strokeDasharray="5 3" name="Resolved" />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Product donut
export function ProductDonutChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="product" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v, n) => [v, n]} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Sentiment grouped bar
export function SentimentBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis dataKey="product" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
        <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(v) => [v]}
          labelFormatter={l => `${l} · Sentiment from FinBERT finance-domain analysis (Layer 2)`}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="frustrated" fill="#DC2626" name="Frustrated" radius={[3,3,0,0]} />
        <Bar dataKey="neutral"    fill="#9CA3AF" name="Neutral"    radius={[3,3,0,0]} />
        <Bar dataKey="satisfied"  fill="#16A34A" name="Satisfied"  radius={[3,3,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Top complaint types horizontal bar
export function TopTypesChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, left: 80, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
        <YAxis type="category" dataKey="type" tick={{ fontSize: 11, fill: '#374151' }} width={80} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          labelFormatter={l => `${l} · Classified by DistilBERT 4-head NLP pipeline (Layer 2)`}
        />
        <Bar dataKey="count" fill="#0A1628" radius={[0,3,3,0]} label={{ position: 'right', fontSize: 11, fill: '#374151' }} />
      </BarChart>
    </ResponsiveContainer>
  );
}
