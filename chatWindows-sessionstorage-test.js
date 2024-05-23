<ListGroup>
                        {messages.map(msg => (
                            <ListGroupItem key={msg.id} className="mb-1 px-1 py-2">
                                <Row className={msg.sender === 'ai' ? 'justify-content-start' : 'justify-content-end'}>
                                    {msg.sender === 'ai' && (
                                        <Col xs="1">
                                            <Card className="logo-next-line">
                                                <img src={nissanLogo} alt="Nissan Logo" className="small-logo" />
                                            </Card>
                                        </Col>
                                    )}
                                    <Col xs="10">
                                        <Card className={`mt-2 ${msg.sender === 'ai' ? 'bot-custom' : 'user-custom'}`}>
                                            <div className={msg.sender === 'ai' ? 'bot-custom-text' : 'user-custom-text'}>
                                                {msg.text}
                                            </div>
                                        </Card>
                                    </Col>
                                    {msg.sender === 'user' && (
                                        <Col xs="1">
                                            <Card className="logo-next-line">
                                                <img src={userAvatar} alt="User Avatar" className="small-logo" />
                                            </Card>
                                        </Col>
                                    )}
                                </Row>
                            </ListGroupItem>
                        ))}
                        <div ref={messagesEndRef} />
                    </ListGroup>
