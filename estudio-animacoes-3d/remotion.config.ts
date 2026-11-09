import { Config } from '@remotion/cli/config';

// WebGL: 'angle' (padrão, usa a placa de vídeo). Em máquinas sem placa de vídeo (servidores, nuvem),
// defina REMOTION_GL=swangle antes de renderizar — desenha o 3D por software (mais lento, mesmo resultado).
Config.setChromiumOpenGlRenderer((process.env.REMOTION_GL as 'angle' | 'swangle' | 'egl' | 'swiftshader') || 'angle');
// Se o navegador que o Remotion baixa sozinho não abrir (ex.: Windows com caminho de pasta muito longo),
// aponte para o Chrome instalado: defina a variável CHROME_PATH antes de renderizar.
if (process.env.CHROME_PATH) Config.setBrowserExecutable(process.env.CHROME_PATH);
