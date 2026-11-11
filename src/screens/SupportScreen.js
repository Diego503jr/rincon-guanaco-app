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
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MainLayout from '../components/MainLayout';
import { SPACING, RADIUS, FONTS, SHADOWS } from '../constants/theme';
import { useTheme } from "../context/ThemeContext";
import { useThemedStyles } from "../hooks/useThemedStyles";
import client from '../api/client';

export default function SupportScreen() {
    const { colors, isDark } = useTheme();
    const styles = useThemedStyles(createStyles);

    // ESTADOS DEL MODAL PERSONALIZADO 
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' });

    // ESTADO PARA CONTROLAR LA VISIBILIDAD DEL CHAT 
    const [chatOpen, setChatOpen] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    // REFERENCIA PARA HACER SCROLL AUTOMÁTICO EN EL CHAT 
    const chatScrollViewRef = useRef(null);

    // ESCUCHAS NATIVAS DEL TECLADO 
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
    const mainScrollViewRef = useRef(null);

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

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                    <ScrollView
                        ref={mainScrollViewRef}
                        contentContainerStyle={styles.container}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* SECCIÓN 1: PREGUNTAS FRECUENTES */}
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
                                            color={colors.primaryText}
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
                                placeholderTextColor={colors.textMuted}
                                value={supportComment}
                                onChangeText={setSupportComment}
                                textAlignVertical="top"
                                onFocus={() => {
                                    setTimeout(() => {
                                        mainScrollViewRef.current?.scrollToEnd({ animated: true });
                                    }, 100);
                                }}
                            />
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleSendSupportEmail}
                                disabled={sending}
                            >
                                {sending ? (
                                    <ActivityIndicator color={colors.white} />
                                ) : (
                                    <Text style={styles.submitText}>Enviar a Administradores</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {chatOpen && (
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 140 : 40} // 👈 Sube estos valores si el input sigue tapado
                        style={styles.floatingChatContainer}
                    >
                        {/* Cabecera del chat */}
                        <View style={styles.floatingChatHeader}>
                            <View style={styles.chatHeaderTitleContainer}>
                                <View style={styles.onlineDot} />
                                <Text style={styles.floatingChatHeaderText}>Asistente Virtual</Text>
                            </View>
                            <TouchableOpacity onPress={() => setChatOpen(false)} style={styles.closeChatButton}>
                                <Ionicons name="close" size={24} color={colors.text} />
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
                        <View style={[styles.chatInputContainer, { paddingBottom: Platform.OS === 'ios' ? 25 : 15 }]}>
                            <TextInput
                                style={styles.chatInput}
                                placeholder="Escribe tu consulta..."
                                placeholderTextColor={colors.textMuted}
                                value={inputMessage}
                                onChangeText={setInputMessage}
                                onSubmitEditing={handleSendMessage}
                                returnKeyType="send"
                            />
                            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                                <Ionicons name="send" size={18} color={colors.onAccent} />
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
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
                            color={colors.onAccent}
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
                            <TouchableWithoutFeedback onPress={() => { }}>
                                <View style={styles.modalContainer}>
                                    <Ionicons
                                        name={modalConfig.type === 'success' ? "checkmark-circle" : "alert-circle"}
                                        size={55}
                                        color={modalConfig.type === 'success' ? colors.primaryText : colors.error}
                                        style={{ marginBottom: SPACING.md }}
                                    />
                                    <Text style={styles.modalTitle}>{modalConfig.title}</Text>

                                    <View style={styles.contentBox}>
                                        <Text style={styles.modalMessage}>{modalConfig.message}</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.acceptModalButton, { backgroundColor: modalConfig.type === 'success' ? colors.accent : colors.error }]}
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

const createStyles = ({ colors }) =>
    StyleSheet.create({
        container: {
            padding: SPACING.lg,
            paddingBottom: 100,
            backgroundColor: colors.background,
        },
        sectionTitle: {
            fontFamily: FONTS.heading,
            fontSize: 18,
            color: colors.primaryText,
            fontWeight: 'bold',
            marginBottom: SPACING.md,
        },
        // Estilos FAQ (Acordeón)
        faqCard: {
            backgroundColor: colors.surface,
            borderRadius: RADIUS.md,
            marginBottom: SPACING.sm,
            borderWidth: 1,
            borderColor: colors.border,
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
            color: colors.text,
            fontWeight: '600',
            flex: 1,
            marginRight: SPACING.sm,
        },
        faqBody: {
            paddingHorizontal: SPACING.md,
            paddingBottom: SPACING.md,
            backgroundColor: colors.surfaceAlt,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: SPACING.sm,
        },
        faqAnswer: {
            fontFamily: FONTS.body,
            fontSize: 14,
            color: colors.textMuted,
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
            backgroundColor: colors.primary,
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
            bottom: 0, 
            backgroundColor: colors.surface,
            zIndex: 99,
            elevation: 10,
        },
        floatingChatHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: SPACING.lg,
            paddingVertical: 16,
            backgroundColor: colors.surfaceAlt,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
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
            color: colors.text,
        },
        closeChatButton: {
            padding: 4,
        },
        chatScroll: {
            flex: 1,
            backgroundColor: colors.surface,
        },
        chatBubble: {
            maxWidth: '80%',
            padding: SPACING.md,
            borderRadius: RADIUS.md,
            marginBottom: SPACING.sm,
        },
        userBubble: {
            backgroundColor: colors.accent,
            alignSelf: 'flex-end',
        },
        botBubble: {
            backgroundColor: colors.surfaceAlt,
            alignSelf: 'flex-start',
        },
        chatText: {
            fontFamily: FONTS.body,
            fontSize: 14,
        },
        userText: {
            color: colors.onAccent,
        },
        botText: {
            color: colors.text,
        },
        chatInputContainer: {
            flexDirection: 'row',
            padding: SPACING.md,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.surface,
            alignItems: 'center',
        },
        chatInput: {
            flex: 1,
            backgroundColor: colors.surfaceAlt,
            borderRadius: RADIUS.pill,
            paddingHorizontal: SPACING.md,
            height: 45,
            fontSize: 14,
            color: colors.text,
        },
        sendButton: {
            backgroundColor: colors.accent,
            justifyContent: 'center',
            alignItems: 'center',
            width: 42,
            height: 42,
            borderRadius: 21,
            marginLeft: SPACING.sm,
        },
        // Estilos Formulario de Contacto
        contactCard: {
            backgroundColor: colors.surface,
            borderRadius: RADIUS.lg,
            padding: SPACING.lg,
            borderWidth: 1,
            borderColor: colors.border,
            ...SHADOWS.card,
        },
        contactSubtitle: {
            fontFamily: FONTS.body,
            fontSize: 14,
            color: colors.textMuted,
            marginBottom: SPACING.md,
        },
        textArea: {
            backgroundColor: colors.surfaceAlt,
            borderRadius: RADIUS.md,
            padding: SPACING.md,
            height: 100,
            fontFamily: FONTS.body,
            fontSize: 14,
            color: colors.text,
            marginBottom: SPACING.md,
            borderWidth: 1,
            borderColor: colors.border,
        },
        submitButton: {
            backgroundColor: colors.accent,
            paddingVertical: 14,
            borderRadius: RADIUS.md,
            alignItems: 'center',
        },
        submitText: {
            color: colors.onAccent,
            fontFamily: FONTS.heading,
            fontSize: 15,
            fontWeight: 'bold',
        },
        // Estilos del Modal
        overlay: {
            flex: 1,
            backgroundColor: colors.overlay,
            justifyContent: 'center',
            alignItems: 'center',
            padding: SPACING.lg,
        },
        modalContainer: {
            backgroundColor: colors.surface,
            width: '100%',
            borderRadius: RADIUS.lg,
            padding: SPACING.xl,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
        },
        modalTitle: {
            fontFamily: FONTS.heading,
            fontSize: 22,
            color: colors.text,
            fontWeight: 'bold',
            marginBottom: SPACING.md,
            textAlign: 'center',
        },
        contentBox: {
            backgroundColor: colors.surfaceAlt,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: RADIUS.md,
            padding: SPACING.lg,
            marginBottom: SPACING.xl,
            width: '100%',
        },
        modalMessage: {
            fontFamily: FONTS.body,
            fontSize: 15,
            color: colors.text,
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
            color: colors.onAccent,
            fontFamily: FONTS.heading,
            fontSize: 16,
            fontWeight: 'bold',
        }
    });