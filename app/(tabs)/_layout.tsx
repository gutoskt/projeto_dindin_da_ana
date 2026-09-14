import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useState } from 'react';
import { Modal, TouchableOpacity, View, Text, StyleSheet } from 'react-native';

export default function TabsLayout() {
    const [menuVisivel, setMenuVisivel] = useState(false);

    return (
        // Envolvemos tudo com <> e </>
        <>
            <Tabs 
                initialRouteName="index"
                screenOptions={{
                    headerShown: true,
                    headerTitle: 'Meu Dindin',
                    headerStyle: {
                        height: 80,
                        backgroundColor: '#1C6652',
                    },
                    headerTintColor: '#fff',
                    headerRight: () => (
                        <TouchableOpacity 
                            style={{ marginRight: 20 }} 
                            onPress={() => setMenuVisivel(true)}
                        >
                            <Ionicons name="menu" size={32} color="#fff" />
                        </TouchableOpacity>
                    ),
                    tabBarActiveTintColor: '#E3E9E5',
                    tabBarInactiveTintColor: '#8A938F',
                    tabBarStyle: {
                        alignSelf: 'center',
                        backgroundColor: '#1D6B5B',
                        borderTopColor: '#E3E9E5',
                        height: 68,
                        paddingBottom: 8,
                        paddingTop: 8,
                        marginBottom: 16,
                        width: 280,
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        borderBottomLeftRadius: 16,
                        borderBottomRightRadius: 16,
                    },
                    tabBarLabelStyle: {
                        fontSize: 11,
                        fontWeight: '600',
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="home-outline" color={color} size={size} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="history"
                    options={{
                        title: 'Histórico',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="time-outline" color={color} size={size} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="receitas"
                    options={{
                        title: 'Receitas',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="trending-up-outline" color={color} size={size} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="relatorio"
                    options={{
                        title: 'Relatório',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="bar-chart-outline" color={color} size={size} />
                        ),
                    }}
                />
            </Tabs>

            {/* O Modal (Menu Pop-up) agora está aqui, logo abaixo do Tabs */}
            <Modal
                visible={menuVisivel}
                transparent={true}
                animationType="fade"
            >
                <TouchableOpacity 
                    style={styles.fundoEscuro} 
                    activeOpacity={1} 
                    onPress={() => setMenuVisivel(false)}
                >
                    <View style={styles.caixaMenu}>
                        <TouchableOpacity onPress={() => console.log('Clicou no Perfil')}>
                            <Text style={styles.itemMenu}>👤 Meu Perfil</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={() => console.log('Clicou nas Configurações')}>
                            <Text style={styles.itemMenu}>⚙️ Configurações</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
  fundoEscuro: {
    flex: 1,
    alignItems: 'flex-end',
  },
  caixaMenu: {
    backgroundColor: '#fff',
    marginTop: 85,
    marginRight: 15,
    padding: 20,
    borderRadius: 8,
    width: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  itemMenu: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});