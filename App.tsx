import { StatusBar } from 'expo-status-bar';
import { NativeBaseProvider } from 'native-base';
import { ModalAddItemProvider } from './src/Hooks/ModalAddItem';
import Home from './src/pages/Home';

export default function App() {


  return (
    <NativeBaseProvider>
      <StatusBar style="dark" backgroundColor="transparent" translucent={false} />
      <ModalAddItemProvider>
        <Home />
      </ModalAddItemProvider>
    </NativeBaseProvider>
  );
}
