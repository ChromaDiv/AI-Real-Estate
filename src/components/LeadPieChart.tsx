"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface LeadPieChartProps {
    hot: number;
    warm: number;
    spam: number;
}

const COLORS = {
    Hot: "#34d399",   // emerald-400
    Warm: "#fbbf24",  // amber-400
    Spam: "#f87171",  // red-400
};

export function LeadPieChart({ hot, warm, spam }: LeadPieChartProps) {
    const data = [
        { name: "Hot", value: hot },
        { name: "Warm", value: warm },
        { name: "Spam", value: spam },
    ].filter((d) => d.value > 0);

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center py-8 text-sm text-white/30">
                No lead data yet
            </div>
        );
    }

    return (
        <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                        strokeWidth={0}
                    >
                        {data.map((entry) => (
                            <Cell
                                key={entry.name}
                                fill={COLORS[entry.name as keyof typeof COLORS]}
                                className="drop-shadow-lg"
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            background: "rgba(10, 10, 20, 0.9)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            color: "#fff",
                            fontSize: "13px",
                            backdropFilter: "blur(12px)",
                        }}
                        itemStyle={{ color: "#fff" }}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="mt-2 flex items-center justify-center gap-4">
                {data.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                        <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: COLORS[entry.name as keyof typeof COLORS] }}
                        />
                        <span className="text-xs text-white/50">
                            {entry.name} ({entry.value})
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
