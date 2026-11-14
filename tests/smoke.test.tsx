import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
jest.mock("react-native-safe-area-context", () => require("react-native-safe-area-context/jest/mock").default);
jest.mock("expo-video", () => ({ useVideoPlayer: () => ({ play() {} }), VideoView: () => null }));
jest.mock("expo-audio", () => ({ createAudioPlayer: () => ({ seekTo() {}, play() {} }) }));
jest.mock("expo-keep-awake", () => ({ activateKeepAwakeAsync: async () => {}, deactivateKeepAwake: () => {} }));
jest.mock("@react-native-async-storage/async-storage", () => require("@react-native-async-storage/async-storage/jest/async-storage-mock"));
jest.mock("expo-haptics", () => ({ impactAsync: async () => {}, notificationAsync: async () => {}, selectionAsync: async () => {}, ImpactFeedbackStyle: { Light: 0, Medium: 1 }, NotificationFeedbackType: { Success: 0, Error: 1 } }));
(global as any).fetch = jest.fn(async () => ({ ok: false, json: async () => ({}) }));
import { AccessibilityInfo } from "react-native";
import App from "../App";
beforeAll(() => { jest.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(true); });

test("welcome -> home -> plan -> countdown -> flow -> finish -> done", async () => {
  jest.useFakeTimers();
  const r = await render(<App />);
  await waitFor(() => r.getByText("Welcome, astronaut!"));
  await fireEvent.changeText(r.getByPlaceholderText("Your name"), "Harshith");
  await fireEvent.press(r.getByText("Blast off 🚀"));
  await act(async () => { jest.advanceTimersByTime(100); });
  const txt = (n: any): string[] => !n ? [] : typeof n === "string" ? [n] : Array.isArray(n) ? n.flatMap(txt) : txt(n.children);
  await waitFor(() => r.getByText(/Hi Harshith/));
  await fireEvent.press(r.getByText("Moon Landing"));
  await waitFor(() => r.getByDisplayValue("Study the Moon fact card"));
  expect(r.getByText(/7 micro-tasks/)).toBeTruthy();
  await fireEvent.press(r.getByText("START"));
  await waitFor(() => r.getByText("3"));
  for (let k = 0; k < 4; k++) await act(async () => { jest.advanceTimersByTime(850); });
  await waitFor(() => r.getByText("Pause"));
  await act(async () => { jest.advanceTimersByTime(3 * 60 * 1000); });
  await waitFor(() => r.getByText("Step complete"));
  r.getByText(/\+3 ⭐ earned/);
});

test("outpost: pick world -> event -> orders -> end day -> debrief after 14 days", async () => {
  jest.useFakeTimers();
  const r = await render(<App />);
  await waitFor(() => r.getByText(/Welcome|Hi /));
  const welcome = r.queryByText("Welcome, astronaut!");
  if (welcome) { await fireEvent.changeText(r.getByPlaceholderText("Your name"), "Ava"); await fireEvent.press(r.getByText("Blast off 🚀")); }
  await waitFor(() => r.getByText(/Outpost Command/));
  await fireEvent.press(r.getByText(/🛰️ Outpost Command/));
  await waitFor(() => r.getByText("Run a space outpost"));
  await fireEvent.press(r.getByText("Moon base (south pole)"));
  await waitFor(() => r.getByText(/Launch weight left: 0 \/ 10/));
  await fireEvent.press(r.getAllByText("−")[0]);
  r.getByText(/Launch weight left: 1 \/ 10/);
  await fireEvent.press(r.getAllByText("+")[0]);
  r.getByText(/Launch weight left: 0 \/ 10/);
  await waitFor(() => r.getByText(/Launch weight left/));
  await fireEvent.press(r.getByText(/Launch! 🚀/));
  await waitFor(() => r.getByText(/Day 1\/14/));
  r.getByText(/HOW TO PLAY · 1 OF 4/);
  r.getByText(/Air & water/);
  for (let d = 0; d < 14; d++) {
    // resolve an event card if one is showing
    const ev = r.queryAllByText(/: /).find((n: any) => /\+\d+ food|Almost no storm|Patch it now|Medicine|plan ahead|Food crate/.test(String(n.props.children)));
    if (ev) await fireEvent.press(ev);
    await fireEvent.press(r.getByText("🔬 Run science"));
    await fireEvent.press(r.getByText("End day ▶"));
  }
  await waitFor(() => r.getByText(/MISSION DEBRIEF/));
  expect(r.getByText(/THE REAL NASA SCIENCE/)).toBeTruthy();
  // What-if rewind returns to an earlier event day
  await fireEvent.press(r.getByText(/Day 3: 📦/));
  await waitFor(() => r.getByText(/Day 3\/14/));
  expect(r.getByText(/Cargo lander arrives/)).toBeTruthy();
  await fireEvent.press(r.getByText("Quit mission"));
  await waitFor(() => r.getByText(/TODAY’S DAILY CHALLENGE/));
  expect(r.getByText(/Badges \d+\/12/)).toBeTruthy();
});


test("new features: learning check, class code join, crew mode, teacher mode", async () => {
  jest.useFakeTimers();
  const r = await render(<App />);
  await waitFor(() => r.getByText(/Welcome|Hi /));
  if (r.queryByText("Welcome, astronaut!")) { await fireEvent.changeText(r.getByPlaceholderText("Your name"), "Ava"); await fireEvent.press(r.getByText("Blast off 🚀")); }
  await fireEvent.press(await waitFor(() => r.getByText(/🛰️ Outpost Command/)));
  await waitFor(() => r.getByText("Run a space outpost"));
  // learning check: answer 5 questions (always the first option) and save
  await fireEvent.press(r.getByText("Start the before-check"));
  for (let q = 0; q < 5; q++) {
    await waitFor(() => r.getByText(new RegExp(`QUESTION ${q + 1} OF 5`)));
    await fireEvent.press(r.getAllByRole("button")[0]);
    await fireEvent.press(await waitFor(() => r.getByText(q < 4 ? "Next question" : "See my score")));
  }
  await fireEvent.press(await waitFor(() => r.getByText("Save and continue")));
  await waitFor(() => r.getByText(/Before: \d\/5/));
  // bad class code is rejected, good one starts a crew mission
  await fireEvent.changeText(r.getByPlaceholderText("e.g. LBC7QX"), "ZZZ");
  await fireEvent.press(r.getByText("Join class mission"));
  r.getByText("That code does not look right.");
  await fireEvent.changeText(r.getByPlaceholderText("e.g. LBC7QX"), "LBC7QX");
  await fireEvent.press(r.getByText("Join class mission"));
  await waitFor(() => r.getByText(/Launch weight left/));
  await fireEvent.press(r.getByText(/Launch! 🚀/));
  await waitFor(() => r.getByText(/Day 1\/14/));
  r.getByText(/PASS THE PHONE TO/);
  await fireEvent.press(r.getByText(/Clean solar panels/));
  await fireEvent.press(r.getByText("Lock in ✔"));
  await fireEvent.press(await waitFor(() => r.getByText("Lock in ✔")));
  await fireEvent.press(await waitFor(() => r.getByText("Lock in ✔")));
  await fireEvent.press(await waitFor(() => r.getByText("End day ▶")));
  await waitFor(() => r.getByText(/Day 2\/14/));
  await fireEvent.press(r.getByText("Quit mission"));
  await fireEvent.press(await waitFor(() => r.getByText(/Teacher mode/)));
  await fireEvent.press(await waitFor(() => r.getByText("Generate class code")));
  await fireEvent.changeText(r.getByPlaceholderText("OC1|..."), "OC1|LBC7QX|Ava|78|win||2|4\nOC1|LBC7QX|Ben|30|lose|a power blackout|3|3");
  await waitFor(() => r.getByText(/2 students · average 54\/100 · 50% passed/));
  r.getByText(/Average learning gain/);
});


test("mission history: play the Opportunity scenario to the end and see what really happened", async () => {
  jest.useFakeTimers();
  const r = await render(<App />);
  await waitFor(() => r.getByText(/Welcome|Hi /));
  if (r.queryByText("Welcome, astronaut!")) { await fireEvent.changeText(r.getByPlaceholderText("Your name"), "Ava"); await fireEvent.press(r.getByText("Blast off 🚀")); }
  await fireEvent.press(await waitFor(() => r.getByText(/🛰️ Outpost Command/)));
  await waitFor(() => r.getByText(/MISSION HISTORY/));
  r.getByText(/The Opportunity Dust Storm \(2018\)/);
  await fireEvent.press(r.getAllByText(/^Play ·/)[0]);
  await waitFor(() => r.getByText(/Launch weight left/));
  await fireEvent.press(r.getByText(/Launch! 🚀/));
  await waitFor(() => r.getByText(/Day 1\/14/));
  r.getByText(/A planet-wide dust storm is blocking the Sun for 6 days/);
  for (let d = 0; d < 14 && !r.queryByText(/MISSION DEBRIEF/); d++) {
    const ev = r.queryAllByText(/: /).find((n: any) => /\+\d+ food|Patch it now|Medicine/.test(String(n.props.children)));
    if (ev) await fireEvent.press(ev);
    await fireEvent.press(r.getByText("End day ▶"));
  }
  await waitFor(() => r.getByText(/MISSION DEBRIEF/));
  r.getByText(/WHAT REALLY HAPPENED · NASA\/JPL/);
  r.getByText(/June 10, 2018/);
});
