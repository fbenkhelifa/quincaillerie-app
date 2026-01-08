/**
 * Chart Components for Analytics
 * ===============================
 * SVG-based charts using Material-UI theming.
 */

import { useTheme, alpha, Box, Typography, Tooltip as MuiTooltip } from '@mui/material';

/**
 * LineChart - Simple line/area chart with multiple series support
 */
export function LineChart({ 
    data = [], 
    series = [], 
    height = 300, 
    showArea = true,
    showGrid = true,
    showLabels = true,
    xAxisKey = 'date',
    formatValue = (v) => v,
    formatLabel = (v) => v,
}) {
    const theme = useTheme();
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = 800;
    const chartHeight = height;

    if (!data.length || !series.length) {
        return (
            <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Aucune donnée disponible</Typography>
            </Box>
        );
    }

    // Calculate scales
    const allValues = series.flatMap(s => data.map(d => d[s.key] || 0));
    const maxValue = Math.max(...allValues, 0) * 1.1 || 1;
    const minValue = Math.min(...allValues, 0);

    const xScale = (index) => padding.left + (index / (data.length - 1 || 1)) * (chartWidth - padding.left - padding.right);
    const yScale = (value) => chartHeight - padding.bottom - ((value - minValue) / (maxValue - minValue || 1)) * (chartHeight - padding.top - padding.bottom);

    // Generate Y-axis ticks
    const yTicks = Array.from({ length: 5 }, (_, i) => minValue + (maxValue - minValue) * (i / 4));

    return (
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
                <defs>
                    {series.map((s, i) => (
                        <linearGradient key={`gradient-${i}`} id={`area-gradient-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={s.color || theme.palette.primary.main} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={s.color || theme.palette.primary.main} stopOpacity="0" />
                        </linearGradient>
                    ))}
                </defs>

                {/* Grid lines */}
                {showGrid && yTicks.map((tick, i) => (
                    <line
                        key={i}
                        x1={padding.left}
                        y1={yScale(tick)}
                        x2={chartWidth - padding.right}
                        y2={yScale(tick)}
                        stroke={theme.palette.divider}
                        strokeDasharray="4,4"
                    />
                ))}

                {/* Y-axis labels */}
                {showLabels && yTicks.map((tick, i) => (
                    <text
                        key={i}
                        x={padding.left - 10}
                        y={yScale(tick)}
                        textAnchor="end"
                        alignmentBaseline="middle"
                        fontSize={11}
                        fill={theme.palette.text.secondary}
                    >
                        {formatValue(tick)}
                    </text>
                ))}

                {/* Area fills */}
                {showArea && series.map((s, seriesIndex) => {
                    const points = data.map((d, i) => `${xScale(i)},${yScale(d[s.key] || 0)}`).join(' ');
                    const areaPoints = `${padding.left},${chartHeight - padding.bottom} ${points} ${xScale(data.length - 1)},${chartHeight - padding.bottom}`;
                    return (
                        <polygon
                            key={`area-${seriesIndex}`}
                            points={areaPoints}
                            fill={`url(#area-gradient-${seriesIndex})`}
                        />
                    );
                })}

                {/* Lines */}
                {series.map((s, seriesIndex) => {
                    const points = data.map((d, i) => `${xScale(i)},${yScale(d[s.key] || 0)}`).join(' ');
                    return (
                        <polyline
                            key={`line-${seriesIndex}`}
                            points={points}
                            fill="none"
                            stroke={s.color || theme.palette.primary.main}
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    );
                })}

                {/* Data points */}
                {series.map((s, seriesIndex) => 
                    data.map((d, i) => (
                        <circle
                            key={`point-${seriesIndex}-${i}`}
                            cx={xScale(i)}
                            cy={yScale(d[s.key] || 0)}
                            r={3}
                            fill={s.color || theme.palette.primary.main}
                        />
                    ))
                )}

                {/* X-axis labels */}
                {showLabels && data.filter((_, i) => i % Math.ceil(data.length / 7) === 0 || i === data.length - 1).map((d, i, arr) => {
                    const actualIndex = data.indexOf(d);
                    return (
                        <text
                            key={i}
                            x={xScale(actualIndex)}
                            y={chartHeight - padding.bottom + 20}
                            textAnchor="middle"
                            fontSize={10}
                            fill={theme.palette.text.secondary}
                        >
                            {formatLabel(d[xAxisKey])}
                        </text>
                    );
                })}
            </svg>
        </Box>
    );
}

/**
 * BarChart - Vertical bar chart with optional stacking
 */
export function BarChart({ 
    data = [], 
    series = [],
    height = 300,
    showLabels = true,
    showValues = false,
    formatValue = (v) => v,
    labelKey = 'label',
}) {
    const theme = useTheme();
    const padding = { top: 20, right: 20, bottom: 60, left: 60 };
    const chartWidth = Math.max(400, data.length * 60);
    const chartHeight = height;

    if (!data.length || !series.length) {
        return (
            <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Aucune donnée disponible</Typography>
            </Box>
        );
    }

    // Calculate scales
    const allValues = series.flatMap(s => data.map(d => d[s.key] || 0));
    const maxValue = Math.max(...allValues, 0) * 1.1 || 1;

    const barWidth = (chartWidth - padding.left - padding.right) / data.length * 0.6;
    const barGap = (chartWidth - padding.left - padding.right) / data.length * 0.4;
    
    const xScale = (index) => padding.left + index * (barWidth + barGap) + barGap / 2;
    const yScale = (value) => chartHeight - padding.bottom - (value / maxValue) * (chartHeight - padding.top - padding.bottom);

    // Y-axis ticks
    const yTicks = Array.from({ length: 5 }, (_, i) => (maxValue * i) / 4);

    return (
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                {/* Grid lines */}
                {yTicks.map((tick, i) => (
                    <g key={i}>
                        <line
                            x1={padding.left}
                            y1={yScale(tick)}
                            x2={chartWidth - padding.right}
                            y2={yScale(tick)}
                            stroke={theme.palette.divider}
                            strokeDasharray="4,4"
                        />
                        {showLabels && (
                            <text
                                x={padding.left - 10}
                                y={yScale(tick)}
                                textAnchor="end"
                                alignmentBaseline="middle"
                                fontSize={11}
                                fill={theme.palette.text.secondary}
                            >
                                {formatValue(tick)}
                            </text>
                        )}
                    </g>
                ))}

                {/* Bars */}
                {data.map((d, i) => {
                    const seriesWidth = barWidth / series.length;
                    return series.map((s, si) => {
                        const value = d[s.key] || 0;
                        const barHeight = (value / maxValue) * (chartHeight - padding.top - padding.bottom);
                        const x = xScale(i) + si * seriesWidth;
                        const y = yScale(value);
                        
                        return (
                            <g key={`bar-${i}-${si}`}>
                                <rect
                                    x={x}
                                    y={y}
                                    width={seriesWidth - 2}
                                    height={barHeight}
                                    fill={s.color || theme.palette.primary.main}
                                    rx={2}
                                />
                                {showValues && value > 0 && (
                                    <text
                                        x={x + seriesWidth / 2}
                                        y={y - 5}
                                        textAnchor="middle"
                                        fontSize={10}
                                        fill={theme.palette.text.secondary}
                                    >
                                        {formatValue(value)}
                                    </text>
                                )}
                            </g>
                        );
                    });
                })}

                {/* X-axis labels */}
                {showLabels && data.map((d, i) => (
                    <text
                        key={i}
                        x={xScale(i) + barWidth / 2}
                        y={chartHeight - padding.bottom + 15}
                        textAnchor="middle"
                        fontSize={10}
                        fill={theme.palette.text.secondary}
                        transform={`rotate(-45, ${xScale(i) + barWidth / 2}, ${chartHeight - padding.bottom + 15})`}
                    >
                        {d[labelKey]?.substring(0, 15) || ''}
                    </text>
                ))}
            </svg>
        </Box>
    );
}

/**
 * PieChart / DonutChart
 */
export function PieChart({ 
    data = [], 
    height = 250,
    donut = false,
    showLabels = true,
    showLegend = true,
    valueKey = 'value',
    labelKey = 'label',
    colorKey = 'color',
}) {
    const theme = useTheme();
    const size = height;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.35;
    const innerRadius = donut ? radius * 0.6 : 0;

    if (!data.length) {
        return (
            <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Aucune donnée disponible</Typography>
            </Box>
        );
    }

    const total = data.reduce((sum, d) => sum + (d[valueKey] || 0), 0);
    const defaultColors = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.success.main,
        theme.palette.warning.main,
        theme.palette.error.main,
        theme.palette.info.main,
        '#8884d8',
        '#82ca9d',
        '#ffc658',
        '#ff7c43',
    ];

    // Calculate slices
    let startAngle = -90;
    const slices = data.map((d, i) => {
        const value = d[valueKey] || 0;
        const percentage = total > 0 ? (value / total) * 100 : 0;
        const angle = (percentage / 100) * 360;
        const endAngle = startAngle + angle;
        const slice = {
            ...d,
            percentage,
            startAngle,
            endAngle,
            color: d[colorKey] || defaultColors[i % defaultColors.length],
        };
        startAngle = endAngle;
        return slice;
    });

    // Convert angle to radians and calculate arc path
    const polarToCartesian = (cx, cy, r, angle) => {
        const rad = (angle * Math.PI) / 180;
        return {
            x: cx + r * Math.cos(rad),
            y: cy + r * Math.sin(rad),
        };
    };

    const describeArc = (cx, cy, outerR, innerR, startAngle, endAngle) => {
        const start = polarToCartesian(cx, cy, outerR, endAngle);
        const end = polarToCartesian(cx, cy, outerR, startAngle);
        const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
        const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);
        const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

        if (innerR > 0) {
            return [
                `M ${start.x} ${start.y}`,
                `A ${outerR} ${outerR} 0 ${largeArc} 0 ${end.x} ${end.y}`,
                `L ${innerEnd.x} ${innerEnd.y}`,
                `A ${innerR} ${innerR} 0 ${largeArc} 1 ${innerStart.x} ${innerStart.y}`,
                'Z',
            ].join(' ');
        }
        return [
            `M ${cx} ${cy}`,
            `L ${start.x} ${start.y}`,
            `A ${outerR} ${outerR} 0 ${largeArc} 0 ${end.x} ${end.y}`,
            'Z',
        ].join(' ');
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {slices.map((slice, i) => (
                    <path
                        key={i}
                        d={describeArc(centerX, centerY, radius, innerRadius, slice.startAngle, slice.endAngle - 0.5)}
                        fill={slice.color}
                        stroke={theme.palette.background.paper}
                        strokeWidth={2}
                    />
                ))}
                {donut && (
                    <text
                        x={centerX}
                        y={centerY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={24}
                        fontWeight={600}
                        fill={theme.palette.text.primary}
                    >
                        {total.toLocaleString()}
                    </text>
                )}
            </svg>

            {showLegend && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {slices.map((slice, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                                sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: 0.5,
                                    backgroundColor: slice.color,
                                }}
                            />
                            <Typography variant="body2" color="text.secondary">
                                {slice[labelKey]} ({slice.percentage.toFixed(1)}%)
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}

/**
 * HorizontalBarChart - For rankings like top products
 */
export function HorizontalBarChart({
    data = [],
    height = 300,
    valueKey = 'value',
    labelKey = 'label',
    showValues = true,
    formatValue = (v) => v,
    color,
}) {
    const theme = useTheme();
    const barColor = color || theme.palette.primary.main;
    const barHeight = 28;
    const gap = 8;
    const padding = { left: 150, right: 80 };
    const chartWidth = 500;
    const chartHeight = Math.max(height, data.length * (barHeight + gap));

    if (!data.length) {
        return (
            <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Aucune donnée disponible</Typography>
            </Box>
        );
    }

    const maxValue = Math.max(...data.map(d => d[valueKey] || 0), 0) || 1;

    return (
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
                {data.map((d, i) => {
                    const value = d[valueKey] || 0;
                    const barWidth = (value / maxValue) * (chartWidth - padding.left - padding.right);
                    const y = i * (barHeight + gap);

                    return (
                        <g key={i}>
                            {/* Label */}
                            <text
                                x={padding.left - 10}
                                y={y + barHeight / 2}
                                textAnchor="end"
                                dominantBaseline="middle"
                                fontSize={12}
                                fill={theme.palette.text.primary}
                            >
                                {(d[labelKey] || '').substring(0, 20)}
                            </text>

                            {/* Background bar */}
                            <rect
                                x={padding.left}
                                y={y}
                                width={chartWidth - padding.left - padding.right}
                                height={barHeight}
                                fill={alpha(barColor, 0.1)}
                                rx={4}
                            />

                            {/* Value bar */}
                            <rect
                                x={padding.left}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill={barColor}
                                rx={4}
                            />

                            {/* Value label */}
                            {showValues && (
                                <text
                                    x={padding.left + barWidth + 8}
                                    y={y + barHeight / 2}
                                    textAnchor="start"
                                    dominantBaseline="middle"
                                    fontSize={11}
                                    fontWeight={600}
                                    fill={theme.palette.text.secondary}
                                >
                                    {formatValue(value)}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </Box>
    );
}

/**
 * HeatmapChart - For hourly sales or activity patterns
 */
export function HeatmapChart({
    data = [], // Array of { hour, dayOfWeek, value }
    height = 200,
    valueKey = 'value',
    formatValue = (v) => v,
}) {
    const theme = useTheme();
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const cellSize = 20;
    const padding = { left: 40, top: 30 };
    const chartWidth = padding.left + hours.length * cellSize;
    const chartHeight = padding.top + days.length * cellSize;

    // Create matrix
    const matrix = {};
    data.forEach(d => {
        const key = `${d.dayOfWeek || 0}-${d.hour || 0}`;
        matrix[key] = d[valueKey] || 0;
    });

    const maxValue = Math.max(...Object.values(matrix), 1);

    const getColor = (value) => {
        const intensity = value / maxValue;
        return alpha(theme.palette.primary.main, intensity * 0.8 + 0.1);
    };

    return (
        <Box sx={{ overflowX: 'auto' }}>
            <svg width={chartWidth} height={chartHeight}>
                {/* Hour labels */}
                {hours.filter(h => h % 4 === 0).map(h => (
                    <text
                        key={`h-${h}`}
                        x={padding.left + h * cellSize + cellSize / 2}
                        y={20}
                        textAnchor="middle"
                        fontSize={10}
                        fill={theme.palette.text.secondary}
                    >
                        {h}h
                    </text>
                ))}

                {/* Day labels */}
                {days.map((day, i) => (
                    <text
                        key={`d-${i}`}
                        x={padding.left - 8}
                        y={padding.top + i * cellSize + cellSize / 2}
                        textAnchor="end"
                        dominantBaseline="middle"
                        fontSize={10}
                        fill={theme.palette.text.secondary}
                    >
                        {day}
                    </text>
                ))}

                {/* Cells */}
                {days.map((_, dayIndex) =>
                    hours.map(hour => {
                        const value = matrix[`${dayIndex}-${hour}`] || 0;
                        return (
                            <rect
                                key={`cell-${dayIndex}-${hour}`}
                                x={padding.left + hour * cellSize}
                                y={padding.top + dayIndex * cellSize}
                                width={cellSize - 2}
                                height={cellSize - 2}
                                fill={getColor(value)}
                                rx={2}
                            >
                                <title>{`${days[dayIndex]} ${hour}h: ${formatValue(value)}`}</title>
                            </rect>
                        );
                    })
                )}
            </svg>
        </Box>
    );
}

export default { LineChart, BarChart, PieChart, HorizontalBarChart, HeatmapChart };
