# Biblioteca de efeitos sonoros do estúdio, sintetizados em código (só numpy, nada baixado da internet).
#   python3 tools/sfx.py            -> grava public/sfx/*.wav
# Sons: passos (2 variações), tic, tac, queda, tum, pop, whoosh, splash, moeda, carimbo, ding,
#       e ambientes longos para tocar em loop: vento, chuva, passaros, mar, cidade, escritorio.
# Tudo é determinístico (semente fixa): rodar de novo gera os mesmos arquivos.
import os
import wave

import numpy as np

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'sfx')
R = np.random.default_rng(7)


def t_(d):
    return np.arange(int(d * SR)) / SR


def noise(d):
    return R.standard_normal(int(d * SR))


def band(x, lo=None, hi=None, tilt=0.0):
    """Filtro por FFT: mantém de lo a hi Hz (bordas suaves); tilt < 0 escurece (ruído rosa/marrom)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.ones_like(f)
    if lo:
        g *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi:
        g *= 1 / (1 + (f / hi) ** 4)
    if tilt:
        g *= np.maximum(f, 20) ** tilt
    return np.fft.irfft(X * g, len(x))


def env(d, a=0.003, decay=0.1):
    t = t_(d)
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / decay)


def norm(x, peak=0.9):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def fade(x, a=0.01, b=0.05):
    n = len(x)
    ia, ib = int(a * SR), int(b * SR)
    if ia:
        x[:ia] *= np.linspace(0, 1, ia)
    if ib:
        x[-ib:] *= np.linspace(1, 0, ib)
    return x


def loopable(x, cross=0.5):
    """Funde o fim no começo para o loop não dar estalo."""
    c = int(cross * SR)
    a = x[:c].copy()
    x = x[c:]
    x[-c:] = x[-c:] * np.linspace(1, 0, c) + a * np.linspace(0, 1, c)
    return x


def save(name, x, stereo_width=0.0):
    os.makedirs(OUT, exist_ok=True)
    x = np.clip(x, -1, 1)
    if stereo_width:
        d = int(0.012 * SR)
        l = x
        r = np.concatenate([x[d:], x[:d]]) * (1 - stereo_width) + x * stereo_width
        st = np.stack([l, r], 1)
    else:
        st = np.stack([x, x], 1)
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype('<i2').tobytes())
    print('public/sfx/' + name + '.wav')


def sine(f, d, f1=None):
    t = t_(d)
    ff = f if f1 is None else f * (f1 / f) ** (t / d)
    return np.sin(2 * np.pi * np.cumsum(ff) / SR)


# ---------------- impactos curtos
def passo(seed):
    r = np.random.default_rng(seed)
    d = 0.22
    heel = band(r.standard_normal(int(d * SR)), 60, 500) * env(d, 0.002, 0.03)
    body = sine(95 + seed * 7, d, 60) * env(d, 0.002, 0.04) * 0.8
    scuff = band(r.standard_normal(int(d * SR)), 1500, 6000) * env(d, 0.02, 0.05) * 0.25
    return norm(heel + body + scuff, 0.8)


def tic(f):
    d = 0.09
    click = band(noise(d), 2000, 7000) * env(d, 0.0005, 0.006)
    tone = sine(f, d) * env(d, 0.0005, 0.02) * 0.6
    return norm(click + tone, 0.7)


def queda():
    d = 0.7
    boom = sine(130, d, 45) * env(d, 0.003, 0.18)
    crash = band(noise(d), 80, 1800) * env(d, 0.002, 0.08) * 0.8
    rattle = band(noise(d), 1500, 5000) * env(d, 0.05, 0.12) * 0.15
    return norm(boom + crash + rattle, 0.9)


def tum():
    d = 0.9
    boom = sine(90, d, 35) * env(d, 0.002, 0.28)
    hit = band(noise(d), 40, 900) * env(d, 0.001, 0.06)
    return norm(boom * 1.2 + hit, 0.95)


def pop():
    d = 0.16
    return norm(sine(420, d, 1300) * env(d, 0.002, 0.04) + band(noise(d), 2000, 8000) * env(d, 0.0005, 0.004) * 0.3, 0.7)


def whoosh():
    """Ruído com filtro que sobe de grave para agudo, sem estalos (sobreposição de janelas)."""
    d = 0.7
    x = noise(d + 0.1)
    n, hop = 2048, 512
    win = np.hanning(n)
    out = np.zeros(len(x) + n)
    norm_w = np.zeros(len(x) + n)
    f = np.fft.rfftfreq(n, 1 / SR)
    frames = range(0, len(x) - n, hop)
    for k, i in enumerate(frames):
        fc = 300 * 8 ** (k / max(1, len(frames) - 1))
        g = np.exp(-0.5 * (np.log(np.maximum(f, 1) / fc) / 0.45) ** 2)
        seg = np.fft.irfft(np.fft.rfft(x[i:i + n] * win) * g, n)
        out[i:i + n] += seg * win
        norm_w[i:i + n] += win ** 2
    y = (out / np.maximum(norm_w, 1e-3))[: int(d * SR)]
    t = t_(d)
    return norm(y * np.sin(np.pi * t / d) ** 2, 0.7)


def splash():
    d = 1.4
    x = band(noise(d), 300, 9000) * env(d, 0.004, 0.18)
    bub = np.zeros(int(d * SR))
    for _ in range(40):
        s = int(R.uniform(0.05, 1.1) * SR)
        f = R.uniform(500, 2200)
        dd = R.uniform(0.02, 0.06)
        b = sine(f, dd, f * 1.5) * env(dd, 0.001, dd / 3)
        bub[s:s + len(b)] += b[: len(bub) - s] * R.uniform(0.1, 0.35)
    return norm(x + bub, 0.85)


def moeda():
    d = 0.8
    y = sum(sine(f, d) * env(d, 0.0005, dec) * a for f, dec, a in [(2793, 0.25, 1), (4120, 0.18, 0.7), (6280, 0.12, 0.45), (8100, 0.08, 0.3)])
    return norm(y, 0.6)


def carimbo():
    d = 0.35
    return norm(sine(160, d, 70) * env(d, 0.001, 0.05) + band(noise(d), 200, 3000) * env(d, 0.0005, 0.015) * 0.7, 0.85)


def ding():
    d = 1.6
    y = sum(sine(f, d) * env(d, 0.002, dec) * a for f, dec, a in [(1318, 0.7, 1), (2636, 0.4, 0.4), (3954, 0.25, 0.2)])
    return norm(y, 0.6)


# ---------------- ambientes (loops de 12 s)
def vento(d=12.5):
    t = t_(d)
    x = band(noise(d), 120, 1100, tilt=-0.5)
    gust = np.clip(0.6 + 0.4 * (np.sin(2 * np.pi * t / 4.1) * 0.5 + np.sin(2 * np.pi * t / 2.3 + 1) * 0.3 + 0.5), 0.5, 1.2)
    whistle = band(noise(d), 600, 1400) * 0.25 * np.clip(np.sin(2 * np.pi * t / 6.2), 0, 1)
    return loopable(norm(x * gust + whistle, 0.8))


def chuva(d=12.5):
    bed = band(noise(d), 700, 9000, tilt=-0.3) * 0.5
    drops = np.zeros(int(d * SR))
    for _ in range(int(d * 260)):
        s = int(R.uniform(0, d - 0.02) * SR)
        dd = 0.012
        k = band(R.standard_normal(int(dd * SR)), 1500, 9000) * env(dd, 0.0003, 0.003)
        drops[s:s + len(k)] += k * R.uniform(0.2, 1.0)
    return loopable(norm(bed + drops * 0.6, 0.8))


def passaros(d=12.5):
    y = band(noise(d), 200, 2000, tilt=-0.6) * 0.15
    for _ in range(26):
        s = R.uniform(0, d - 0.6)
        f0 = R.uniform(2500, 4200)
        for k in range(R.integers(2, 5)):
            dd = R.uniform(0.05, 0.11)
            c = sine(f0, dd, f0 * R.uniform(1.2, 1.6)) * np.sin(np.pi * t_(dd) / dd) ** 2
            i = int((s + k * 0.13) * SR)
            y[i:i + len(c)] += c * R.uniform(0.2, 0.45)
    return loopable(norm(y, 0.6))


def mar(d=12.5):
    t = t_(d)
    x = band(noise(d), 80, 3000, tilt=-0.4)
    waves = 0.35 + 0.65 * np.clip(np.sin(2 * np.pi * t / 5.5) * 0.6 + np.sin(2 * np.pi * t / 3.3 + 2) * 0.4, 0, 1) ** 1.5
    return loopable(norm(x * waves, 0.8))


def cidade(d=12.5):
    t = t_(d)
    rumble = band(noise(d), 40, 400, tilt=-0.5)
    hum = band(noise(d), 300, 2500, tilt=-0.3) * 0.3
    car = np.zeros_like(t)
    for c0 in [1.5, 5.2, 9.1]:
        car += np.exp(-((t - c0) / 1.1) ** 2)
    return loopable(norm(rumble * (0.6 + 0.6 * car) + hum, 0.6))


def escritorio(d=12.5):
    y = band(noise(d), 80, 600, tilt=-0.5) * 0.4  # ar-condicionado
    for _ in range(90):  # teclados ao longe
        s = int(R.uniform(0, d - 0.03) * SR)
        k = band(R.standard_normal(int(0.02 * SR)), 1500, 6000) * env(0.02, 0.0005, 0.004)
        y[s:s + len(k)] += k * R.uniform(0.05, 0.18)
    return loopable(norm(y, 0.5))


if __name__ == '__main__':
    save('passo1', passo(1))
    save('passo2', passo(2))
    save('tic', tic(2200))
    save('tac', tic(1500))
    save('queda', queda())
    save('tum', tum())
    save('pop', pop())
    save('whoosh', whoosh(), 0.3)
    save('splash', splash(), 0.4)
    save('moeda', moeda())
    save('carimbo', carimbo())
    save('ding', ding())
    save('vento', vento(), 0.5)
    save('chuva', chuva(), 0.6)
    save('passaros', passaros(), 0.5)
    save('mar', mar(), 0.5)
    save('cidade', cidade(), 0.5)
    save('escritorio', escritorio(), 0.4)
