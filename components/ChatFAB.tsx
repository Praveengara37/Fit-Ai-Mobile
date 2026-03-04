import { Pressable, StyleSheet } from 'react-native';
import { ChatbotIcon } from './ui/ChatbotIcon';

export function ChatFAB({ onPress }: { onPress: () => void }) {
    return (
        <Pressable style={styles.fab} onPress={onPress}>
            <ChatbotIcon width={32} height={29} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2a2235',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#9957F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
    },
});
