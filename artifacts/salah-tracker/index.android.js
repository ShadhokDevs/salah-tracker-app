const { registerWidgetTaskHandler } = require("react-native-android-widget");
const { widgetTaskHandler } = require("./widgets/widgetTaskHandler");

registerWidgetTaskHandler(widgetTaskHandler);

require("expo-router/entry");
