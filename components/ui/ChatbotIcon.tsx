import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

interface ChatbotIconProps {
    width?: number;
    height?: number;
}

export function ChatbotIcon({ width = 40, height = 36 }: ChatbotIconProps) {
    return (
        <View style={[styles.container, { width, height }]}>
            <Svg width={width} height={height} viewBox="0 0 200 180" fill="none">
                <Defs>
                    <RadialGradient id="bg" cx="50%" cy="50%" r="50%">
                        <Stop offset="0%" stopColor="#31006F" stopOpacity={0.98} />
                        <Stop offset="75.7%" stopColor="#080C21" stopOpacity={0.99} />
                        <Stop offset="99.5%" stopColor="#081124" />
                    </RadialGradient>

                    <LinearGradient id="bubble" x1="16.27" y1="91.71" x2="184.3" y2="91.71">
                        <Stop offset="0%" stopColor="#9957F1" />
                        <Stop offset="50%" stopColor="#86A8FF" />
                        <Stop offset="100%" stopColor="#2AF4FF" />
                    </LinearGradient>

                    <LinearGradient id="bolt" x1="73.39" y1="77.42" x2="128.1" y2="77.42">
                        <Stop offset="0%" stopColor="#86A8FF" />
                        <Stop offset="100%" stopColor="#2AF4FF" />
                    </LinearGradient>
                </Defs>

                {/* Background */}
                <Path d="M200 0H0v179.6h200V0z" fill="#081124" />
                <Path d="M199.9 0H.1v179.6h199.8V0z" fill="url(#bg)" />

                {/* Chat bubble */}
                <Path
                    d="M162.6 16.59h-124c-11.9 0-22.34 10.62-22.34 22.34v76.88c0 11.2 9.64 21.45 21.19 21.45h9.53v24.52c0 5.2 5.72 7.35 9.42 4.23l30.95-28.34h75.27c11.72 0 21.68-10.48 21.68-21.86V39.14c0-11.72-9.69-22.55-21.68-22.55zm16.62 99.22c0 9.48-7.84 16.87-16.62 16.87h-75.27c-1.24 0-2.44.47-3.37 1.31l-30.67 28.07c-.84.75-2.09.05-2.09-1.15V135.12c0-1.33-1.11-2.44-2.44-2.44H37.03c-9.48 0-16.73-8.08-16.73-16.87V38.93c0-9.48 8.03-16.91 17.28-16.91h124c9.48 0 16.62 8.34 16.62 17.12v76.67z"
                    fill="url(#bubble)"
                />

                {/* Lightning bolt */}
                <Path
                    d="M125.3 68.39h-18.69l8.08-31.08c.75-2.88-2.95-4.36-4.66-2.01l-36.1 47.68c-1.3 1.86-.19 3.96 2.06 3.87h18.83l-8.34 30.41c-.75 2.83 2.56 4.17 4.28 1.86l36.68-46.35c1.39-1.96.19-4.51-2.14-4.38zm-31.23 37.72 5.16-21c.52-1.95-.73-3.06-2.45-3.06H81.06l25.45-34.36-5.47 22.37c-.52 1.95.73 3.2 2.45 3.2h16.7l-26.12 32.85z"
                    fill="url(#bolt)"
                />
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
