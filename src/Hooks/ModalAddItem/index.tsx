import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button, FormControl, Input, InputGroup, InputLeftAddon, Modal, useDisclose, useToast } from 'native-base';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ModalAddItemProps {
    isOpen: boolean;
    onClose: () => void;
    handleOpenAddItem: () => void
    handleOpenEditItem: (item: itemsProps) => void
    handleDeleteItem: (_id: number) => Promise<void>

    items: itemsProps[];
}

const ModalAddItemContext = createContext({} as ModalAddItemProps);

interface ModalAddItemProviderProps {
    children: React.ReactNode;
}

export interface itemsProps {
    id: number;
    name: string;
    historical: {
        price: string;
        date: string;
    }[];
}

export const ModalAddItemProvider: React.FC<ModalAddItemProviderProps> = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclose();

    const [mode, setMode] = useState<'add' | 'edit'>('add');
    const [selectedItem, setSelectedItem] = useState<itemsProps | null>(null);
    const [items, setItems] = useState<itemsProps[]>([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [date, setDate] = useState(format(new Date(), 'P', { locale: ptBR }));
    const toast = useToast();

    const maskDate = (value: string) => {
        value = value.replace(/\D/g, '');
        value = value.replace(/^(\d{2})(\d)/, '$1/$2');
        value = value.replace(/(\d{2})(\d)/, '$1/$2');
        return value.substring(0, 10);
    };

    const maskPrice = (value: string) => {
        value = value.replace(/\D/g, '');
        value = value.replace(/(\d)(\d{2})$/, '$1,$2');
        value = value.replace(/(?=(\d{3})+(\D))\B/g, '.');
        return value;
    };

    useEffect(() => {
        async function loadItems() {
            const itemsStorage = await AsyncStorage.getItem('@items');
            if (itemsStorage) {
                setItems(JSON.parse(itemsStorage));
            }
        }
        loadItems();
    }, []);

    const handleChangeDate = (_date: string) => {
        setDate(maskDate(_date));
    }
    const handleChangePrice = (_price: string) => {
        setPrice(maskPrice(_price));
    }

    const addItem = () => {
        const data: itemsProps = {
            id: Math.random(),
            name,
            historical: [{
                price,
                date,
            }]
        };

        setItems([...items, data]);
    }

    const handleOpenAddItem = () => {
        setMode('add');
        onOpen();
    }

    const handleOpenEditItem = (item: itemsProps) => {
        setMode('edit');
        setSelectedItem(item);
        setName(item.name);
        setPrice(item.historical[item.historical.length - 1].price);
        setDate(item.historical[item.historical.length - 1].date);
        onOpen();
    }

    const handleEditItem = () => {
        const item = items.find(item => item.id === selectedItem.id);
        if (item) {
            item.name = name;
            if (
                item.historical[item.historical.length - 1].date !== date
            ) {
                item.historical.push({
                    price,
                    date,
                });
            } else {
                item.historical[item.historical.length - 1].price = price;
            }
        }
    }

    const handleDeleteItem = async (_id: number) => {
        const newItems = items.filter(item => item.id !== _id);
        await AsyncStorage.setItem('@items', JSON.stringify(newItems));
        setItems(newItems);
    }


    const handleSaveItem = () => {
        if (mode === 'add') {
            addItem();
        } else {
            const lastDate = selectedItem.historical[selectedItem.historical.length - 1].date;
            const day = (str: string) => Number(str.split('/')[0]);
            const month = (str: string) => Number(str.split('/')[1]);
            const year = (str: string) => Number(str.split('/')[2]);
            if (lastDate === date || isBefore(
                new Date(
                    Date.UTC(
                        year(lastDate),
                        month(lastDate),
                        day(lastDate))
                ),
                new Date(Date.UTC(
                    year(date),
                    month(date),
                    day(date))
                ))) {
                handleEditItem();
            } else {
                toast.show({ description: 'A data deve ser maior que a última data registrada.' });
                return;
            }
        }
        handleCloseModal();
    }

    //save items on async-storage
    const saveItems = async () => {
        try {
            await AsyncStorage.setItem('@items', JSON.stringify(items));
        } catch (error) {
            console.log(error);
        }
    }

    const handleCloseModal = () => {
        setName('');
        setPrice('');
        setMode('add');
        setDate(format(new Date(), 'P', { locale: ptBR }));
        saveItems();
        onClose();
    }

    return (
        <ModalAddItemContext.Provider value={{ isOpen, onClose, handleOpenAddItem, handleOpenEditItem, items, handleDeleteItem }}>

            <Modal isOpen={isOpen} onClose={handleCloseModal} avoidKeyboard bottom="4" size="lg">
                <Modal.Content>
                    <Modal.CloseButton />
                    <Modal.Header>Adicionar novo item</Modal.Header>
                    <Modal.Body>
                        Digite o nome e preço.
                        <FormControl mt="3">
                            <FormControl.Label>Nome</FormControl.Label>
                            <Input value={name} onChangeText={setName} />
                        </FormControl>
                        <FormControl mt="3">
                            <FormControl.Label>Preço</FormControl.Label>
                            <InputGroup>
                                <InputLeftAddon w={'20%'} children={"R$"} />
                                <Input
                                    w={"80%"}
                                    value={price}
                                    onChangeText={handleChangePrice}
                                    keyboardType='numeric'
                                />
                            </InputGroup>
                        </FormControl>
                        <FormControl mt="3">
                            <FormControl.Label>Data</FormControl.Label>
                            <Input value={date} onChangeText={handleChangeDate} />
                        </FormControl>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button flex="1" onPress={handleSaveItem}>
                            Enviar
                        </Button>
                    </Modal.Footer>
                </Modal.Content>
            </Modal>
            {children}
        </ModalAddItemContext.Provider >
    );
}

export const useModalAddItem = () => {
    return useContext(ModalAddItemContext);
}