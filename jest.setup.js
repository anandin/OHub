// In-memory AsyncStorage. The official mock is a jest-managed module; a plain
// Map keeps each test's storage state explicit and inspectable.
jest.mock("@react-native-async-storage/async-storage", () => {
  const store = new Map();
  return {
    __store: store,
    getItem: jest.fn(async (key) => (store.has(key) ? store.get(key) : null)),
    setItem: jest.fn(async (key, value) => {
      store.set(key, value);
    }),
    removeItem: jest.fn(async (key) => {
      store.delete(key);
    }),
    multiRemove: jest.fn(async (keys) => {
      keys.forEach((key) => store.delete(key));
    }),
    clear: jest.fn(async () => {
      store.clear();
    }),
  };
});

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(async () => {}),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
}));

beforeEach(() => {
  require("@react-native-async-storage/async-storage").__store.clear();
});
