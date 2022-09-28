import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Button, FlatList, HStack, Icon, IconButton, Modal, Pressable, Stack, Text, useDisclose, useToast, VStack } from 'native-base';
import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { VictoryChart, VictoryLabel, VictoryLine, VictoryTheme, VictoryZoomContainer } from 'victory-native';
import { itemsProps, useModalAddItem } from '../../Hooks/ModalAddItem';


const Home: React.FC = () => {
    const { handleOpenAddItem, handleOpenEditItem, handleDeleteItem, items } = useModalAddItem();
    const { isOpen, onClose, onOpen } = useDisclose();
    const [selectedItem, setSelectedItem] = useState<itemsProps>(null);
    const toast = useToast();
    const handleOpenModal = (item: itemsProps) => {
        if (item.historical.length > 1) {
            setSelectedItem(item)
            onOpen();
        } else {
            toast.show({ description: 'Você precisa ter mais de um histórico para visualizar o gráfico' })
        }
    }
    const handleCloseModal = () => {
        setSelectedItem(null)
        onClose();
    }
    return (
        <VStack px='4'>
            <Modal isOpen={isOpen} onClose={handleCloseModal}>
                <Modal.Content >
                    <Modal.CloseButton />
                    <Modal.Header>{selectedItem && selectedItem.name}</Modal.Header>
                    <Modal.Body>
                        {selectedItem && (
                            <VictoryChart
                                theme={VictoryTheme.material}
                                width={Dimensions.get('window').width / 4 * 3}
                                containerComponent={
                                    <VictoryZoomContainer />
                                }

                                maxDomain={{ y: Math.max(...selectedItem.historical.map(item => { return Number(item.price.replace('.', '').replace(',', '.')) })) * 1.1 }}
                                minDomain={{ y: Math.min(...selectedItem.historical.map(item => { return Number(item.price.replace('.', '').replace(',', '.')) })) / 1.1 }}
                            >
                                <VictoryLine
                                    labelComponent={<VictoryLabel renderInPortal dy={-20} />}

                                    interpolation="natural"

                                    animate={{
                                        duration: 2000,
                                        onLoad: { duration: 1000 }
                                    }}
                                    style={{
                                        data: {
                                            stroke: "#c43a31",
                                            strokeWidth: ({ data }) => data.length
                                        },

                                    }}
                                    data={
                                        selectedItem.historical.map(item => ({
                                            x: format(new Date(
                                                Date.UTC(
                                                    Number(item.date.split('/')[2]),
                                                    Number(item.date.split('/')[1]),
                                                    Number(item.date.split('/')[0])
                                                )
                                            ), 'dd/LL'), y: Number(item.price.replace('.', '').replace(',', '.'))
                                        }))
                                    }
                                />
                            </VictoryChart>

                        )}
                    </Modal.Body>

                </Modal.Content>
            </Modal>
            <Stack mb='4'>
                <Button
                    w="full"
                    endIcon={
                        <Icon as={Ionicons} name="add-circle-outline" size='sm' />
                    }
                    onPress={
                        handleOpenAddItem
                    }>
                    Adicionar novo Item
                </Button>
            </Stack>
            <FlatList
                data={items}
                keyExtractor={item => String(item.id)}
                ItemSeparatorComponent={() => <Stack h={'0.5'} bg='gray.100' />}
                renderItem={({ item }) => (
                    <HStack my='2' alignItems='center' justifyContent='space-between' >
                        <Pressable onPress={() => handleOpenModal(item)} flex='1'>
                            <Text>{item.name}</Text>
                            <Text>R$ {item.historical[item.historical.length - 1].price}</Text>
                        </Pressable>
                        <HStack alignItems='center' >
                            <Text>{item.historical[item.historical.length - 1].date}</Text>
                            <IconButton _icon={{ as: Ionicons, name: 'pencil' }} onPress={() => handleOpenEditItem(item)} />
                            <IconButton _icon={{ as: Ionicons, name: 'trash' }} onPress={() => handleDeleteItem(item.id)} />
                        </HStack>
                    </HStack>
                )}
            />
        </VStack>
    );
}

export default Home;