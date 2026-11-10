import React, { useState, useRef, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TextInput, 
    TouchableOpacity, 
    Keyboard, 
    TouchableWithoutFeedback,
    ActivityIndicator,
    Modal,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MainLayout from '../components/MainLayout';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../constants/theme';
import client from '../api/client';

export default function SupportScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' });

    // Estado para controlar la visibilidad del chat y la altura del teclado
    const [chatOpen, setChatOpen] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    // Scroll automático en el chat
    const chatScrollViewRef = useRef(null);

    useEffect(() => {
        const showSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (event) => {
                setKeyboardHeight(event.endCoordinates.height);
                setTimeout(() => {
                    chatScrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        );
        const hideSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
            }
        );

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    // ACORDEÓN DE FAQ
    const [expandedFaq, setExpandedFaq] = useState(null);
    const faqs = [
        { 
            id: 1, 
            question: '¿Cómo puedo reservar un alojamiento o actividad?', 
            answer: 'Explora un destino, selecciona la actividad o alojamiento deseado, elige fecha y número de personas, y toca "Agregar" para acumularlo en tus selecciones antes de confirmar tu itinerario.' 
        },
        { 
            id: 2, 
            question: '¿Cómo publico o busco reseñas?', 
            answer: 'Puedes ir a la pestaña de Reseñas desde la barra inferior o el menú lateral. Ahí podrás buscar por nombre de destino/autor y utilizar el botón flotante (+) para crear una reseña de los lugares que has visitado.' 
        },
        { 
            id: 3, 
            question: '¿Qué hago si tengo problemas con mi cuenta?', 
            answer: 'Puedes comunicarte directamente con los administradores de la aplicación utilizando el formulario de comentarios al final de esta pantalla.' 
        },
    ];

    const toggleFaq = (id) => {
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    // CHAT SIMULADO
    const [chatMessages, setChatMessages] = useState([
        { id: 1, sender: 'bot', text: '¡Hola! Soy el asistente virtual de Rincón Guanaco. ¿En qué puedo ayudarte hoy?' }
    ]);
    const [inputMessage, setInputMessage] = useState('');

    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;

        const userText = inputMessage;
        const newMsgUser = { id: Date.now(), sender: 'user', text: userText };
        
        setChatMessages(prev => [...prev, newMsgUser]);
        setInputMessage('');

        setTimeout(() => {
            chatScrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);

        setTimeout(() => {
            let botReply = 'Entiendo lo que mencionas. Si es un inconveniente específico con tu cuenta o la aplicación, recuerda que puedes usar el formulario de "Contáctanos" aquí abajito para escribirnos directamente.';
            const lower = userText.toLowerCase();

            if (lower.includes('hola') || lower.includes('buenos días') || lower.includes('buenas tardes') || lower.includes('saludos')) {
                botReply = '¡Hola! Qué gusto saludarte. ¿En qué puedo guiarte hoy dentro de Rincón Guanaco?';
            } else if (lower.includes('itinerario') || lower.includes('viaje') || lower.includes('plan') || lower.includes('guardar')) {
                botReply = 'Para ver o gestionar tus viajes programados, dirígete a la sección "Mi Itinerario" desde el menú lateral o la barra inferior de navegación.';
            } else if (lower.includes('reserv') || lower.includes('actividad') || lower.includes('alojamiento') || lower.includes('hotel')) {
                botReply = 'Puedes agregar actividades y alojamientos explorando los diferentes destinos turísticos de El Salvador y tocando el botón "Agregar" en cada opción.';
            } else if (lower.includes('reseña') || lower.includes('comentario') || lower.includes('calificar') || lower.includes('opinión')) {
                botReply = 'Para ver o escribir reseñas de los lugares turísticos, entra al apartado de "Reseñas". Desde ahí puedes buscar un destino específico o agregar tu propia experiencia.';
            } else if (lower.includes('cuenta') || lower.includes('contraseña') || lower.includes('login') || lower.includes('sesión') || lower.includes('error')) {
                botReply = 'Si tienes problemas de acceso o con tu cuenta, te recomiendo cerrar sesión y volver a ingresar. Si el problema persiste, envíanos un reporte detallado con el formulario de abajo.';
            } else if (lower.includes('gracias') || lower.includes('muchas gracias') || lower.includes('excelente')) {
                botReply = '¡Con mucho gusto! Estoy aquí para ayudarte a disfrutar al máximo tu recorrido por El Salvador. ¿Hay algo más en lo que te pueda asistir?';
            }

            const newMsgBot = { id: Date.now() + 1, sender: 'bot', text: botReply };
            setChatMessages(prev => [...prev, newMsgBot]);

            setTimeout(() => {
                chatScrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }, 800);
    };

    // FORMULARIO DE COMENTARIOS / CORREO 
    const [supportComment, setSupportComment] = useState('');
    const [sending, setSending] = useState(false);

    const handleSendSupportEmail = async () => {
        if (!supportComment.trim()) {
            setModalConfig({
                title: 'Campo vacío',
                message: 'Por favor escribe tu comentario o inconveniente antes de enviar.',
                type: 'error'
            });
            setModalVisible(true);
            return;
        }

        setSending(true);
        try {
            await client.post('/support/message', { message: supportComment });
            setModalConfig({
                title: '¡Mensaje Enviado!',
                message: 'Los administradores se pondrán en contacto contigo pronto.',
                type: 'success'
            });
            setModalVisible(true);
            setSupportComment('');
            Keyboard.dismiss();
        } catch (error) {
            console.error('Error al enviar soporte:', error);
            setModalConfig({
                title: 'Error de Envío',
                message: 'Hubo un error al enviar el mensaje. Inténtalo más tarde.',
                type: 'error'
            });
            setModalVisible(true);
        } finally {
            setSending(false);
        }
    };

   return (
        <MainLayout title="Soporte y Ayuda">
            <View style={{ flex: 1, position: 'relative' }}>
                <ScrollView 
                    contentContainerStyle={styles.container} 
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    
                    {/* SECCIÓN 1: PREGUNTAS FRECUENTES (Acordeón) */}
                    <Text style={styles.sectionTitle}>Preguntas Frecuentes</Text>
                    {faqs.map((faq) => {
                        const isExpanded = expandedFaq === faq.id;
                        return (
                            <View key={faq.id} style={styles.faqCard}>
                                <TouchableOpacity 
                                    style={styles.faqHeader} 
                                    onPress={() => toggleFaq(faq.id)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                                    <Ionicons 
                                        name={isExpanded ? "chevron-up" : "chevron-down"} 
                                        size={20} 
                                        color={COLORS.primary} 
                                    />
                                </TouchableOpacity>
                                {isExpanded && (
                                    <View style={styles.faqBody}>
                                        <Text style={styles.faqAnswer}>{faq.answer}</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}

                    {/* SECCIÓN 2: ENVIAR COMENTARIO A ADMINISTRADOR */}
                    <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>Contáctanos</Text>
                    <View style={styles.contactCard}>
                        <Text style={styles.contactSubtitle}>
                            ¿Tienes algún problema o sugerencia? Envía un mensaje directo al equipo de administración.
                        </Text>
                        <TextInput 
                            style={styles.textArea}
                            multiline
                            numberOfLines={4}
                            placeholder="Escribe tu comentario aquí..."
                            placeholderTextColor={COLORS.textMuted}
                            value={supportComment}
                            onChangeText={setSupportComment}
                            textAlignVertical="top"
                        />
                        <TouchableOpacity 
                            style={styles.submitButton} 
                            onPress={handleSendSupportEmail}
                            disabled={sending}
                        >
                            {sending ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.submitText}>Enviar a Administradores</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                </ScrollView>

                {/* --- CHAT PANTALLA COMPLETA CON AJUSTE DINÁMICO DE TECLADO --- */}
                {chatOpen && (
                    <View style={[styles.floatingChatContainer, { bottom: keyboardHeight > 0 ? keyboardHeight : 0 }]}>
                        {/* Cabecera del chat */}
                        <View style={styles.floatingChatHeader}>
                            <View style={styles.chatHeaderTitleContainer}>
                                <View style={styles.onlineDot} />
                                <Text style={styles.floatingChatHeaderText}>Asistente Virtual</Text>
                            </View>
                            <TouchableOpacity onPress={() => setChatOpen(false)} style={styles.closeChatButton}>
                                <Ionicons name="close" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Contenido del Chat con Auto-Scroll */}
                        <ScrollView 
                            ref={chatScrollViewRef}
                            style={styles.chatScroll} 
                            contentContainerStyle={{ padding: SPACING.md, paddingBottom: 20 }}
                            nestedScrollEnabled={true}
                            keyboardShouldPersistTaps="handled"
                            onContentSizeChange={() => chatScrollViewRef.current?.scrollToEnd({ animated: true })}
                        >
                            {chatMessages.map((msg) => (
                                <View 
                                    key={msg.id} 
                                    style={[
                                        styles.chatBubble, 
                                        msg.sender === 'user' ? styles.userBubble : styles.botBubble
                                    ]}
                                >
                                    <Text style={[
                                        styles.chatText, 
                                        msg.sender === 'user' ? styles.userText : styles.botText
                                    ]}>
                                        {msg.text}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>

                        {/* Input del Chat */}
                        <View style={styles.chatInputContainer}>
                            <TextInput 
                                style={styles.chatInput}
                                placeholder="Escribe tu consulta..."
                                placeholderTextColor={COLORS.textMuted}
                                value={inputMessage}
                                onChangeText={setInputMessage}
                                onSubmitEditing={handleSendMessage}
                                returnKeyType="send"
                            />
                            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                                <Ionicons name="send" size={18} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Botón flotante para abrir el chat */}
                {!chatOpen && (
                    <TouchableOpacity 
                        style={styles.floatingButton} 
                        onPress={() => setChatOpen(true)}
                        activeOpacity={0.85}
                    >
                        <Ionicons 
                            name="chatbubble-ellipses" 
                            size={24} 
                            color={COLORS.white} 
                        />
                    </TouchableOpacity>
                )}

                {/* MODAL PERSONALIZADO DE ALERTA */}
                <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <View style={styles.overlay}>
                            <TouchableWithoutFeedback onPress={() => {}}>
                                <View style={styles.modalContainer}>
                                    <Ionicons 
                                        name={modalConfig.type === 'success' ? "checkmark-circle" : "alert-circle"} 
                                        size={55} 
                                        color={modalConfig.type === 'success' ? COLORS.primary : "#EF4444"} 
                                        style={{ marginBottom: SPACING.md }}
                                    />
                                    <Text style={styles.modalTitle}>{modalConfig.title}</Text>
                                    
                                    <View style={styles.contentBox}>
                                        <Text style={styles.modalMessage}>{modalConfig.message}</Text>
                                    </View>

                                    <TouchableOpacity 
                                        style={[styles.acceptModalButton, { backgroundColor: modalConfig.type === 'success' ? COLORS.accent : "#EF4444" }]} 
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <Text style={styles.acceptModalText}>Entendido</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </View>
        </MainLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: SPACING.lg,
        paddingBottom: 40,
        backgroundColor: COLORS.background,
    },
    sectionTitle: {
        fontFamily: FONTS.heading,
        fontSize: 18,
        color: COLORS.primary,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
    },
    // Estilos FAQ (Acordeón)
    faqCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
    },
    faqQuestion: {
        fontFamily: FONTS.heading,
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '600',
        flex: 1,
        marginRight: SPACING.sm,
    },
    faqBody: {
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.md,
        backgroundColor: '#F9FAFB',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: SPACING.sm,
    },
    faqAnswer: {
        fontFamily: FONTS.body,
        fontSize: 14,
        color: COLORS.textMuted,
        lineHeight: 20,
    },
    // Estilos Botón Flotante del Chat
    floatingButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        zIndex: 100,
    },
    // Estilos Contenedor Chat
    floatingChatContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        zIndex: 99,
        elevation: 10,
    },
    floatingChatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: 16,
        backgroundColor: '#F3F4F6',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    chatHeaderTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    onlineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#10B981',
        marginRight: 10,
    },
    floatingChatHeaderText: {
        fontFamily: FONTS.heading,
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    closeChatButton: {
        padding: 4,
    },
    chatScroll: {
        flex: 1,
    },
    chatBubble: {
        maxWidth: '80%',
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.sm,
    },
    userBubble: {
        backgroundColor: COLORS.accent,
        alignSelf: 'flex-end',
    },
    botBubble: {
        backgroundColor: '#F3F4F6',
        alignSelf: 'flex-start',
    },
    chatText: {
        fontFamily: FONTS.body,
        fontSize: 14,
    },
    userText: {
        color: COLORS.white,
    },
    botText: {
        color: COLORS.text,
    },
    chatInputContainer: {
        flexDirection: 'row',
        padding: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        backgroundColor: COLORS.white,
        alignItems: 'center',
    },
    chatInput: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: RADIUS.pill,
        paddingHorizontal: SPACING.md,
        height: 45,
        fontSize: 14,
        color: COLORS.text,
    },
    sendButton: {
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        width: 42,
        height: 42,
        borderRadius: 21,
        marginLeft: SPACING.sm,
    },
    // Estilos Formulario de Contacto
    contactCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.card,
    },
    contactSubtitle: {
        fontFamily: FONTS.body,
        fontSize: 14,
        color: COLORS.textMuted,
        marginBottom: SPACING.md,
    },
    textArea: {
        backgroundColor: '#F3F4F6',
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        height: 100,
        fontFamily: FONTS.body,
        fontSize: 14,
        color: COLORS.text,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    submitButton: {
        backgroundColor: COLORS.accent,
        paddingVertical: 14,
        borderRadius: RADIUS.md,
        alignItems: 'center',
    },
    submitText: {
        color: COLORS.white,
        fontFamily: FONTS.heading,
        fontSize: 15,
        fontWeight: 'bold',
    },
    // Estilos del Modal
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(33, 37, 41, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    modalContainer: {
        backgroundColor: COLORS.white,
        width: '100%',
        borderRadius: RADIUS.lg,
        padding: SPACING.xl,
        alignItems: 'center',
    },
    modalTitle: {
        fontFamily: FONTS.heading,
        fontSize: 22,
        color: COLORS.text,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    contentBox: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: RADIUS.md,
        padding: SPACING.lg,
        marginBottom: SPACING.xl,
        width: '100%',
    },
    modalMessage: {
        fontFamily: FONTS.body,
        fontSize: 15,
        color: COLORS.text,
        textAlign: 'center',
        lineHeight: 22,
    },
    acceptModalButton: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: RADIUS.md,
        alignItems: 'center',
    },
    acceptModalText: {
        color: COLORS.white,
        fontFamily: FONTS.heading,
        fontSize: 16,
        fontWeight: 'bold',
    }
});