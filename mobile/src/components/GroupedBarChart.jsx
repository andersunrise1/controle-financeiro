import { useEffect, useRef } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import Svg, { G, Rect, Text as SvgText, Line, Defs, LinearGradient, Stop } from "react-native-svg";
import { useTheme } from "../context/ThemeContext";

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
//
// onGroupPress (optional) is called with the tapped group's own data object
// when provided — used by YearlyChart to let the user tap a year and see
// its total, mirroring the web version's click-to-select behavior. Each
// bar's own `opacity` (if set) lets the caller dim unselected groups.
//
// focusIndex (optional) is the group the chart should open on when it is
// wider than the screen. A twelve-month chart only fits about seven columns,
// so without this it opens on January — which for most of the year is empty.
// The person then sees a blank chart with no hint that their data is a swipe
// away, because the scroll indicator only appears once you already scroll.
// Opening at the far end instead shows the recent months, which is what a
// spending trend is read for, and the bars cut off at the left edge are
// themselves the hint that there is more to the left.
export default function GroupedBarChart({
  data,
  barWidth = 18,
  barGap = 4,
  formatY = (v) => v,
  onGroupPress,
  focusIndex,
}) {
  const { width: screenWidth } = useWindowDimensions();
  const { colors } = useTheme();
  const scrollRef = useRef(null);

  const groupCount = data.length;
  const seriesPerGroup = groupCount > 0 ? data[0].bars.length || 1 : 1;
  const groupW = Math.max(GROUP_MIN_WIDTH, seriesPerGroup * (barWidth + barGap) + 16);
  const visibleWidth = screenWidth - 64;

  useEffect(() => {
    if (focusIndex == null || !scrollRef.current) return;
    // Bring the focused group to the right edge, so the months leading up to
    // it stay on screen as context.
    const x = AXIS_LEFT + (focusIndex + 1) * groupW - visibleWidth;
    if (x > 0) scrollRef.current.scrollTo({ x, animated: false });
  }, [focusIndex, groupW, visibleWidth]);

  if (data.length === 0) return null;

  const seriesCount = seriesPerGroup;
  const groupWidth = groupW;
  const chartWidth = Math.max(visibleWidth, data.length * groupWidth);
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
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={chartWidth > visibleWidth}
    >
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
              {onGroupPress && (
                <Rect
                  x={groupX}
                  y={0}
                  width={groupWidth}
                  height={CHART_HEIGHT}
                  fill="transparent"
                  onPress={() => onGroupPress(group)}
                />
              )}
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
                    opacity={bar.opacity ?? 1}
                    fill={bar.gradientId ? `url(#${bar.gradientId})` : bar.color}
                    pointerEvents="none"
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
