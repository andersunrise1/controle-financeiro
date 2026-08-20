import { ScrollView, useWindowDimensions } from "react-native";
import Svg, { G, Rect, Text as SvgText, Line, Defs, LinearGradient, Stop } from "react-native-svg";
import { colors } from "../theme";

const CHART_HEIGHT = 220;
const AXIS_LEFT = 44;
const AXIS_BOTTOM = 26;
const TOP_PAD = 14;
const GROUP_MIN_WIDTH = 60;

// Shared SVG bar-chart primitive behind all 3 charts (Gastos por Ano,
// Entradas vs Saídas, Gastos por Categoria) — hand-built on react-native-svg
// rather than a charting library, since this project has already hit two
// real cross-platform native-rendering surprises this roadmap (MaskedView,
// the Picker background bug) that only showed up on a real device or after
// close inspection. react-native-svg is the one piece already proven
// reliable end to end.
//
// Simplified vs. the web version: no hover/tap tooltip yet (web shows exact
// values on hover) — values are still readable from the axis and bar
// height. A real, disclosed simplification, not an oversight.
export default function GroupedBarChart({ data, barWidth = 18, barGap = 4, formatY = (v) => v }) {
  const { width: screenWidth } = useWindowDimensions();

  if (data.length === 0) return null;

  const seriesCount = data[0].bars.length || 1;
  const groupWidth = Math.max(GROUP_MIN_WIDTH, seriesCount * (barWidth + barGap) + 16);
  const chartWidth = Math.max(screenWidth - 64, data.length * groupWidth);
  const plotHeight = CHART_HEIGHT - TOP_PAD - AXIS_BOTTOM;

  const maxValue = Math.max(1, ...data.flatMap((d) => d.bars.map((b) => b.value))) * 1.15;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => maxValue * f);

  const gradientDefs = [];
  data.forEach((group) => {
    group.bars.forEach((bar) => {
      if (bar.gradientId && bar.gradient && !gradientDefs.find((g) => g.id === bar.gradientId)) {
        gradientDefs.push({ id: bar.gradientId, stops: bar.gradient });
      }
    });
  });

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Svg width={chartWidth} height={CHART_HEIGHT}>
        <Defs>
          {gradientDefs.map((g) => (
            <LinearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={g.stops[0]} />
              <Stop offset="1" stopColor={g.stops[1]} />
            </LinearGradient>
          ))}
        </Defs>

        {yTicks.map((tick, i) => {
          const y = TOP_PAD + plotHeight - (tick / maxValue) * plotHeight;
          return (
            <Line key={i} x1={AXIS_LEFT} x2={chartWidth} y1={y} y2={y} stroke={colors.inputBorder} strokeWidth={1} opacity={0.4} />
          );
        })}
        {yTicks.map((tick, i) => {
          const y = TOP_PAD + plotHeight - (tick / maxValue) * plotHeight;
          return (
            <SvgText key={i} x={AXIS_LEFT - 8} y={y + 4} fontSize={10} fill={colors.textFaint} textAnchor="end">
              {formatY(tick)}
            </SvgText>
          );
        })}

        {data.map((group, gi) => {
          const groupX = AXIS_LEFT + gi * groupWidth;
          const totalBarsWidth = seriesCount * barWidth + (seriesCount - 1) * barGap;
          const startX = groupX + (groupWidth - totalBarsWidth) / 2;
          return (
            <G key={group.label}>
              {group.bars.map((bar, bi) => {
                const barHeight = Math.max((bar.value / maxValue) * plotHeight, 0);
                const x = startX + bi * (barWidth + barGap);
                const y = TOP_PAD + plotHeight - barHeight;
                return (
                  <Rect
                    key={bar.key}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx={4}
                    fill={bar.gradientId ? `url(#${bar.gradientId})` : bar.color}
                  />
                );
              })}
              <SvgText x={groupX + groupWidth / 2} y={CHART_HEIGHT - 8} fontSize={10} fill={colors.textFaint} textAnchor="middle">
                {group.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </ScrollView>
  );
}
