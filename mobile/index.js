import { enableScreens } from 'react-native-screens';

// BlueStacks gibi eski Android ortamlarında native screens uyumsuzluğunu önler
// "java.lang.String cannot be cast to java.lang.Boolean" hatasını çözer
enableScreens(false);

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
