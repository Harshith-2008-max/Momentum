// Haptics gated by the user's setting.
import * as H from "expo-haptics";
import { fx } from "./fx";
export const ImpactFeedbackStyle = H.ImpactFeedbackStyle;
export const NotificationFeedbackType = H.NotificationFeedbackType;
export const impactAsync = (s: H.ImpactFeedbackStyle) => (fx.haptics ? H.impactAsync(s) : Promise.resolve());
export const notificationAsync = (t: H.NotificationFeedbackType) => (fx.haptics ? H.notificationAsync(t) : Promise.resolve());
export const selectionAsync = () => (fx.haptics ? H.selectionAsync() : Promise.resolve());
