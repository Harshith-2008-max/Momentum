"""Generates the five sound effects in assets/sfx (no third-party audio is used). Run: python3 scripts/make_sfx.py"""
import math, os, random, struct, wave
R = 22050
os.makedirs("assets/sfx", exist_ok=True)
def save(name, samples):
    with wave.open(f"assets/sfx/{name}.wav", "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(R)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, s)) * 32000)) for s in samples))
def tone(f, d, vol=0.5, decay=6, f2=None):
    n = int(R * d); out = []
    for i in range(n):
        t = i / R; fr = f if f2 is None else f + (f2 - f) * (i / n)
        out.append(math.sin(2 * math.pi * fr * t) * vol * math.exp(-decay * t) * min(1, i / 200))
    return out
seq = lambda *p: [x for part in p for x in part]
save("tick", tone(880, 0.09, 0.5, 30)); save("go", tone(600, 0.35, 0.5, 3, f2=1300))
save("chime", seq(*[tone(f, 0.22, 0.45, 4) for f in (523, 659, 784)], tone(1047, 0.7, 0.45, 3.5)))
save("win", seq(tone(392, 0.15, 0.45, 5), tone(523, 0.15, 0.45, 5), tone(784, 0.6, 0.5, 3)))
random.seed(1)
save("crash", [(random.uniform(-1, 1) * 0.6 + math.sin(2 * math.pi * 70 * i / R) * 0.4) * math.exp(-6 * i / R) for i in range(int(R * 0.6))])
