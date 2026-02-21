import { Colors } from '@/constants/Colors';
import { DailySteps } from '@/types';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

interface WeeklyChartProps {
    history: DailySteps[];
    goalSteps?: number;
}

const screenWidth = Dimensions.get('window').width;

export default function WeeklyChart({ history, goalSteps = 10000 }: WeeklyChartProps) {
    if (!history || history.length === 0) return null;

    // The PRD specs show newest at index 0, oldest at index 6. We reverse this to read Left->Right (Oldest->Newest) for the chart
    const chronologicalHistory = [...history].reverse();

    const labels = chronologicalHistory.map(day => {
        const d = new Date(day.date);
        return d.toLocaleDateString(undefined, { weekday: 'narrow' }); // Returns M, T, W, T, F...
    });

    const dataset = chronologicalHistory.map(day => day.steps);

    const chartData = {
        labels: labels,
        datasets: [
            {
                data: dataset,
                colors: chronologicalHistory.map((day) =>
                    // Color override for individual bars via array map
                    (opacity = 1) => day.steps >= goalSteps ? Colors.success : Colors.purple
                )
            }
        ]
    };

    return (
        <View style={styles.container}>
            <BarChart
                data={chartData}
                width={screenWidth - 40} // Margin padding compensation
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                withCustomBarColorFromData={true}
                flatColor={true}
                chartConfig={{
                    backgroundColor: Colors.card,
                    backgroundGradientFrom: Colors.card,
                    backgroundGradientTo: Colors.card,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`, // Fallback color
                    labelColor: (opacity = 1) => Colors.gray[400],
                    style: {
                        borderRadius: 16,
                    },
                    barPercentage: 0.6,
                }}
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
                withInnerLines={false}
                showBarTops={false}
                fromZero={true}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 10,
    }
});
