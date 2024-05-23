import React, { useState, useEffect, useRef } from 'react';
import { Container, Input, Button, ListGroup, Card, CardBody, Spinner, Row, Col } from 'reactstrap';
import axios from 'axios';

function ChatWindow({ userData }) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([{ id: Date.now(), text: `Hello ${userData?.name || 'Guest'}!`, sender: 'ai' }]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
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
        <Container fluid className="d-flex flex-column vh-100 mt-2">
            <Card className="flex-grow-1 my-2 p-2 overflow-auto bg-white">
                <CardBody>
                    <ListGroup>
                        {messages.map(msg => (
                            <Row key={msg.id} className="mb-1">
                                <Col xs="1">
                                    <Card className="logo-next-line">
                                        <img src="/path/to/nissanlogo.png" alt="Nissan Logo" className="small-logo" />
                                    </Card>
                                </Col>
                                <Col xs="10">
                                    <Card className={`mt-2 ${msg.sender === 'user' ? 'user-custom' : 'bot-custom'}`}>
                                        <div className={`${msg.sender === 'user' ? 'user-custom-text' : 'bot-custom-text'}`}>
                                            {msg.text}
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        ))}
                        <div ref={messagesEndRef} />
                    </ListGroup>
                </CardBody>
            </Card>
            <Row className="align-items-center">
                <Col>
                    <Input
                        type="text"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="bg-white text-dark"
                    />
                </Col>
                <Col xs="auto">
                    <Button color="primary" onClick={handleSendMessage} disabled={isLoading}>
                        {isLoading ? <Spinner size="sm" /> : 'Send'}
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

export default ChatWindow;
