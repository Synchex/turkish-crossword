import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../src/theme/colors';
import { radius } from '../../src/theme/radius';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarLabelStyle: styles.tabLabel,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Ana Sayfa',
                    tabBarIcon: ({ color }) => (
                        <Text style={[styles.tabIcon, { color }]}>🏠</Text>
                    ),
                }}
            />
            <Tabs.Screen
                name="questions"
                options={{
                    title: 'Sorular',
                    tabBarIcon: ({ color }) => (
                        <Text style={[styles.tabIcon, { color }]}>📋</Text>
                    ),
                }}
            />
            <Tabs.Screen
                name="stats"
                options={{
                    title: 'İstatistik',
                    tabBarIcon: ({ color }) => (
                        <Text style={[styles.tabIcon, { color }]}>📊</Text>
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        height: 70,
        paddingBottom: 8,
        paddingTop: 8,
        elevation: 8,
        shadowColor: colors.primaryDark,
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 12,
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    tabIcon: {
        fontSize: 22,
    },
});
