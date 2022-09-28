import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button, FormControl, Input, Modal } from 'native-base';
import React, { useState } from 'react';



const ModalAddItem: React.FC = () => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)} avoidKeyboard justifyContent="center" bottom="4" size="lg">
            <Modal.Content>
                <Modal.CloseButton />
                <Modal.Header>Adicionar novo item</Modal.Header>
                <Modal.Body>
                    Digite o nome e preço.
                    <FormControl mt="3">
                        <FormControl.Label>Nome</FormControl.Label>
                        <Input />
                    </FormControl>
                    <FormControl mt="3">
                        <FormControl.Label>Preço</FormControl.Label>
                        <Input />
                    </FormControl>
                    <FormControl mt="3">
                        <FormControl.Label>Data</FormControl.Label>
                        <Input value={format(new Date(), 'P', { locale: ptBR })} />
                    </FormControl>
                </Modal.Body>
                <Modal.Footer>
                    <Button flex="1" onPress={() => {
                        setModalVisible(false);
                    }}>
                        Enviar
                    </Button>
                </Modal.Footer>
            </Modal.Content>
        </Modal>
    );
}

export default ModalAddItem;