import { Composition } from 'remotion';
import { Elenco } from './Elenco';
import { Film } from './Film';
import { NovosPersonagens } from './NovosPersonagens';
import { PersonagensMina } from './PersonagensMina';
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
      defaultProps={{ legendas: false, voz: VOZ.length > 0, musica: false }}
    />
    {/* Folha com todo o elenco disponível (node tools/elenco.mjs) */}
    <Composition id="Elenco" component={Elenco} durationInFrames={1} fps={FPS} width={1920} height={1880} />
 <Composition id="NovosPersonagens" component={NovosPersonagens} durationInFrames={1} fps={FPS} width={1920} height={1920} />
    <Composition id="PersonagensMina" component={PersonagensMina} durationInFrames={1} fps={FPS} width={1920} height={1220} />
  </>
);
