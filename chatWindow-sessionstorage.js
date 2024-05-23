import { useState, useEffect, useRef } from 'react';
import { Container, TextField, Button, List, ListItem, ListItemText, Paper, Box, CircularProgress } from '@mui/material';
import axios from 'axios';

const initializeSessionStorage = () => {
    if (!sessionStorage.getItem('chatMessages')) {
        const defaultMessages = [{ id: Date.now(), text: 'Hello Guest!', sender: 'ai' }];
        sessionStorage.setItem('chatMessages', JSON.stringify(defaultMessages));
    }
};

// Initialize session storage before component mounts
initializeSessionStorage();

function ChatWindow({ userData }) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState(() => {
        const savedMessages = sessionStorage.getItem('chatMessages');
        return savedMessages ? JSON.parse(savedMessages) : [{ id: Date.now(), text: `Hello ${userData?.name || 'Guest'}!`, sender: 'ai' }];
    });
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        sessionStorage.setItem('chatMessages', JSON.stringify(messages));
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;
        setIsLoading(true);
        const userMessage = { id: Date.now(), text: input, sender: 'user' };
        setMessages(messages => [...messages, userMessage]);

        try {
            const response = await axios.post('/api/chat', { input });
            const aiMessage = { id: Date.now(), text: response.data.message, sender: 'ai' };
            setMessages(messages => [...messages, aiMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(messages => [...messages, { id: Date.now(), text: 'Error getting response from the server.', sender: 'ai' }]);
        }

        setInput('');
        setIsLoading(false);
    };

    return (
        <Container maxWidth="lg" sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', mt: 2 }}>
            <Paper sx={{
                flexGrow: 1,
                overflow: 'a
