import { Composition } from 'remotion';
import { Elenco, ElencoEsferas } from './Elenco';
import { Film } from './Film';
import { END, FPS } from './timeline';
import { VOZ } from './voz';

export const Root = () => (
  <>
    <Composition
      id="Filme"
      component={Film}
      durationInFrames={Math.round(END * FPS)}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{ legendas: true, voz: VOZ.length > 0, musica: false }}
    />
    {/* Folha com todo o elenco disponível (node tools/elenco.mjs) */}
    <Composition id="Elenco" component={Elenco} durationInFrames={1} fps={FPS} width={1920} height={1760} />
    {/* Elenco do estilo "E se...?" (node tools/elenco.mjs ElencoEsferas) */}
    <Composition id="ElencoEsferas" component={ElencoEsferas} durationInFrames={1} fps={FPS} width={1920} height={1500} />
  </>
);
